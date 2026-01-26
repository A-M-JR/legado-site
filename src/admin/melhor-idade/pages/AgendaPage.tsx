import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Circle, Clock, Pill, Coffee, Moon, Sun } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AgendaPage() {
    // Simulação de dados da agenda
    const [tarefas, setTarefas] = useState([
        { id: 1, hora: "08:00", titulo: "Remédio Pressão", desc: "1 comprimido branco", tipo: "remedio", feito: true, periodo: "manha" },
        { id: 2, hora: "08:30", titulo: "Café da Manhã", desc: "Frutas e torradas", tipo: "comida", feito: true, periodo: "manha" },
        { id: 3, hora: "12:00", titulo: "Almoço", desc: "Rico em fibras", tipo: "comida", feito: false, periodo: "tarde" },
        { id: 4, hora: "14:00", titulo: "Remédio Vitaminas", desc: "Cápsula gelatina", tipo: "remedio", feito: false, periodo: "tarde" },
        { id: 5, hora: "20:00", titulo: "Descanso", desc: "Preparar para dormir", tipo: "noite", feito: false, periodo: "noite" },
    ]);

    const toggleTarefa = (id: number) => {
        setTarefas(tarefas.map(t => t.id === id ? { ...t, feito: !t.feito } : t));
    };

    return (
        <div className="space-y-6 pb-20">
            <section>
                <h1 className="text-3xl font-bold text-[#255f4f]">Minha Agenda</h1>
                <p className="text-lg text-[#6b8c7d]">Veja o que temos para hoje</p>
            </section>

            {/* Filtros de Período - Botões Grandes */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                <PeriodoBadge icon={Sun} label="Manhã" active />
                <PeriodoBadge icon={Coffee} label="Tarde" />
                <PeriodoBadge icon={Moon} label="Noite" />
            </div>

            {/* Lista de Tarefas Estilo Timeline */}
            <div className="space-y-4 relative before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-[#d1e5dc]">
                {tarefas.map((tarefa) => (
                    <div key={tarefa.id} className="relative pl-14">
                        {/* Círculo da Timeline */}
                        <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-14 h-14 rounded-full border-4 border-[#f8fcfb] flex items-center justify-center z-10 transition-all ${tarefa.feito ? "bg-[#5ba58c]" : "bg-white border-[#d1e5dc]"
                            }`}>
                            {tarefa.tipo === "remedio" ? (
                                <Pill className={`h-6 w-6 ${tarefa.feito ? "text-white" : "text-[#5ba58c]"}`} />
                            ) : (
                                <Clock className={`h-6 w-6 ${tarefa.feito ? "text-white" : "text-[#9db4aa]"}`} />
                            )}
                        </div>

                        {/* Card da Tarefa */}
                        <Card
                            onClick={() => toggleTarefa(tarefa.id)}
                            className={`border-2 transition-all cursor-pointer rounded-3xl ${tarefa.feito
                                    ? "border-[#5ba58c] bg-[#f4fbf8] opacity-80"
                                    : "border-white bg-white shadow-sm"
                                }`}
                        >
                            <CardContent className="p-5 flex items-center justify-between">
                                <div>
                                    <span className="text-sm font-black text-[#5ba58c]">{tarefa.hora}</span>
                                    <h3 className={`text-lg font-bold ${tarefa.feito ? "text-[#6b8c7d] line-through" : "text-[#255f4f]"}`}>
                                        {tarefa.titulo}
                                    </h3>
                                    <p className="text-sm text-[#9db4aa]">{tarefa.desc}</p>
                                </div>

                                {tarefa.feito ? (
                                    <CheckCircle2 className="h-8 w-8 text-[#5ba58c]" />
                                ) : (
                                    <Circle className="h-8 w-8 text-[#d1e5dc]" />
                                )}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    );
}

function PeriodoBadge({ icon: Icon, label, active }: any) {
    return (
        <button className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap ${active ? "bg-[#255f4f] text-white shadow-md" : "bg-white text-[#6b8c7d] border border-[#d1e5dc]"
            }`}>
            <Icon className="h-5 w-5" />
            {label}
        </button>
    );
}