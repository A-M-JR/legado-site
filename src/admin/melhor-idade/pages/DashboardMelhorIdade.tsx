import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Calendar, Activity, MessageCircle } from "lucide-react";

export default function DashboardMelhorIdade() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-[#255f4f]">Bem-vindo à Jornada Melhor Idade</h1>
                <p className="text-[#6b8c7d]">Acompanhe com carinho e segurança cada detalhe do dia a dia.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Activity} label="Sinais Vitais" value="Estáveis" color="text-blue-500" />
                <StatCard icon={Calendar} label="Próxima Atividade" value="14:30 - Remédio" color="text-emerald-500" />
                <StatCard icon={Heart} label="Humor de Hoje" value="Radiante" color="text-pink-500" />
                <StatCard icon={MessageCircle} label="Recados" value="2 novos" color="text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-[#d1e5dc] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#255f4f]">Resumo do Dia</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[#6b8c7d]">Aqui entrará a linha do tempo das atividades realizadas hoje.</p>
                    </CardContent>
                </Card>

                <Card className="border-[#d1e5dc] rounded-2xl shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-[#255f4f]">Contatos de Emergência</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-[#6b8c7d]">Acesso rápido aos familiares e médicos responsáveis.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: any) {
    return (
        <Card className="border-[#d1e5dc] rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gray-50 ${color}`}>
                    <Icon className="h-6 w-6" />
                </div>
                <div>
                    <p className="text-xs font-medium text-[#6b8c7d] uppercase tracking-wider">{label}</p>
                    <p className="text-lg font-bold text-[#255f4f]">{value}</p>
                </div>
            </CardContent>
        </Card>
    );
}