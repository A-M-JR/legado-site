import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Camera, Mic, MessageSquare, Heart, Image as ImageIcon, Plus } from "lucide-react";

export default function DiarioPage() {
    const [postagens, setPostagens] = useState([
        {
            id: 1,
            autor: "Cuidadora Maria",
            hora: "15:30",
            texto: "Hoje o passeio no jardim foi maravilhoso! Tomamos um pouco de sol.",
            imagem: "https://images.unsplash.com/photo-1516733968668-dbdce39c46ef?auto=format&fit=crop&w=400&q=80",
            reacoes: 3
        },
        {
            id: 2,
            autor: "Você",
            hora: "09:00",
            texto: "Dormi muito bem hoje. Acordei disposto!",
            imagem: null,
            reacoes: 1
        }
    ]);

    return (
        <div className="space-y-6 pb-24">
            <section className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold text-[#255f4f]">Meu Diário</h1>
                    <p className="text-lg text-[#6b8c7d]">Compartilhe seus momentos</p>
                </div>
            </section>

            {/* Botões de Ação Rápida - GIGANTES */}
            <section className="grid grid-cols-2 gap-4">
                <button className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#d1e5dc] rounded-[32px] hover:border-[#5ba58c] transition-all shadow-sm">
                    <Camera className="h-10 w-10 text-[#5ba58c] mb-2" />
                    <span className="font-bold text-[#255f4f]">Tirar Foto</span>
                </button>
                <button className="flex flex-col items-center justify-center p-6 bg-white border-2 border-[#d1e5dc] rounded-[32px] hover:border-[#5ba58c] transition-all shadow-sm">
                    <Mic className="h-10 w-10 text-blue-500 mb-2" />
                    <span className="font-bold text-[#255f4f]">Gravar Voz</span>
                </button>
            </section>

            {/* Feed de Notícias/Rotina */}
            <section className="space-y-6">
                {postagens.map((post) => (
                    <Card key={post.id} className="border-none rounded-[32px] overflow-hidden shadow-md bg-white">
                        {post.imagem && (
                            <img
                                src={post.imagem}
                                alt="Momento do dia"
                                className="w-full h-56 object-cover"
                            />
                        )}
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-black text-[#5ba58c] text-sm uppercase tracking-widest">{post.autor}</p>
                                    <p className="text-xs text-[#9db4aa]">{post.hora}</p>
                                </div>
                                <div className="flex items-center gap-1 bg-[#f4fbf8] px-3 py-1 rounded-full">
                                    <Heart className="h-4 w-4 text-rose-500 fill-rose-500" />
                                    <span className="text-xs font-bold text-[#255f4f]">{post.reacoes}</span>
                                </div>
                            </div>

                            <p className="text-lg text-[#4f665a] leading-relaxed font-medium">
                                {post.texto}
                            </p>

                            <div className="mt-6 flex gap-2">
                                <Button variant="outline" className="flex-1 rounded-xl border-[#d1e5dc] text-[#255f4f] font-bold py-6">
                                    <Heart className="mr-2 h-5 w-5" /> Amei
                                </Button>
                                <Button variant="outline" className="flex-1 rounded-xl border-[#d1e5dc] text-[#255f4f] font-bold py-6">
                                    <MessageSquare className="mr-2 h-5 w-5" /> Comentar
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </section>

            {/* Botão Flutuante para Novo Texto */}
            <button className="fixed bottom-24 right-6 md:bottom-10 md:right-10 bg-[#255f4f] text-white p-5 rounded-full shadow-2xl hover:scale-110 transition-transform z-50">
                <Plus className="h-8 w-8" />
            </button>
        </div>
    );
}