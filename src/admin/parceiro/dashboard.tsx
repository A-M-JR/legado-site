import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useOutletContext } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Settings2 } from "lucide-react";
import GerenciarModulosTitular from "./GerenciarModulosTitular";

interface Titular {
    id: string;
    nome: string;
    email: string;
    cpf: string;
}

export default function ParceiroDashboard() {
    const { userProfile } = useOutletContext<any>();
    const [titulares, setTitulares] = useState<Titular[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedTitular, setSelectedTitular] = useState<{ id: string, nome: string } | null>(null);
    const [showModulos, setShowModulos] = useState(false);

    useEffect(() => {
        if (userProfile?.parceiro_id) {
            fetchTitulares();
        }
    }, [userProfile]);

    async function fetchTitulares() {
        // Busca titulares vinculados ao parceiro logado através da tabela usuarios_app
        const { data, error } = await supabase
            .from("usuarios_app")
            .select(`
        titular_id,
        titulares (id, nome, email, cpf)
      `)
            .eq("parceiro_id", userProfile.parceiro_id)
            .eq("role", "titular");

        if (!error && data) {
            const formatados = data
                .filter((item: any) => item.titulares)
                .map((item: any) => item.titulares);
            setTitulares(formatados);
        }
        setLoading(false);
    }

    return (
        <div className="p-8 space-y-6 bg-gray-50 min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Meus Clientes</h1>
                    <p className="text-gray-600">Gerencie os acessos e jornadas dos seus pacientes.</p>
                </div>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                    <Plus className="h-4 w-4 mr-2" /> Novo Cliente
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-emerald-600" />
                        Lista de Titulares
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p className="text-center py-10">Carregando clientes...</p>
                    ) : titulares.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">Nenhum cliente vinculado ainda.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nome</TableHead>
                                    <TableHead>CPF</TableHead>
                                    <TableHead>E-mail</TableHead>
                                    <TableHead className="text-right">Ações</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {titulares.map((titular) => (
                                    <TableRow key={titular.id}>
                                        <TableCell className="font-medium">{titular.nome}</TableCell>
                                        <TableCell>{titular.cpf}</TableCell>
                                        <TableCell>{titular.email}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedTitular({ id: titular.id, nome: titular.nome });
                                                    setShowModulos(true);
                                                }}
                                            >
                                                <Settings2 className="h-4 w-4 mr-2" />
                                                Módulos
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <GerenciarModulosTitular
                titularId={selectedTitular?.id || null}
                titularNome={selectedTitular?.nome || ""}
                parceiroId={userProfile?.parceiro_id}
                open={showModulos}
                onClose={() => setShowModulos(false)}
            />
        </div>
    );
}