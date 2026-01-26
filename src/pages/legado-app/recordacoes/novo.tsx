import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, CheckCircle, Sparkles } from "lucide-react";
import { supabase } from "../../../lib/supabaseClient";
import "@/styles/legado-app.css";
import LegadoLayout from "@/components/legado/LegadoLayout";

export default function NovaRecordacaoPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [nomeRemetente, setNomeRemetente] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [anonimo, setAnonimo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [homenageado, setHomenageado] = useState<any>(null);
  const [modal, setModal] = useState<{ visible: boolean; message: string }>({ visible: false, message: "" });

  function showAlert(message: string) {
    setModal({ visible: true, message });
  }

  useEffect(() => {
    (async () => {
      if (!id) return;
      const { data, error } = await supabase.from("dependentes").select("*").eq("id", id).maybeSingle();
      if (error || !data) {
        showAlert("Não foi possível carregar o homenageado.");
        return;
      }
      setHomenageado(data);
    })();
  }, [id]);

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        showAlert("Selecione uma imagem com menos de 1MB.");
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!mensagem.trim() || (!anonimo && !nomeRemetente.trim())) {
      showAlert("Preencha os campos obrigatórios.");
      return;
    }

    setLoading(true);
    let imagemUrl: string | null = null;

    try {
      if (image) {
        const ext = image.name.split(".").pop();
        const fileName = `recordacao_${Date.now()}.${ext}`;
        const path = `recordacoes/${fileName}`;

        const { error: uploadError } = await supabase.storage.from("recordacoes").upload(path, image, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from("recordacoes").getPublicUrl(path);
        imagemUrl = urlData?.publicUrl || null;
      }

      const remetente = anonimo ? "Anônimo" : nomeRemetente.trim();
      const { error } = await supabase.from("recordacoes").insert({
        dependente_id: id,
        mensagem: `${mensagem.trim()}\n\n– ${remetente}`,
        imagem_url: imagemUrl,
      });
      if (error) throw error;

      setSuccessVisible(true);
      setTimeout(() => {
        setSuccessVisible(false);
        navigate(-1);
      }, 1400);
    } catch (err) {
      showAlert("Não foi possível salvar sua recordação.");
    } finally {
      setLoading(false);
    }
  }

  const nomeHomenageado = useMemo(() => homenageado?.nome || "Homenageado", [homenageado]);

  return (
    <LegadoLayout title="Nova Recordação" subtitle={`Escreva uma mensagem carinhosa para ${nomeHomenageado}`}> 
      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-sm border border-white/40 rounded-3xl p-6 shadow-xl space-y-5 w-full">
        {homenageado && (
          <div className="flex flex-col items-center">
            {homenageado.imagem_url ? (
              <img src={homenageado.imagem_url} alt={homenageado.nome} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
            ) : (
              <div className="w-20 h-20 rounded-full bg-[#f0fbf8] flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-[#255f4f] text-2xl font-bold">{nomeHomenageado[0]}</span>
              </div>
            )}
            <p className="mt-2 font-bold text-[#255f4f]">{nomeHomenageado}</p>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-[#255f4f] opacity-60 ml-1">Mensagem</label>
          <textarea
            className="legado-input min-h-[120px] bg-white/80 border-[#def0e8] focus:border-[#5ba58c] transition-all w-full"
            placeholder="Escreva sua mensagem aqui..."
            value={mensagem}
            onChange={(e) => setMensagem(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-center">
          <label className="flex items-center gap-2 bg-[#D1F2EB] hover:bg-[#c3efe6] text-[#007080] px-5 py-2.5 rounded-2xl font-bold text-sm shadow-sm cursor-pointer transition-all active:scale-95">
            <ImageIcon size={18} />
            Anexar imagem
            <input type="file" accept="image/*" hidden onChange={handleImageChange} />
          </label>
        </div>

        {previewUrl && (
          <div className="relative group mx-auto w-fit animate-in zoom-in-90">
            <img src={previewUrl} alt="Preview" className="max-h-40 rounded-2xl border-2 border-white shadow-md" />
            <button type="button" onClick={() => { setImage(null); setPreviewUrl(null); }} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg">
              <Sparkles size={14} />
            </button>
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-widest text-[#255f4f] opacity-60 ml-1">Seu nome</label>
          <input
            type="text"
            className="legado-input bg-white/80 border-[#def0e8] w-full"
            placeholder="Como você quer ser identificado?"
            value={nomeRemetente}
            onChange={(e) => setNomeRemetente(e.target.value)}
            disabled={anonimo}
            required={!anonimo}
          />
        </div>

        <div className="flex items-center justify-center gap-2 py-1">
          <input id="anonimo" type="checkbox" checked={anonimo} onChange={(e) => setAnonimo(e.target.checked)} className="w-5 h-5 rounded-lg border-[#def0e8] text-[#5ba58c] focus:ring-[#5ba58c]" />
          <label htmlFor="anonimo" className="text-sm font-bold text-[#4f665a] cursor-pointer">Enviar como anônimo</label>
        </div>

        <button type="submit" disabled={loading} className="w-full bg-[#5ba58c] hover:bg-[#4c947e] text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50">
          {loading ? <span className="animate-spin"><Sparkles size={22} /></span> : <CheckCircle size={22} />}
          <span>{loading ? "Enviando..." : "Enviar Recordação"}</span>
        </button>

        {modal.visible && (
          <div className="legado-alert mt-4 flex items-center justify-between gap-3">
            <div className="text-sm">{modal.message}</div>
            <button onClick={() => setModal({ visible: false, message: "" })} type="button" aria-label="Fechar alerta" className="text-white font-bold px-3 py-1 rounded-md">x</button>
          </div>
        )}

        {successVisible && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-xs w-full shadow-2xl flex flex-col items-center gap-3">
              <CheckCircle size={44} className="text-emerald-600" />
              <div className="text-emerald-600 font-extrabold">Recordação enviada 💙</div>
            </div>
          </div>
        )}
      </form>
    </LegadoLayout>
  );
}