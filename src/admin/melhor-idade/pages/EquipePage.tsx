import { Card, CardContent } from "@/components/ui/card";
import { Phone, Video, MessageCircle, Star, ShieldCheck } from "lucide-react";

export default function EquipePage() {
    const contatos = [
        {
            id: 1,
            nome: "Ana (Filha)",
            relacao: "Família",
            foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
            emergencia: true
        },
        {
            id: 2,
            nome: "Dr. Carlos",
            relacao: "Médico",
            foto: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80",
            emergencia: true
        },
        {
            id: 3,
            nome: "Maria Cuidadora",
            relacao: "Equipe",
            foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80",
            emergencia: false
        }
    ];

    return (
        <div className="space-y-8 pb-24">
            <section>
                <h1 className="text-3xl font-bold text-[#255f4f]">Pessoas que Cuidam</h1>
                <p className="text-lg text-[#6b8c7d]">Quem você quer chamar agora?</p>
            </section>

            {/* Botão de Emergência - DESTAQUE TOTAL */}
            <section>
                <button className="w-full bg-rose-500 text-white p-6 rounded-[32px] shadow-lg shadow-rose-100 flex items-center justify-center gap-4 active:scale-95 transition-transform">
                    <div className="bg-white/20 p-3 rounded-full">
                        <Phone className="h-8 w-8 animate-pulse" />
                    </div>
                    <div className="text-left">
                        <p className="text-xs uppercase font-black tracking-widest opacity-80">Precisa de ajuda?</p>
                        <p className="text-2xl font-bold">Ligar para Emergência</p>
                    </div>
                </button>
            </section>

            {/* Lista de Contatos */}
            <section className="grid grid-cols-1 gap-6">
                {contatos.map((contato) => (
                    <Card key={contato.id} className="border-none rounded-[32px] shadow-sm bg-white overflow-hidden">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-5 mb-6">
                                <div className="relative">
                                    <img
                                        src={contato.foto}
                                        alt={contato.nome}
                                        className="w-20 h-20 rounded-full object-cover border-4 border-[#f4fbf8]"
                                    />
                                    {contato.emergencia && (
                                        <div className="absolute -top-1 -right-1 bg-amber-400 p-1.5 rounded-full border-4 border-white">
                                            <Star className="h-3 w-3 text-white fill-white" />
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-[#255f4f]">{contato.nome}</h3>
                                    <div className="flex items-center gap-1 text-[#5ba58c]">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-sm font-bold uppercase tracking-wider">{contato.relacao}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Botões de Ação - Grandes e Coloridos */}
                            <div className="grid grid-cols-3 gap-3">
                                <button className="flex flex-col items-center justify-center p-4 bg-emerald-50 text-[#255f4f] rounded-2xl hover:bg-emerald-100 transition-colors">
                                    <Phone className="h-7 w-7 mb-1" />
                                    <span className="text-[10px] font-black uppercase">Ligar</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-100 transition-colors">
                                    <Video className="h-7 w-7 mb-1" />
                                    <span className="text-[10px] font-black uppercase">Vídeo</span>
                                </button>
                                <button className="flex flex-col items-center justify-center p-4 bg-amber-50 text-amber-700 rounded-2xl hover:bg-amber-100 transition-colors">
                                    <MessageCircle className="h-7 w-7 mb-1" />
                                    <span className="text-[10px] font-black uppercase">ZAP</span>
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>
        </div>
    );
}