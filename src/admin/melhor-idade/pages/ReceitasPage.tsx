import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarCheck, Pill, Clock, User } from "lucide-react";

export default function ReceitasPage() {
    const [receitas, setReceitas] = useState([
        {
            id: 1,
            medicamento: "Losartana",
            dosagem: "50mg",
            frequencia: "1x ao dia",
            inicio: "2025-01-10",
            validade: "2025-04-10",
        },
        {
            id: 2,
            medicamento: "Metformina",
            dosagem: "850mg",
            frequencia: "2x ao dia",
            inicio: "2024-12-01",
            validade: "2025-03-01",
        },
    ]);

    const [consultas, setConsultas] = useState([
        {
            id: 1,
            data: "2025-02-15T14:30",
            medico: "Dra. Fernanda Souza",
            local: "Clínica São Lucas",
            tipo: "Presencial",
        },
        {
            id: 2,
            data: "2025-03-20T10:00",
            medico: "Dr. Carlos Almeida",
            local: "Teleconsulta",
            tipo: "Online",
        },
    ]);

    return (
        <div className="space-y-8 pb-20">
            <h1 className="text-3xl font-bold text-[#255f4f]">Receitas e Consultas</h1>

            <section>
                <h2 className="text-xl font-bold text-[#255f4f] mb-4 flex items-center gap-2">
                    <Pill className="h-6 w-6 text-[#5ba58c]" />
                    Receitas Médicas Ativas
                </h2>
                <div className="grid gap-4">
                    {receitas.map((r) => (
                        <Card key={r.id} className="border-[#d1e5dc] rounded-2xl shadow-sm">
                            <CardContent className="p-5">
                                <p className="text-lg font-bold text-[#255f4f]">{r.medicamento}</p>
                                <p className="text-sm text-[#6b8c7d]">
                                    Dosagem: {r.dosagem} | Frequência: {r.frequencia}
                                </p>
                                <p className="text-sm text-[#9db4aa] mt-1">
                                    Início: {new Date(r.inicio).toLocaleDateString()} | Validade: {new Date(r.validade).toLocaleDateString()}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>

            <section>
                <h2 className="text-xl font-bold text-[#255f4f] mb-4 flex items-center gap-2">
                    <CalendarCheck className="h-6 w-6 text-[#5ba58c]" />
                    Próximas Consultas
                </h2>
                <div className="grid gap-4">
                    {consultas.map((c) => (
                        <Card key={c.id} className="border-[#d1e5dc] rounded-2xl shadow-sm">
                            <CardContent className="p-5 flex justify-between items-center">
                                <div>
                                    <p className="text-lg font-bold text-[#255f4f]">{c.medico}</p>
                                    <p className="text-sm text-[#6b8c7d]">{c.local} - {c.tipo}</p>
                                </div>
                                <div className="text-right text-[#5ba58c] font-bold">
                                    {new Date(c.data).toLocaleDateString()}<br />
                                    {new Date(c.data).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </section>
        </div>
    );
}