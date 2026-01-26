import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useOutletContext, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Settings2, Edit2, Eye, Grid, Search } from "lucide-react";
import GerenciarModulosTitular from "./GerenciarModulosTitular";
import NovoTitularDialog from "./NovoTitularDialog";
import EditTitularDialog from "./EditTitularDialog";

interface UsuarioTabela {
    id: string;
    nome: string;
    email: string;
    cpf?: string | null;
    role: string;
    status?: string | null;
    modulos?: string[];
}

export default function AdminParceiroDashboard() {
    const { userProfile } = useOutletContext<{ userProfile?: any }>();
    const parceiroId = userProfile?.parceiro_id || null;
    const navigate = useNavigate();

    const [usuarios, setUsuarios] = useState<UsuarioTabela[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsuario, setSelectedUsuario] = useState<{ id: string; nome: string } | null>(null);
    const [showModulos, setShowModulos] = useState(false);
    const [showNovoTitular, setShowNovoTitular] = useState(false);
    const [showEdit, setShowEdit] = useState(false);
    const [editingTitularId, setEditingTitularId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);

    useEffect(() => {
        if (parceiroId) {
            fetchUsuarios();
        } else {
            setLoading(false);
        }
    }, [parceiroId, page, searchTerm]);

    async function fetchUsuarios() {
        if (!parceiroId) {
            console.error("Erro: parceiroId não encontrado no perfil do usuário.");
            setLoading(false);
            return;
        }

        setLoading(true);
        console.log("fetchUsuarios -> parceiro:", parceiroId, "page:", page, "search:", searchTerm);

        try {
            const from = (page - 1) * pageSize;
            const to = page * pageSize - 1;

            // 1) Se houver termo de busca, buscar titulares que batem no nome/email
            let titularFilterIds: string[] = [];
            if (searchTerm && searchTerm.trim()) {
                const q = `%${searchTerm.trim()}%`;
                const { data: foundTitulares, error: tErr } = await supabase
                    .from("titulares")
                    .select("id")
                    .or(`nome.ilike.${q},email.ilike.${q}`);

                if (tErr) {
                    console.warn("Busca titulares (filtro) retornou erro:", tErr);
                    // continuar sem filtro (vai devolver tudo do parceiro)
                } else {
                    titularFilterIds = (foundTitulares || []).map((t: any) => t.id);
                    console.log("titularFilterIds:", titularFilterIds);
                }
            }

            // 2) Se o termo de busca existia e nenhum titular bateu, retorna vazio rápido
            if (searchTerm && searchTerm.trim() && titularFilterIds.length === 0) {
                setUsuarios([]);
                setTotalCount(0);
                setLoading(false);
                return;
            }

            // 3) Buscar vínculos em usuarios_app (não pedimos email aqui)
            let query = supabase
                .from("usuarios_app")
                .select("id, auth_id, role, titular_id, parceiro_id, status", { count: "exact" })
                .eq("parceiro_id", parceiroId)
                .order("criado_em", { ascending: false });

            if (titularFilterIds.length > 0) {
                query = query.in("titular_id", titularFilterIds);
            }

            query = query.range(from, to);

            const { data: vinculos, error: vinculosErr, count } = await query as {
                data: UsuarioTabela[] | null;
                error: any;
                count: number | null;
            };
            
            if (vinculosErr) throw vinculosErr;

            setTotalCount(typeof count === "number" ? count : (vinculos ? vinculos.length : 0));

            // 4) Extrair titular_ids válidos e buscar dados em 'titulares'
            const titularIds = (vinculos || [])
                .filter((v: any) => v.role === "titular" && v.titular_id)
                .map((v: any) => v.titular_id);

            const titularesMap = new Map<string, any>();
            if (titularIds.length > 0) {
                const { data: tData, error: tErr } = await supabase
                    .from("titulares")
                    .select("id, nome, cpf, email")
                    .in("id", titularIds);

                if (tErr) {
                    console.error("Erro buscando titulares:", tErr);
                } else {
                    (tData || []).forEach((t: any) => titularesMap.set(t.id, t));
                }
            }

            // 5) Montar lista final para UI
            const lista = (vinculos || []).map((v: any) => {
                if (v.role === "titular") {
                    const t = titularesMap.get(v.titular_id);
                    return {
                        id: t?.id || v.id,
                        nome: t?.nome || "Titular não encontrado",
                        email: t?.email || "-",
                        cpf: t?.cpf || "-",
                        role: "titular",
                        status: v.status,
                        modulos: [] // preencher se necessário (buscar titular_modulos separadamente)
                    } as UsuarioTabela;
                } else {
                    return {
                        id: v.id,
                        nome: "Administrador da Clínica",
                        email: "Acesso Administrativo",
                        role: "parceiro_admin",
                        status: v.status,
                        modulos: ["Gestão"]
                    } as UsuarioTabela;
                }
            });

            setUsuarios(lista);
        } catch (err: any) {
            console.error("Erro fetchUsuarios:", err);
        } finally {
            setLoading(false);
        }
    }

    // FUNÇÃO QUE ESTAVA DANDO ERRO DE "NOT FOUND"
    function abrirEdicao(id: string) {
        setEditingTitularId(id);
        setShowEdit(true);
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">Meus Clientes</h1>
                    <p className="text-sm text-[#6b8c7d]">Gerencie os acessos e jornadas dos seus pacientes.</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9db4aa]" />
                        <input
                            type="text"
                            placeholder="Buscar cliente..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[#d1e5dc] bg-white/50 focus:bg-white focus:ring-2 focus:ring-[#5ba58c] outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        className="bg-[#5ba58c] hover:bg-[#4a8a75] text-white rounded-xl shadow-sm"
                        onClick={() => setShowNovoTitular(true)}
                    >
                        <Plus className="h-4 w-4 mr-2" /> Novo Cliente
                    </Button>
                    <Button
                        variant="outline"
                        className="border-[#d1e5dc] text-[#255f4f] hover:bg-[#f4fbf8] rounded-xl"
                        onClick={() => navigate("/legado-app/selecao-modulos")}
                    >
                        <Grid className="mr-2 h-4 w-4" /> Módulos
                    </Button>
                </div>
            </div>

            <Card className="border-[#d1e5dc] shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="bg-white/50 border-b border-[#f0f7f4]">
                    <CardTitle className="text-lg font-bold text-[#255f4f] flex items-center gap-2">
                        <Users className="h-5 w-5 text-[#5ba58c]" />
                        Lista de Usuários
                        <Badge className="ml-auto bg-[#e3f1eb] text-[#255f4f] hover:bg-[#e3f1eb] border-none">
                            {totalCount} total
                        </Badge>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-3">
                            <div className="h-8 w-8 border-4 border-[#5ba58c] border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-[#6b8c7d] font-medium">Carregando dados...</p>
                        </div>
                    ) : usuarios.length === 0 ? (
                        <div className="text-center py-20">
                            <Users className="h-12 w-12 text-[#d1e5dc] mx-auto mb-3" />
                            <p className="text-[#6b8c7d]">Nenhum cliente encontrado.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader className="bg-[#f8fcfb]">
                                    <TableRow className="border-[#f0f7f4] hover:bg-transparent">
                                        <TableHead className="text-[#6b8c7d] font-bold uppercase text-[10px] tracking-wider">Nome</TableHead>
                                        <TableHead className="text-[#6b8c7d] font-bold uppercase text-[10px] tracking-wider">CPF / E-mail</TableHead>
                                        <TableHead className="text-[#6b8c7d] font-bold uppercase text-[10px] tracking-wider">Jornadas Ativas</TableHead>
                                        <TableHead className="text-right text-[#6b8c7d] font-bold uppercase text-[10px] tracking-wider">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {usuarios.map((usuario) => (
                                        <TableRow key={usuario.id} className="border-[#f0f7f4] hover:bg-[#f4fbf8] transition-colors group">
                                            <TableCell>
                                                <div className="font-bold text-[#255f4f]">{usuario.nome}</div>
                                                <div className="text-[10px] text-[#5ba58c] font-bold uppercase tracking-tight">{usuario.role}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm text-[#4f665a]">{usuario.cpf || "---"}</div>
                                                <div className="text-xs text-[#9db4aa]">{usuario.email}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {usuario.modulos?.map((m) => (
                                                        <Badge key={m} className="bg-white text-[#5ba58c] border border-[#d1e5dc] text-[10px] font-bold">
                                                            {m}
                                                        </Badge>
                                                    ))}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-1">
                                                    {usuario.role === "titular" && (
                                                        <>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-[#5ba58c] hover:bg-[#e3f1eb] rounded-lg"
                                                                onClick={() => {
                                                                    setSelectedUsuario({ id: usuario.id, nome: usuario.nome });
                                                                    setShowModulos(true);
                                                                }}
                                                            >
                                                                <Settings2 className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-[#5ba58c] hover:bg-[#e3f1eb] rounded-lg"
                                                                onClick={() => abrirEdicao(usuario.id)}
                                                            >
                                                                <Edit2 className="h-4 w-4" />
                                                            </Button>
                                                        </>
                                                    )}
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-[#9db4aa] hover:bg-[#f4fbf8] rounded-lg"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}
                </CardContent>

                {!loading && totalCount > pageSize && (
                    <div className="p-4 border-t border-[#f0f7f4] bg-white/50 flex items-center justify-between">
                        <p className="text-xs text-[#6b8c7d]">
                            Mostrando <span className="font-bold text-[#255f4f]">{usuarios.length}</span> de <span className="font-bold text-[#255f4f]">{totalCount}</span> clientes
                        </p>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-[#d1e5dc] text-[#255f4f]"
                                disabled={page === 1}
                                onClick={() => setPage(p => p - 1)}
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg border-[#d1e5dc] text-[#255f4f]"
                                disabled={page >= Math.ceil(totalCount / pageSize)}
                                onClick={() => setPage(p => p + 1)}
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </Card>

            <GerenciarModulosTitular
                titularId={selectedUsuario?.id || null}
                titularNome={selectedUsuario?.nome || ""}
                parceiroId={parceiroId}
                open={showModulos}
                onClose={() => setShowModulos(false)}
                refresh={fetchUsuarios}
            />

            <NovoTitularDialog
                open={showNovoTitular}
                onClose={() => setShowNovoTitular(false)}
                parceiroId={parceiroId}
                refresh={fetchUsuarios}
            />

            <EditTitularDialog
                open={showEdit}
                onClose={() => setShowEdit(false)}
                titularId={editingTitularId}
                parceiroId={parceiroId}
                refresh={fetchUsuarios}
            />
        </div>
    );
}