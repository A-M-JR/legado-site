import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { CheckCircle, Loader2 } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import "@/styles/legado-app.css";
import LegadoLayout from "@/components/legado/LegadoLayout";
import RecordacaoForm, { type HomenageadoInfo } from "@/components/recordacoes/RecordacaoForm";

export default function NovaRecordacaoPage({ embedded = false }: { embedded?: boolean }) {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [loadingPerson, setLoadingPerson] = useState(true);
  const [successVisible, setSuccessVisible] = useState(false);
  const [homenageado, setHomenageado] = useState<HomenageadoInfo | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      if (!id) return;
      setLoadingPerson(true);
      let { data } = await supabase.from("dependentes").select("*").eq("id", id).maybeSingle();
      if (!data) {
        const result = await supabase.from("titulares").select("*").eq("id", id).maybeSingle();
        data = result.data;
      }
      if (!data) {
        setErro("Não foi possível carregar o perfil.");
      } else {
        setHomenageado(data);
      }
      setLoadingPerson(false);
    })();
  }, [id]);

  async function handleSubmit({
    mensagem,
    nome,
    anonimo,
    file,
  }: {
    mensagem: string;
    nome: string;
    anonimo: boolean;
    file: File | null;
  }) {
    setLoading(true);
    setErro(null);

    try {
      let imagemUrl: string | null = null;

      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const fileName = `recordacao_${Date.now()}.${ext}`;
        const path = `recordacoes/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("recordacoes").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("recordacoes").getPublicUrl(path);
        imagemUrl = urlData?.publicUrl || null;
      }

      const remetente = anonimo ? "Anônimo" : nome.trim();
      const { error } = await supabase.from("recordacoes").insert({
        dependente_id: id,
        mensagem: `${mensagem}\n\n– ${remetente}`,
        imagem_url: imagemUrl,
      });
      if (error) throw error;

      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        navigate(-1);
      }, 1400);
    } catch {
      setErro("Não foi possível salvar sua recordação.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <LegadoLayout
      embedded={embedded}
      showBack={!embedded}
      title="Nova recordação"
      subtitle={homenageado ? `Para ${homenageado.nome}` : "Compartilhe uma mensagem especial"}
    >
      {loadingPerson ? (
        <div className="flex justify-center py-12 text-[#5ba58c]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : erro && !homenageado ? (
        <p className="text-center text-red-600 py-8">{erro}</p>
      ) : homenageado ? (
        <>
          <RecordacaoForm person={homenageado} loading={loading} onSubmit={handleSubmit} />
          {erro && (
            <p className="mt-4 text-sm text-red-600 text-center">{erro}</p>
          )}
        </>
      ) : null}

      {successVisible && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-xs w-full shadow-2xl flex flex-col items-center gap-3">
            <CheckCircle size={48} className="text-emerald-600" />
            <p className="text-emerald-700 font-bold text-lg">Recordação enviada 💙</p>
          </div>
        </div>
      )}
    </LegadoLayout>
  );
}
