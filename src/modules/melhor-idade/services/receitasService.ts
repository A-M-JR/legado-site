import type { ConsultaMedica, ReceitaMedica } from "../types";
import { readStorage, writeStorage } from "./storage";

const RECEITAS_KEY = "receitas_medicas";
const CONSULTAS_KEY = "consultas_medicas";

const RECEITAS_MOCK: ReceitaMedica[] = [
    {
        id: "1",
        medicamento: "Losartana",
        dosagem: "50mg",
        frequencia: "1x ao dia (Manhã)",
        inicio: "2025-01-10",
        validade: "2025-04-10",
        medico: "Dra. Fernanda Souza",
        especialidade: "Cardiologista",
        data_consulta: "09/01/2025",
        foto_url:
            "https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?q=80&w=500&auto=format&fit=crop",
    },
    {
        id: "2",
        medicamento: "Metformina",
        dosagem: "850mg",
        frequencia: "2x ao dia (Almoço e Jantar)",
        inicio: "2024-12-01",
        validade: "2025-03-01",
        medico: "Dr. Carlos Almeida",
        especialidade: "Endocrinologista",
        data_consulta: "30/11/2024",
        foto_url:
            "https://images.unsplash.com/photo-1576091160550-2173dba999ef?q=80&w=500&auto=format&fit=crop",
    },
];

const CONSULTAS_MOCK: ConsultaMedica[] = [
    { id: "1", data: "09/01/2025", medico: "Dra. Fernanda Souza", local: "Clínica São Lucas", tipo: "Presencial" },
    { id: "2", data: "30/11/2024", medico: "Dr. Carlos Almeida", local: "Teleconsulta", tipo: "Online" },
    { id: "3", data: "15/10/2024", medico: "Dr. Ricardo Lima", local: "Clínica Centro", tipo: "Presencial" },
];

export function fmtDataBR(d: string): string {
    if (!d) return "";
    if (d.includes("/")) return d;
    try {
        return new Intl.DateTimeFormat("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        }).format(new Date(d));
    } catch {
        return d;
    }
}

export const receitasService = {
    listReceitas(): ReceitaMedica[] {
        return readStorage(RECEITAS_KEY, RECEITAS_MOCK);
    },

    listConsultas(): ConsultaMedica[] {
        return readStorage(CONSULTAS_KEY, CONSULTAS_MOCK);
    },

    addReceita(data: Omit<ReceitaMedica, "id">): ReceitaMedica[] {
        const novo: ReceitaMedica = { ...data, id: String(Date.now()) };
        const updated = [novo, ...this.listReceitas()];
        writeStorage(RECEITAS_KEY, updated);
        return updated;
    },

    addConsulta(data: Omit<ConsultaMedica, "id">): ConsultaMedica[] {
        const novo: ConsultaMedica = { ...data, id: String(Date.now()) };
        const updated = [novo, ...this.listConsultas()];
        writeStorage(CONSULTAS_KEY, updated);
        return updated;
    },
};
