import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import {
    Plus,
    Building2,
    Search,
    FileText,
    Edit,
    Settings,
} from "lucide-react";

import NovoParceiro from "./NovoParceiro";
import EditarParceiro from "./EditarParceiro";
import GerenciarModulos from "./GerenciarModulos";

interface Parceiro {
    id: string;
    nome: string;
    tipo: string;
    cnpj: string | null;
    status: "ativo" | "suspenso" | "inativo" | null;
    contrato_url: string | null;
    data_contrato: string | null;
    observacoes: string | null;
    logo_url: string | null;
    ativo: boolean | null;
}

export default function ParceirosPage() {
    const [parceiros, setParceiros] = useState<Parceiro[]>([]);
    const [filteredParceiros, setFilteredParceiros] = useState<Parceiro[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // Dialogs
    const [showNovoDialog, setShowNovoDialog] = useState(false);
    const [showEditarDialog, setShowEditarDialog] = useState(false);
    const [showModulosDialog, setShowModulosDialog] = useState(false);

    const [selectedParceiro, setSelectedParceiro] = useState<Parceiro | null>(
        null
    );

    useEffect(() => {
        fetchParceiros();
    }, []);

    useEffect(() => {
        if (searchTerm.trim() === "") {
            setFilteredParceiros(parceiros);
        } else {
            const term = searchTerm.toLowerCase();
            const filtered = parceiros.filter(
                (p) =>
                    p.nome.toLowerCase().includes(term) ||
                    p.tipo.toLowerCase().includes(term) ||
                    (p.cnpj ?? "").includes(searchTerm)
            );
            setFilteredParceiros(filtered);
        }
    }, [searchTerm, parceiros]);

    async function fetchParceiros() {
        setLoading(true);
        const { data, error } = await supabase
            .from("parceiros")
            .select("*")
            .order("nome");

        if (!error && data) {
            setParceiros(data as Parceiro[]);
            setFilteredParceiros(data as Parceiro[]);
        }
        setLoading(false);
    }

    function getStatusBadge(status: string | null) {
        const map: Record<
            string,
            { label: string; className: string }
        > = {
            ativo: {
                label: "Ativo",
                className: "bg-green-100 text-green-800",
            },
            suspenso: {
                label: "Suspenso",
                className: "bg-yellow-100 text-yellow-800",
            },
            inativo: {
                label: "Inativo",
                className: "bg-red-100 text-red-800",
            },
        };

        return (
            map[status || "ativo"] ?? {
                label: "Ativo",
                className: "bg-green-100 text-green-800",
            }
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600 mb-4" />
                    <p className="text-gray-600">Carregando parceiros...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold">Parceiros</h2>
                    <p className="mt-1 text-gray-600">
                        Gerencie clínicas, funerárias, prefeituras e outros parceiros.
                    </p>
                </div>
                <Button onClick={() => setShowNovoDialog(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Parceiro
                </Button>
            </div>

            {/* Busca */}
            <div className="flex items-center gap-2">
                <div className="relative max-w-md flex-1">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                    <Input
                        placeholder="Buscar por nome, CNPJ ou tipo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Lista */}
            {filteredParceiros.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <Building2 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                        <p className="text-gray-600">
                            {searchTerm
                                ? "Nenhum parceiro encontrado com esse filtro."
                                : "Nenhum parceiro cadastrado ainda."}
                        </p>
                        {!searchTerm && (
                            <Button
                                onClick={() => setShowNovoDialog(true)}
                                className="mt-4"
                            >
                                Cadastrar Primeiro Parceiro
                            </Button>
                        )}
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Parceiro</TableHead>
                                <TableHead>Tipo</TableHead>
                                <TableHead>CNPJ</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Contrato</TableHead>
                                <TableHead className="text-right">Ações</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredParceiros.map((parceiro) => {
                                const status = getStatusBadge(parceiro.status);
                                return (
                                    <TableRow key={parceiro.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {parceiro.logo_url ? (
                                                    <img
                                                        src={parceiro.logo_url}
                                                        alt={parceiro.nome}
                                                        className="h-10 w-10 rounded bg-gray-50 p-1 object-contain"
                                                    />
                                                ) : (
                                                    <div className="h-10 w-10 rounded bg-gray-200" />
                                                )}
                                                <span className="font-medium">
                                                    {parceiro.nome}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="capitalize">
                                            {parceiro.tipo}
                                        </TableCell>
                                        <TableCell>
                                            {parceiro.cnpj ? (
                                                <span className="text-sm text-gray-700">
                                                    {parceiro.cnpj}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Não informado
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                className={`px-2 py-1 text-xs font-semibold ${status.className}`}
                                            >
                                                {status.label}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {parceiro.contrato_url ? (
                                                <a
                                                    href={parceiro.contrato_url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                                                >
                                                    <FileText className="h-4 w-4" />
                                                    Ver contrato
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">
                                                    Sem contrato
                                                </span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedParceiro(parceiro);
                                                        setShowModulosDialog(true);
                                                    }}
                                                >
                                                    <Settings className="mr-1 h-4 w-4" />
                                                    Módulos
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => {
                                                        setSelectedParceiro(parceiro);
                                                        setShowEditarDialog(true);
                                                    }}
                                                >
                                                    <Edit className="mr-1 h-4 w-4" />
                                                    Editar
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </Card>
            )}

            {/* Novo Parceiro */}
            <NovoParceiro
                open={showNovoDialog}
                onClose={() => setShowNovoDialog(false)}
                onSuccess={() => {
                    setShowNovoDialog(false);
                    fetchParceiros();
                }}
            />

            {/* Editar Parceiro */}
            {selectedParceiro && (
                <EditarParceiro
                    open={showEditarDialog}
                    onClose={() => {
                        setShowEditarDialog(false);
                        setSelectedParceiro(null);
                    }}
                    parceiro={selectedParceiro}
                    onSuccess={() => {
                        setShowEditarDialog(false);
                        setSelectedParceiro(null);
                        fetchParceiros();
                    }}
                />
            )}

            {/* Gerenciar Módulos */}
            {selectedParceiro && (
                <GerenciarModulos
                    parceiroId={selectedParceiro.id}
                    parceiroNome={selectedParceiro.nome}
                    open={showModulosDialog}
                    onClose={() => {
                        setShowModulosDialog(false);
                        setSelectedParceiro(null);
                    }}
                />
            )}
        </div>
    );
}