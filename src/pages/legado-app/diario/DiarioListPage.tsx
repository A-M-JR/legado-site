import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import { Plus, NotebookPen, Edit, Trash2, Lock, Heart } from "lucide-react";
import LegadoLayout from "@/components/legado/LegadoLayout";
import "@/styles/legado-app.css";

type Diario = {
  id: string;
  auth_id: string;
  titular_ou_dependente_id?: string | null;
  tipo_pessoa?: "titular" | "dependente" | null;
  titulo: string;
  conteudo: string;
  humor?: number | null;
  privado: boolean;
  created_at: string;
  updated_at: string;
};

export default function DiarioListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState<Diario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data, error } = await supabase
        .from("diarios_luto")
        .select("*")
        .eq("auth_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setItems(data as Diario[]);
      setLoading(false);
    })();
  }, []);

  async function remover(id: string) {
    if (!confirm("Deseja excluir esta entrada do diário?")) return;
    const { error } = await supabase.from("diarios_luto").delete().eq("id", id);
    if (!error) setItems((prev) => prev.filter((i) => i.id !== id));
  }

  function formatDateHuman(dt: string) {
    const d = new Date(dt);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(d);
    data.setHours(0, 0, 0, 0);
    const diff = (hoje.getTime() - data.getTime()) / (1000 * 60 * 60 * 24);
    if (diff === 0)
      return `Hoje • ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    if (diff === 1)
      return `Ontem • ${d.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    return d.toLocaleString();
  }

  const empty = useMemo(() => !loading && items.length === 0, [loading, items]);

  return (
    <LegadoLayout
      title="Meu Diário do Luto"
      subtitle="Um espaço seguro para acolher seus sentimentos. Escreva no seu tempo."
    >
      <div className="w-full space-y-6">
        {/* CTA central */}
        <div className="w-full flex justify-center">
          <button
            className="flex items-center justify-center gap-2 bg-[#6c63ff] text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-[#5a52d5] transition-all active:scale-95 w-full max-w-[280px]"
            onClick={() => navigate("/legado-app/diario/novo")}
          >
            <Plus size={20} />
            Nova entrada
          </button>
        </div>

        {/* Loader / Empty / Lista */}
        {loading ? (
          <div className="space-y-4 px-1">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 w-full bg-white/50 animate-pulse rounded-2xl border border-[#e6f2ee]"
              />
            ))}
          </div>
        ) : empty ? (
          <div className="text-center text-[#4f665a] bg-white/60 backdrop-blur-sm border border-[#e6f2ee] rounded-2xl p-8 shadow-sm mx-1">
            <div className="flex justify-center mb-3">
              <div className="w-12 h-12 rounded-full bg-[#f0f7f4] flex items-center justify-center">
                <Heart size={24} className="text-[#255f4f] opacity-40" />
              </div>
            </div>
            <p className="font-bold text-lg text-[#255f4f]">
              Que tal começar com poucas linhas?
            </p>
            <p className="text-sm mt-2 opacity-80">
              Você pode registrar algo simples como “hoje me senti...”.
            </p>
            <button
              className="mt-6 text-[#6c63ff] font-bold hover:underline"
              onClick={() => navigate("/legado-app/diario/novo")}
            >
              Começar agora
            </button>
          </div>
        ) : (
          <div className="space-y-4 px-1">
            {items.map((it) => (
              <div
                key={it.id}
                className="group relative bg-white border border-[#e6f2ee] p-5 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-lg text-[#255f4f] truncate">
                        {it.titulo || "(Sem título)"}
                      </h3>
                      {it.privado && (
                        <Lock size={14} className="text-[#94a3b8]" />
                      )}
                    </div>
                    <p className="text-xs font-medium text-[#64748b] uppercase tracking-wider">
                      {formatDateHuman(it.created_at)}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      title="Editar"
                      className="p-2 text-[#64748b] hover:text-[#255f4f] hover:bg-[#f1f5f9] rounded-lg transition-colors"
                      onClick={() =>
                        navigate(`/legado-app/diario/editar/${it.id}`)
                      }
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      title="Excluir"
                      className="p-2 text-[#64748b] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      onClick={() => remover(it.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Humor em carinhas */}
                {typeof it.humor === "number" &&
                  it.humor >= 1 &&
                  it.humor <= 5 && (
                    <div className="mt-3 flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-base ${
                              i < it.humor ? "grayscale-0" : "grayscale opacity-30"
                            }`}
                          >
                            😊
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Preview */}
                <p className="mt-3 text-[#475569] text-sm leading-relaxed line-clamp-3 italic">
                  "{it.conteudo}"
                </p>

                <div className="mt-4 pt-4 border-t border-[#f1f5f9] flex items-center justify-between">
                  <button
                    className="text-[#6c63ff] text-sm font-bold hover:underline flex items-center gap-1"
                    onClick={() =>
                      navigate(`/legado-app/diario/editar/${it.id}`)
                    }
                  >
                    Ler entrada completa
                  </button>
                  {it.tipo_pessoa && it.titular_ou_dependente_id && (
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-md bg-[#e9f8f4] text-[#255f4f]">
                      {it.tipo_pessoa}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </LegadoLayout>
  );
}