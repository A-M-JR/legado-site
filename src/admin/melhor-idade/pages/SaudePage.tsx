import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, Activity, Thermometer, Smile, Meh, Frown, Plus } from "lucide-react";

export default function SaudePage() {
    const [humorSelecionado, setHumorSelecionado] = useState<string | null>(null);

    const humores = [
        { id: 'feliz', label: 'Bem', icon: Smile, color: 'text-emerald-500', bg: 'bg-emerald-50' },
        { id: 'mais-ou-menos', label: 'Mais ou menos', icon: Meh, color: 'text-amber-500', bg: 'bg-amber-50' },
        { id: 'triste', label: 'Incomodado', icon: Frown, color: 'text-rose-500', bg: 'bg-rose-50' },
    ];

    return (
        <div className="space-y-8 pb-10">
            {/* Cabeçalho Acolhedor */}
            <section>
                <h1 className="text-3xl font-bold text-[#255f4f]">Saúde e Bem-estar</h1>
                <p className="text-lg text-[#6b8c7d]">Como você está se sentindo agora?</p>
            </section>

            {/* Seleção de Humor - Botões Gigantes */}
            <section className="grid grid-cols-3 gap-4">
                {humores.map((h) => (
                    <button
                        key={h.id}
                        onClick={() => setHumorSelecionado(h.id)}
                        className={`flex flex-col items-center justify-center p-6 rounded-3xl border-2 transition-all ${humorSelecionado === h.id
                                ? `border-[#5ba58c] ${h.bg} scale-105 shadow-lg`
                                : "border-transparent bg-white shadow-sm"
                            }`}
                    >
                        <h.icon className={`h-12 w-12 mb-2 ${h.color}`} />
                        <span className="font-bold text-[#255f4f] text-sm">{h.label}</span>
                    </button>
                ))}
            </section>

            {/* Sinais Vitais - Cards de Ação Rápida */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold text-[#255f4f] flex items-center gap-2">
                    <Activity className="h-5 w-5 text-[#5ba58c]" />
                    Meus Registros
                </h2>

                <div className="grid grid-cols-1 gap-4">
                    <VitalCard
                        icon={Activity}
                        label="Pressão Arterial"
                        value="12/8"
                        time="Há 2 horas"
                        unit="mmHg"
                        color="text-blue-600"
                    />
                    <VitalCard
                        icon={Thermometer}
                        label="Temperatura"
                        value="36.5"
                        time="Hoje cedo"
                        unit="°C"
                        color="text-orange-500"
                    />
                    <VitalCard
                        icon={Heart}
                        label="Batimentos"
                        value="72"
                        time="Há 2 horas"
                        unit="BPM"
                        color="text-rose-500"
                    />
                </div>
            </section>

            {/* Botão de Ação Flutuante (ou fixo no final da lista) */}
            <Button className="w-full py-8 rounded-2xl bg-[#5ba58c] hover:bg-[#4a8a75] text-white text-xl font-bold shadow-lg shadow-emerald-100">
                <Plus className="mr-2 h-6 w-6" />
                Novo Registro
            </Button>
        </div>
    );
}

function VitalCard({ icon: Icon, label, value, time, unit, color }: any) {
    return (
        <Card className="border-[#d1e5dc] rounded-2xl overflow-hidden shadow-sm">
            <CardContent className="p-5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
                        <Icon className="h-7 w-7" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[#255f4f]">{label}</p>
                        <p className="text-xs text-[#9db4aa]">{time}</p>
                    </div>
                </div>
                <div className="text-right">
                    <span className="text-2xl font-black text-[#255f4f]">{value}</span>
                    <span className="text-xs font-bold text-[#6b8c7d] ml-1 uppercase">{unit}</span>
                </div>
            </CardContent>
        </Card>
    );
}