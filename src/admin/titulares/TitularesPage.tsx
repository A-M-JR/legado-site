import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserCog, Mail, Building2, Shield } from "lucide-react";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import GerenciarUsuario from "./GerenciarUsuario";
import { toast } from "@/hooks/use-toast";
import NovoTitularDialog from "./NovoTitularDialog";

interface Linha {
    auth_id: string;
    email: string;
    nome: string;
    titular_id: string;
    parceiro_id: string | null;
    parceiro_nome: string | null;
    role: string | null;
}

export default function TitularesPage() {
    const [usuarios, setUsuarios] = useState<Linha[]>([]);
    const [parceiros, setParceiros] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [busca, setBusca] = useState("");
    const [filtroRole, setFiltroRole] = useState<string>("todos");
    const [filtroParceiro, setFiltroParceiro] = useState<string>("todos");
    const [showNovoTitular, setShowNovoTitular] = useState(false);
    const [selectedUser, setSelectedUser] = useState<Linha | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        fetchUsuarios();
        fetchParceiros();
    }, []);

    async function fetchParceiros() {
        const { data } = await supabase
            .from("parceiros")
            .select("id, nome")
            .order("nome");

        if (data) setParceiros(data);
    }

    async function fetchUsuarios() {
        setLoading(true);

        const { data, error } = await supabase.rpc("get_usuarios_com_email");

        if (error) {
            toast({
                title: "Erro ao carregar usuários",
                description: error.message,
                variant: "destructive",
            });
            setLoading(false);
            return;
        }

        const lista = data.map((item: any) => ({
            auth_id: item.auth_id,
            email: item.email,
            nome: item.titular_nome || "-",
            titular_id: item.titular_id,
            parceiro_id: item.parceiro_id,
            parceiro_nome: item.parceiro_nome,
            role: item.role,
        }));

        setUsuarios(lista);
        setLoading(false);
    }

    // 🔎 Filtros combinados
    const usuariosFiltrados = usuarios.filter((u) => {
        const matchBusca =
            u.nome.toLowerCase().includes(busca.toLowerCase()) ||
            u.email.toLowerCase().includes(busca.toLowerCase());

        const matchRole =
            filtroRole === "todos" ||
            (filtroRole === "admin" && u.role === "admin_master") ||
            (filtroRole === "parceiro" && u.role === "parceiro_admin") ||
            (filtroRole === "titular" && u.role === "titular") ||
            (filtroRole === "familiar" && u.role === "familiar");

        const matchParceiro =
            filtroParceiro === "todos" ||
            (filtroParceiro === "none" && !u.parceiro_id) ||
            u.parceiro_id === filtroParceiro;

        return matchBusca && matchRole && matchParceiro;
    });

    function getRoleBadge(role: string | null) {
        const badges: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
            admin_master: { label: "🔑 Admin Master", variant: "default" },
            parceiro_admin: { label: "🏢 Parceiro", variant: "secondary" },
            titular: { label: "👤 Titular", variant: "outline" },
            familiar: { label: "👨‍👩‍👧 Familiar", variant: "outline" },
        };
        return badges[role || ""] || { label: role || "-", variant: "outline" };
    }

    // 📱 VERSÃO MOBILE: Cards
    const CardsUsuarios = ({ usuarios }: { usuarios: Linha[] }) => (
        <div className="space-y-3">
            {usuarios.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                    <p>Nenhum usuário encontrado</p>
                </div>
            ) : (
                usuarios.map((u) => {
                    const badge = getRoleBadge(u.role);
                    return (
                        <Card key={u.auth_id} className="hover:shadow-md transition">
                            <CardContent className="p-4">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-semibold text-base truncate">{u.nome}</h4>
                                        <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                                            <Mail className="h-3.5 w-3.5 flex-shrink-0" />
                                            <span className="truncate">{u.email}</span>
                                        </div>
                                        {u.parceiro_nome && (
                                            <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                                                <Building2 className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span className="truncate">{u.parceiro_nome}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1.5 mt-2">
                                            <Badge variant={badge.variant} className="text-xs">
                                                {badge.label}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setOpenDialog(true);
                                        }}
                                        className="flex-shrink-0"
                                    >
                                        <UserCog className="h-4 w-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })
            )}
        </div>
    );

    // 🖥️ VERSÃO DESKTOP: Tabela
    const TabelaUsuarios = ({ usuarios }: { usuarios: Linha[] }) => (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>E-mail</TableHead>
                    <TableHead>Parceiro</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>

            <TableBody>
                {usuarios.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-500 py-10">
                            Nenhum usuário encontrado
                        </TableCell>
                    </TableRow>
                ) : (
                    usuarios.map((u) => {
                        const badge = getRoleBadge(u.role);
                        return (
                            <TableRow key={u.auth_id}>
                                <TableCell className="font-medium">{u.nome}</TableCell>
                                <TableCell>{u.email}</TableCell>
                                <TableCell>{u.parceiro_nome || "-"}</TableCell>
                                <TableCell>
                                    <Badge variant={badge.variant}>{badge.label}</Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                            setSelectedUser(u);
                                            setOpenDialog(true);
                                        }}
                                    >
                                        <UserCog className="h-4 w-4 mr-2" />
                                        Editar
                                    </Button>
                                </TableCell>
                            </TableRow>
                        );
                    })
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            {/* Cabeçalho + Botão Novo */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold">Gestão de Usuários</h1>
                    <p className="text-gray-600 text-sm sm:text-base mt-1">
                        Gerencie usuários, roles e vínculos.
                    </p>
                </div>

                <Button onClick={() => setShowNovoTitular(true)} className="w-full sm:w-auto">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Titular
                </Button>
            </div>

            {/* Barra de Busca + Filtros */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Busca */}
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome ou e-mail..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        className="pl-10"
                    />
                </div>

                {/* Filtro parceiro */}
                <Select value={filtroParceiro} onValueChange={setFiltroParceiro}>
                    <SelectTrigger className="w-full sm:w-[220px]">
                        <SelectValue placeholder="Filtrar por parceiro" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="todos">Todos os parceiros</SelectItem>
                        <SelectItem value="none">Sem parceiro</SelectItem>
                        {parceiros.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                                {p.nome}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Lista de Usuários
                    </CardTitle>
                </CardHeader>

                <CardContent className="p-3 sm:p-6">
                    {loading ? (
                        <p className="text-center py-10 text-gray-400">Carregando...</p>
                    ) : (
                        <Tabs defaultValue="todos" onValueChange={setFiltroRole}>
                            <TabsList className="mb-4 grid grid-cols-5 w-full h-auto">
                                <TabsTrigger value="todos" className="text-xs sm:text-sm px-2 py-2">
                                    Todos
                                </TabsTrigger>
                                <TabsTrigger value="admin" className="text-xs sm:text-sm px-2 py-2">
                                    Admin
                                </TabsTrigger>
                                <TabsTrigger value="parceiro" className="text-xs sm:text-sm px-2 py-2">
                                    Parceiros
                                </TabsTrigger>
                                <TabsTrigger value="titular" className="text-xs sm:text-sm px-2 py-2">
                                    Titulares
                                </TabsTrigger>
                                <TabsTrigger value="familiar" className="text-xs sm:text-sm px-2 py-2">
                                    Familiares
                                </TabsTrigger>
                            </TabsList>

                            {/* Mobile: Cards | Desktop: Tabela */}
                            <TabsContent value="todos">
                                <div className="block sm:hidden">
                                    <CardsUsuarios usuarios={usuariosFiltrados} />
                                </div>
                                <div className="hidden sm:block">
                                    <TabelaUsuarios usuarios={usuariosFiltrados} />
                                </div>
                            </TabsContent>

                            <TabsContent value="admin">
                                <div className="block sm:hidden">
                                    <CardsUsuarios usuarios={usuariosFiltrados} />
                                </div>
                                <div className="hidden sm:block">
                                    <TabelaUsuarios usuarios={usuariosFiltrados} />
                                </div>
                            </TabsContent>

                            <TabsContent value="parceiro">
                                <div className="block sm:hidden">
                                    <CardsUsuarios usuarios={usuariosFiltrados} />
                                </div>
                                <div className="hidden sm:block">
                                    <TabelaUsuarios usuarios={usuariosFiltrados} />
                                </div>
                            </TabsContent>

                            <TabsContent value="titular">
                                <div className="block sm:hidden">
                                    <CardsUsuarios usuarios={usuariosFiltrados} />
                                </div>
                                <div className="hidden sm:block">
                                    <TabelaUsuarios usuarios={usuariosFiltrados} />
                                </div>
                            </TabsContent>

                            <TabsContent value="familiar">
                                <div className="block sm:hidden">
                                    <CardsUsuarios usuarios={usuariosFiltrados} />
                                </div>
                                <div className="hidden sm:block">
                                    <TabelaUsuarios usuarios={usuariosFiltrados} />
                                </div>
                            </TabsContent>
                        </Tabs>
                    )}
                </CardContent>
            </Card>

            <GerenciarUsuario
                open={openDialog}
                onClose={() => setOpenDialog(false)}
                user={selectedUser}
                refresh={fetchUsuarios}
            />
            <NovoTitularDialog
                open={showNovoTitular}
                onClose={() => setShowNovoTitular(false)}
                refresh={fetchUsuarios}
            />
        </div>
    );
}