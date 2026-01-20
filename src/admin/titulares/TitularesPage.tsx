import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, UserPlus, UserCog } from "lucide-react";
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
                    usuarios.map((u) => (
                        <TableRow key={u.auth_id}>
                            <TableCell className="font-medium">{u.nome}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.parceiro_nome || "-"}</TableCell>
                            <TableCell>
                                <Badge
                                    variant={
                                        u.role === "admin_master"
                                            ? "default"
                                            : u.role === "parceiro_admin"
                                                ? "secondary"
                                                : "outline"
                                    }
                                >
                                    {u.role}
                                </Badge>
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
                    ))
                )}
            </TableBody>
        </Table>
    );

    return (
        <div className="space-y-6">

            {/* Cabeçalho + Botão Novo */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
                    <p className="text-gray-600 mt-1">Gerencie usuários, roles e vínculos.</p>
                </div>

                <Button onClick={() => setShowNovoTitular(true)}>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Novo Titular
                </Button>
            </div>

            {/* Barra de Busca + Filtro parceiro */}
            <div className="flex items-center gap-4">

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
                    <SelectTrigger className="w-[250px]">
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
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        Lista de Usuários
                    </CardTitle>
                </CardHeader>

                <CardContent>
                    {loading ? (
                        <p className="text-center py-10">Carregando...</p>
                    ) : (
                        <Tabs defaultValue="todos" onValueChange={setFiltroRole}>
                            <TabsList className="mb-4">
                                <TabsTrigger value="todos">Todos</TabsTrigger>
                                <TabsTrigger value="admin">Admin</TabsTrigger>
                                <TabsTrigger value="parceiro">Parceiros</TabsTrigger>
                                <TabsTrigger value="titular">Titulares</TabsTrigger>
                                <TabsTrigger value="familiar">Familiares</TabsTrigger>
                            </TabsList>

                            <TabsContent value="todos">
                                <TabelaUsuarios usuarios={usuariosFiltrados} />
                            </TabsContent>

                            <TabsContent value="admin">
                                <TabelaUsuarios usuarios={usuariosFiltrados} />
                            </TabsContent>

                            <TabsContent value="parceiro">
                                <TabelaUsuarios usuarios={usuariosFiltrados} />
                            </TabsContent>

                            <TabsContent value="titular">
                                <TabelaUsuarios usuarios={usuariosFiltrados} />
                            </TabsContent>

                            <TabsContent value="familiar">
                                <TabelaUsuarios usuarios={usuariosFiltrados} />
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