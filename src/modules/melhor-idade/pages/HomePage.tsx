import { useEffect, useMemo, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

    Pill,

    Calendar,

    Sparkles,

    Users,

    ChevronRight,

    CheckCircle2,

    Stethoscope,

    ClipboardList,

} from "lucide-react";

import { MoodSelector } from "../components/MoodSelector";

import { MiCard, MiListItem } from "../components/MiCard";

import { MiProfileGreeting } from "../components/MiProfileAvatar";

import { MiConsultasResumo } from "../components/MiConsultasCalendario";

import { useMelhorIdade } from "../context/MelhorIdadeContext";

import { agendaService } from "../services/agendaService";

import { receitasService } from "../services/receitasService";

import { consultasFuturas } from "../lib/consultaDates";

import type { ConsultaMedica, TarefaDia } from "../types";



const ICON_MAP = {

    medicacao: Pill,

    compromisso: Calendar,

    cuidado: Sparkles,

    momento: Sparkles,

};



const ICON_BG: Record<string, string> = {

    medicacao: "text-blue-600",

    compromisso: "text-emerald-600",

    cuidado: "text-amber-600",

    momento: "text-orange-500",

};



export default function HomePage() {

    const navigate = useNavigate();

    const { profile, updateHumor, refreshProfile } = useMelhorIdade();

    const [tarefas, setTarefas] = useState<TarefaDia[]>([]);

    const [consultas, setConsultas] = useState<ConsultaMedica[]>([]);

    const [receitasAtivas, setReceitasAtivas] = useState(0);



    useEffect(() => {

        refreshProfile();

        agendaService.list().then(setTarefas);

        receitasService.listConsultas().then(setConsultas);

        receitasService.listReceitas().then((r) => {

            setReceitasAtivas(r.filter((item) => item.ativa !== false).length);

        });

    }, [refreshProfile]);



    const tarefasPendentes = useMemo(() => tarefas.filter((t) => !t.feito).length, [tarefas]);

    const totalConsultasFuturas = useMemo(() => consultasFuturas(consultas).length, [consultas]);

    const resumoTarefas = tarefas.slice(0, 3);



    const stats = [

        {

            label: "Rotina hoje",

            value: tarefasPendentes,

            suffix: tarefasPendentes === 1 ? "pendente" : "pendentes",

            icon: ClipboardList,

            cor: "text-blue-600 bg-blue-50",

            path: "/melhor-idade/minha-rotina",

        },

        {

            label: "Receitas ativas",

            value: receitasAtivas,

            suffix: "em uso",

            icon: Pill,

            cor: "text-violet-600 bg-violet-50",

            path: "/melhor-idade/meu-cuidado",

        },

        {

            label: "Consultas",

            value: totalConsultasFuturas,

            suffix: totalConsultasFuturas === 1 ? "próxima" : "próximas",

            icon: Stethoscope,

            cor: "text-emerald-600 bg-emerald-50",

            path: "/melhor-idade/meu-cuidado",

        },

        {

            label: "Família",

            value: profile.rede.length,

            suffix: profile.rede.length === 1 ? "pessoa" : "pessoas",

            icon: Users,

            cor: "text-amber-600 bg-amber-50",

            path: "/melhor-idade/familia",

        },

    ];



    return (

        <div className="space-y-6 sm:space-y-8 pb-4">

            <MiProfileGreeting nome={profile.nome} fotoUrl={profile.fotoUrl} />



            <section className="space-y-3">

                <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">Visão geral</h2>

                <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

                    {stats.map((s) => (

                        <MiCard

                            key={s.label}

                            onClick={() => navigate(s.path)}

                            className="p-3 sm:p-4"

                        >

                            <div className="flex items-start gap-2 sm:gap-3">

                                <div className={`p-2 rounded-xl shrink-0 ${s.cor}`}>

                                    <s.icon className="h-4 w-4 sm:h-5 sm:w-5" />

                                </div>

                                <div className="min-w-0">

                                    <p className="text-[10px] sm:text-xs font-semibold text-[#9db4aa] uppercase tracking-wide">

                                        {s.label}

                                    </p>

                                    <p className="text-xl sm:text-2xl font-black text-[#255f4f] leading-tight">

                                        {s.value}

                                    </p>

                                    <p className="text-[10px] sm:text-xs text-[#6b8c7d]">{s.suffix}</p>

                                </div>

                            </div>

                        </MiCard>

                    ))}

                </div>

            </section>



            <MiConsultasResumo
                consultas={consultas}
                onVerTodas={() => navigate("/melhor-idade/meu-cuidado")}
            />



            <MiCard variant="soft" className="p-4 sm:p-5 space-y-3">

                <div>

                    <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">

                        Como você está agora?

                    </h2>

                    <p className="text-xs sm:text-sm text-[#6b8c7d]">

                        Escolha como está se sentindo.

                    </p>

                </div>

                <MoodSelector value={profile.humorAtual} onChange={updateHumor} size="sm" />

            </MiCard>



            <section className="space-y-3">

                <div className="flex items-center justify-between gap-2">

                    <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">Resumo do seu dia</h2>

                    {tarefasPendentes === 0 && tarefas.length > 0 && (

                        <span className="flex items-center gap-1 text-xs font-semibold text-[#5ba58c]">

                            <CheckCircle2 className="h-4 w-4" /> Tudo feito

                        </span>

                    )}

                </div>

                <div className="space-y-2.5">

                    {resumoTarefas.length === 0 ? (

                        <MiCard variant="soft" className="p-5 text-center text-sm text-[#6b8c7d]">

                            Nenhuma tarefa na rotina. Adicione em Minha rotina.

                        </MiCard>

                    ) : (

                        resumoTarefas.map((t) => {

                            const Icon = ICON_MAP[t.tipo] || Sparkles;

                            return (

                                <MiListItem

                                    key={t.id}

                                    icon={<Icon className="h-5 w-5 sm:h-6 sm:w-6" />}

                                    iconClassName={ICON_BG[t.tipo]}

                                    titulo={t.titulo}

                                    descricao={t.descricao}

                                    horario={t.horario}

                                    onClick={() => navigate("/melhor-idade/minha-rotina")}

                                />

                            );

                        })

                    )}

                </div>

                <button

                    type="button"

                    onClick={() => navigate("/melhor-idade/minha-rotina")}

                    className="text-sm font-semibold text-[#5ba58c] hover:underline flex items-center gap-1 px-1"

                >

                    Ver minha rotina completa <ChevronRight className="h-4 w-4" />

                </button>

            </section>



            <MiCard

                variant="accent"

                onClick={() => navigate("/melhor-idade/familia")}

                className="p-4 sm:p-5"

            >

                <div className="flex items-center gap-3 sm:gap-4">

                    <div className="p-3 sm:p-4 rounded-2xl bg-violet-100 shadow-sm shrink-0">

                        <Users className="h-6 w-6 sm:h-7 sm:w-7 text-violet-600" />

                    </div>

                    <div className="flex-1 min-w-0">

                        <p className="font-bold text-[#255f4f] text-sm sm:text-base">Minha família</p>

                        <p className="text-xs sm:text-sm text-[#6b8c7d]">

                            Veja mensagens e memórias compartilhadas

                        </p>

                    </div>

                    <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />

                </div>

            </MiCard>

        </div>

    );

}

