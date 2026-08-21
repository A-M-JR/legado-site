import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    CalendarCheck,
    Stethoscope,
    FlaskConical,
    Activity,
    MapPin,
    Clock,
    ChevronRight,
    CalendarX,
} from "lucide-react";
import { MiCard } from "@/modules/melhor-idade/components/MiCard";
import { MiPageHeader } from "@/modules/melhor-idade/components/MiPageHeader";
import { consultasService } from "../services/consultasService";
import { rotinaService } from "../services/rotinaService";
import { examesService } from "../services/examesService";
import { receitasService } from "../services/receitasService";
import { getNomePaciente } from "../services/mpScope";
import { fmtDataHora, fmtDiaSemana, fmtHora, rotuloRelativo } from "../lib/datas";
import type { ConsultaMp, ExameMp, RotinaItem } from "../types";

const TIPO_LABEL: Record<ConsultaMp["tipo"], string> = {
    presencial: "Presencial",
    online: "Online",
    retorno: "Retorno",
    exame: "Exame",
};

export default function MpHomePage() {
    const navigate = useNavigate();
    const [nome, setNome] = useState("");
    const [consultas, setConsultas] = useState<ConsultaMp[]>([]);
    const [rotina, setRotina] = useState<RotinaItem[]>([]);
    const [exames, setExames] = useState<ExameMp[]>([]);
    const [receitasAtivas, setReceitasAtivas] = useState(0);

    useEffect(() => {
        getNomePaciente().then(setNome);
        consultasService.list().then(setConsultas);
        rotinaService.list().then(setRotina);
        examesService.list().then(setExames);
        receitasService.list().then((r) => setReceitasAtivas(r.filter((i) => i.ativa).length));
    }, []);

    const proxima = useMemo(() => consultasService.proxima(consultas), [consultas]);
    const rotinaPendente = useMemo(() => rotina.filter((r) => !r.feito).length, [rotina]);
    const examesPendentes = useMemo(() => examesService.pendentes(exames).length, [exames]);
    const proximasOutras = useMemo(
        () => consultasService.futuras(consultas).slice(1, 4),
        [consultas]
    );

    const stats = [
        {
            label: "Rotina hoje",
            value: rotinaPendente,
            sufixo: rotinaPendente === 1 ? "pendente" : "pendentes",
            icon: CalendarCheck,
            cor: "text-amber-600",
            path: "/medicina-preventiva/minha-rotina",
        },
        {
            label: "Exames",
            value: examesPendentes,
            sufixo: examesPendentes === 1 ? "aberto" : "abertos",
            icon: FlaskConical,
            cor: "text-blue-600",
            path: "/medicina-preventiva/exames-laudos",
        },
        {
            label: "Receitas",
            value: receitasAtivas,
            sufixo: receitasAtivas === 1 ? "ativa" : "ativas",
            icon: Stethoscope,
            cor: "text-emerald-600",
            path: "/medicina-preventiva/receitas-consultas",
        },
    ];

    return (
        <div className="space-y-5 sm:space-y-6 pb-28">
            <MiPageHeader
                eyebrow="Medicina Preventiva"
                title={nome ? `Olá, ${nome.split(" ")[0]}` : "Olá"}
                subtitle="Acompanhe suas consultas, exames e a rotina de cuidado."
            />

            {proxima ? (
                <MiCard
                    variant="accent"
                    className="p-5 sm:p-6"
                    onClick={() => navigate("/medicina-preventiva/receitas-consultas")}
                >
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 p-3 rounded-2xl bg-[#5ba58c] text-white shadow-sm">
                            <Stethoscope className="h-6 w-6" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#9db4aa]">
                                    Próxima consulta
                                </p>
                                <span className="text-[10px] font-bold text-white bg-[#5ba58c] px-2 py-0.5 rounded-full">
                                    {rotuloRelativo(proxima.dataHora)}
                                </span>
                            </div>
                            <p className="text-lg sm:text-xl font-bold text-[#255f4f] mt-1 capitalize">
                                {fmtDiaSemana(proxima.dataHora)}
                            </p>
                            <div className="mt-2 space-y-1 text-sm text-[#4f665a]">
                                <p className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-[#9db4aa]" />
                                    {fmtHora(proxima.dataHora)} · {TIPO_LABEL[proxima.tipo]}
                                </p>
                                {proxima.profissional && (
                                    <p className="flex items-center gap-2">
                                        <Stethoscope className="h-4 w-4 text-[#9db4aa]" />
                                        {proxima.profissional}
                                        {proxima.especialidade ? ` · ${proxima.especialidade}` : ""}
                                    </p>
                                )}
                                {proxima.local && (
                                    <p className="flex items-center gap-2">
                                        <MapPin className="h-4 w-4 text-[#9db4aa]" />
                                        {proxima.local}
                                    </p>
                                )}
                            </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
                    </div>
                </MiCard>
            ) : (
                <MiCard variant="soft" className="p-5 sm:p-6">
                    <div className="flex items-center gap-4">
                        <div className="shrink-0 p-3 rounded-2xl bg-white text-[#9db4aa] shadow-sm">
                            <CalendarX className="h-6 w-6" />
                        </div>
                        <div>
                            <p className="font-bold text-[#255f4f]">Nenhuma consulta agendada</p>
                            <p className="text-sm text-[#6b8c7d] mt-0.5">
                                Quando a clínica agendar, ela aparece aqui e você recebe um aviso.
                            </p>
                        </div>
                    </div>
                </MiCard>
            )}

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {stats.map((s) => (
                    <MiCard
                        key={s.label}
                        onClick={() => navigate(s.path)}
                        className="p-3 sm:p-4 text-center"
                    >
                        <s.icon className={`h-5 w-5 mx-auto ${s.cor}`} />
                        <p className="text-xl sm:text-2xl font-bold text-[#255f4f] mt-1.5">
                            {s.value}
                        </p>
                        <p className="text-[10px] sm:text-xs text-[#6b8c7d] leading-tight">
                            {s.label}
                            <br />
                            <span className="text-[#9db4aa]">{s.sufixo}</span>
                        </p>
                    </MiCard>
                ))}
            </div>

            <MiCard
                variant="alert"
                className="p-4 sm:p-5"
                onClick={() => navigate("/medicina-preventiva/sintomas")}
            >
                <div className="flex items-center gap-3 sm:gap-4">
                    <div className="shrink-0 p-3 rounded-2xl bg-white text-rose-500 shadow-sm">
                        <Activity className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                        <p className="font-bold text-[#255f4f] text-sm sm:text-base">
                            Está sentindo algo diferente?
                        </p>
                        <p className="text-xs sm:text-sm text-[#6b8c7d] mt-0.5">
                            Registre seus sintomas e avise a clínica na hora.
                        </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-[#9db4aa] shrink-0" />
                </div>
            </MiCard>

            {proximasOutras.length > 0 && (
                <section className="space-y-2">
                    <h2 className="text-base sm:text-lg font-bold text-[#255f4f]">
                        Outras consultas marcadas
                    </h2>
                    <div className="space-y-2">
                        {proximasOutras.map((c) => (
                            <MiCard key={c.id} className="p-4">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-semibold text-[#255f4f] text-sm truncate">
                                            {c.profissional || "Consulta"}
                                        </p>
                                        <p className="text-xs text-[#6b8c7d] mt-0.5">
                                            {fmtDataHora(c.dataHora)}
                                            {c.local ? ` · ${c.local}` : ""}
                                        </p>
                                    </div>
                                    <span className="text-[10px] font-bold text-[#5ba58c] bg-[#e3f1eb] px-2 py-1 rounded-full shrink-0">
                                        {rotuloRelativo(c.dataHora)}
                                    </span>
                                </div>
                            </MiCard>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
