// src/pages/legado-app/exercicios/ExerciciosHistoricoPage.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../../lib/supabaseClient";
import {
  Search,
  Calendar,
  Smile,
  FileDown,
  Sparkles,
  Wind,
  Footprints,
  Heart,
  Eye,
  Palette,
  MessageCircle,
  Moon,
  Clock,
  NotebookPen,
  History,
  ArrowLeft,
} from "lucide-react";
import LegadoLayout from "../../../components/legado/LegadoLayout";
import "@/styles/legado-app.css";

type Categoria =
  | "respiracao"
  | "movimento"
  | "gratidao"
  | "mindfulness"
  | "criatividade"
  | "conexao";

type Realizado = {
  id: string;
  exercicio_id: string;
  realizado_em: string; // ISO
  nota_humor: number | null;
  observacao: string | null;
  exercicio: {
    id: string;
    titulo: string;
    categoria: Categoria;
    grupo: string | null;
    icone: string | null;
    duracao_minutos: number | null;
  } | null;
};

const iconMap: Record<string, any> = {
  Wind,
  Footprints,
  Heart,
  Eye,
  Palette,
  MessageCircle,
  Sparkles,
  Moon,
};

const categoriaColors: Record<Categoria, string> = {
  respiracao: "#6EC1E4",
  movimento: "#FF9A56",
  gratidao: "#FF6B9D",
  mindfulness: "#9B59B6",
  criatividade: "#F39C12",
  conexao: "#2ECC71",
};

const grupoEmojis: Record<string, string> = {
  "Conexão emocional e alívio da dor": "🕊️",
  "Cuidado com o corpo e com o hoje": "🌸",
  "Memórias e significado": "💬",
  "Espiritualidade e esperança": "🌻",
  "Rotina de encerramento do dia": "🌙",
};

function formatDateTimeBR(iso: string) {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const mi = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} • ${hh}:${mi}`;
}

export default function ExerciciosHistoricoPage() {
  const navigate = useNavigate();
  const [itens, setItens] = useState<Realizado[]>([]);
  const [loading, setLoading] = useState(true);

  // filtros
  const [q, setQ] = useState("");
  const [periodo, setPeriodo] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [categoria, setCategoria] = useState<"" | Categoria>("");

  useEffect(() => {
    (async () => {
      setLoading(true);

      const { data: userRes, error: userErr } = await supabase.auth.getUser();
      if (userErr) console.error("auth.getUser error:", userErr);
      const user = userRes?.user;
      if (!user) {
        setItens([]);
        setLoading(false);
        return;
      }

      const filtroData =
        periodo === "7d"
          ? new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          : periodo === "30d"
            ? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
            : periodo === "90d"
              ? new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
              : null;

      let query = supabase
        .from("exercicios_realizados")
        .select(`
    id,
    exercicio_id,
    realizado_em,
    nota_humor,
    observacao,
    exercicio:exercicios_autocuidado!exercicio_id (
      id,
      titulo,
      categoria,
      icone,
      duracao_minutos
    )
  `)
        .eq("auth_id", user.id)
        .order("realizado_em", { ascending: false });

      if (filtroData) {
        const margem = new Date(filtroData.getTime() - 12 * 60 * 60 * 1000);
        query = query.gte("realizado_em", margem.toISOString());
      }

      const { data, error } = await query;
      if (error) console.error("Historico select error:", error);

      setItens((data as unknown as Realizado[]) || []);
      setLoading(false);
    })();
  }, [periodo]);

  const filtrados = useMemo(() => {
    return itens.filter((item) => {
      const titulo = item.exercicio?.titulo?.toLowerCase() || "";
      const matchQ = !q || titulo.includes(q.toLowerCase());
      const matchCat = !categoria || item.exercicio?.categoria === categoria;
      return matchQ && matchCat;
    });
  }, [itens, q, categoria]);

  const total = filtrados.length;

  const mediaHumor = useMemo(() => {
    const vals = filtrados.map((i) => i.nota_humor || 0).filter((v) => v > 0);
    if (!vals.length) return 0;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  }, [filtrados]);

  function exportCSV() {
    const headers = ["Data", "Título", "Categoria", "Grupo", "Humor", "Duração (min)", "Observação"];
    const rows = filtrados.map((i) => [
      formatDateTimeBR(i.realizado_em),
      (i.exercicio?.titulo || "").replace(/"/g, '""'),
      i.exercicio?.categoria || "",
      i.exercicio?.grupo || "",
      i.nota_humor ?? "",
      i.exercicio?.duracao_minutos ?? "",
      (i.observacao || "").replace(/\n/g, " ").replace(/"/g, '""'),
    ]);
    const csv = [headers, ...rows].map((r) => r.map((v) => `"${String(v)}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "historico_exercicios.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <LegadoLayout title="Histórico de Exercícios" backPath="/legado-app/exercicios">
      <div className="w-full max-w-md mx-auto">
        {/* Header com botão de export */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-semibold text-[#255f4f] flex items-center gap-2">
            <History size={20} /> Histórico de Exercícios
          </h2>

          <div className="flex items-center gap-2">
            <button
              className="legado-button !px-3 !py-1.5 text-sm flex items-center gap-2"
              onClick={exportCSV}
              title="Exportar histórico como CSV"
            >
              <FileDown size={14} /> Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="grid grid-cols-1 gap-2 mb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-3 text-gray-400" />
            <input
              className="legado-input pl-9"
              placeholder="Buscar por título..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Calendar size={16} className="absolute left-3 top-3 text-gray-400" />
              <select
                className="legado-input pl-9"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value as any)}
              >
                <option value="7d">Últimos 7 dias</option>
                <option value="30d">Últimos 30 dias</option>
                <option value="90d">Últimos 90 dias</option>
                <option value="all">Todo o período</option>
              </select>
            </div>

            <div className="flex-1">
              <select
                className="legado-input"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria | "")}
              >
                <option value="">Todas categorias</option>
                <option value="respiracao">Respiração</option>
                <option value="movimento">Movimento</option>
                <option value="gratidao">Gratidão</option>
                <option value="mindfulness">Mindfulness</option>
                <option value="criatividade">Criatividade</option>
                <option value="conexao">Conexão</option>
              </select>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="p-3 rounded-lg bg-green-50 text-green-800 text-center">
            <div className="text-sm">Total no período</div>
            <div className="text-2xl font-bold">{total}</div>
          </div>
          <div className="p-3 rounded-lg bg-yellow-50 text-yellow-800 text-center">
            <div className="flex items-center justify-center gap-1 text-sm">
              <Smile size={16} /> Humor médio
            </div>
            <div className="text-2xl font-bold">{mediaHumor ? mediaHumor.toFixed(1) : "-"}</div>
          </div>
        </div>

        {/* Lista */}
        {loading ? (
          <p className="text-center text-gray-500">Carregando...</p>
        ) : filtrados.length === 0 ? (
          <div className="p-6 rounded-lg bg-white/60 backdrop-blur-sm border border-white/30 text-center">
            <p className="text-gray-700 mb-2">Nenhum exercício encontrado no período.</p>
            <p className="text-sm text-gray-500">Ajuste os filtros para ver registros antigos.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtrados.map((item) => {
              const ex = item.exercicio;
              const cor = ex?.categoria ? categoriaColors[ex.categoria] : "#6c63ff";
              const emoji = ex?.grupo ? grupoEmojis[ex.grupo] || "✨" : "🌤️";
              const Icon = ex?.icone ? iconMap[ex.icone] || Sparkles : Sparkles;

              return (
                <div
                  key={item.id}
                  className="p-4 rounded-xl border bg-white/80 backdrop-blur-sm hover:shadow-md transition-shadow"
                  style={{ borderLeft: `4px solid ${cor}` }}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full flex-shrink-0" style={{ backgroundColor: `${cor}22` }}>
                      <Icon size={20} style={{ color: cor }} />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <div className="text-lg">{emoji}</div>
                          <h3 className="font-semibold text-gray-800 text-sm">{ex?.titulo || "Exercício"}</h3>
                        </div>

                        <span className="text-xs text-gray-500">{formatDateTimeBR(item.realizado_em)}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span>{ex?.categoria || "Sem categoria"}</span>
                        {ex?.duracao_minutos ? (
                          <span className="flex items-center gap-1">
                            <Clock size={14} /> {ex.duracao_minutos} min
                          </span>
                        ) : null}
                        {item.nota_humor ? (
                          <span className="flex items-center gap-1">
                            <Smile size={14} /> {item.nota_humor}/5
                          </span>
                        ) : null}
                      </div>

                      {item.observacao && (
                        <div className="mt-2 p-2 rounded bg-gray-50 text-gray-700 text-sm">
                          <span className="font-semibold">Observação:</span>{" "}
                          <span className="whitespace-pre-wrap">{item.observacao}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </LegadoLayout>
  );
}