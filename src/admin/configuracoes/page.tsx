import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import {
    Save,
    Palette,
    Globe,
    ShieldAlert,
    Mail,
    Upload,
    AlertTriangle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // ⬅️ ADICIONE ESTA LINHA

type ConfigSistema = {
    id: string;
    nome_sistema: string | null;
    logo_url: string | null;
    cor_primaria: string | null;
    email_suporte: string | null;
    manutencao_ativa: boolean | null;
    permite_novos_cadastros: boolean | null;
};

export default function ConfiguracoesPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [config, setConfig] = useState<ConfigSistema | null>(null);
    const { toast } = useToast(); // ⬅️ ADICIONE ESTA LINHA

    useEffect(() => {
        async function loadConfig() {
            const { data, error } = await supabase
                .from("config_sistema")
                .select("*")
                .limit(1)
                .maybeSingle();

            if (!error && data) {
                setConfig(data as ConfigSistema);
            }
            setLoading(false);
        }
        loadConfig();
    }, []);

    const handleSave = async () => {
        if (!config) return;
        setSaving(true);

        const { id, ...rest } = config;

        const { error } = await supabase
            .from("config_sistema")
            .update({
                ...rest,
                updated_at: new Date().toISOString(),
            })
            .eq("id", id);

        if (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Erro ao salvar",
                description: "Não foi possível atualizar as configurações. Tente novamente.",
            });
        } else {
            toast({
                title: "✅ Configurações salvas!",
                description: "As alterações foram aplicadas com sucesso.",
            });
        }
        setSaving(false);
    };

    if (loading || !config) {
        return (
            <div className="p-8 text-center text-legado-primary animate-pulse">
                Carregando configurações...
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-12">
            {/* HEADER */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[#255f4f]">
                        Configurações do Sistema
                    </h1>
                    <p className="text-[#6b8c7d]">
                        Gerencie identidade visual, suporte e regras globais.
                    </p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-legado-primary hover:bg-legado-primary-dark text-white px-6 py-2.5 rounded-xl font-semibold transition-all shadow-lg disabled:opacity-50"
                >
                    {saving ? (
                        <div className="h-5 w-5 animate-spin border-2 border-white/30 border-t-white rounded-full" />
                    ) : (
                        <Save size={20} />
                    )}
                    Salvar
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* COLUNA ESQUERDA (IDENTIDADE + SUPORTE) */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Identidade Visual */}
                    <section className="bg-white p-6 rounded-2xl border border-[#e0f0ea] shadow-sm">
                        <div className="flex items-center gap-3 mb-6 text-[#255f4f]">
                            <Palette size={22} />
                            <h2 className="font-bold text-lg">
                                Identidade Visual (White Label)
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#4f665a]">
                                    Nome da Plataforma
                                </label>
                                <input
                                    type="text"
                                    value={config.nome_sistema ?? ""}
                                    onChange={(e) =>
                                        setConfig({
                                            ...config,
                                            nome_sistema: e.target.value,
                                        })
                                    }
                                    className="w-full p-3 rounded-xl border border-[#d1e5dc] focus:ring-2 focus:ring-legado-primary outline-none transition-all"
                                    placeholder="Ex: Legado & Conforto"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#4f665a]">
                                    Cor Primária
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="color"
                                        value={config.cor_primaria || "#5ba58c"}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                cor_primaria: e.target.value,
                                            })
                                        }
                                        className="h-12 w-20 rounded-lg border border-[#d1e5dc] cursor-pointer"
                                    />
                                    <input
                                        type="text"
                                        value={config.cor_primaria || "#5ba58c"}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                cor_primaria: e.target.value,
                                            })
                                        }
                                        className="flex-1 p-3 rounded-xl border border-[#d1e5dc] outline-none"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-sm font-bold text-[#4f665a]">
                                    URL da Logo (PNG/SVG)
                                </label>
                                <div className="flex gap-3">
                                    <input
                                        type="text"
                                        value={config.logo_url ?? ""}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                logo_url: e.target.value,
                                            })
                                        }
                                        className="flex-1 p-3 rounded-xl border border-[#d1e5dc] outline-none"
                                        placeholder="https://link-da-sua-logo.com/logo.png"
                                    />
                                    <button
                                        type="button"
                                        className="p-3 bg-[#f4fbf8] text-legado-primary rounded-xl border border-[#d1e5dc] hover:bg-[#e3f1eb] transition-all"
                                    >
                                        <Upload size={20} />
                                    </button>
                                </div>

                                {config.logo_url && (
                                    <div className="mt-3">
                                        <p className="text-xs text-[#6b8c7d] mb-1">
                                            Prévia:
                                        </p>
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-xl bg-[#e3f1eb] flex items-center justify-center">
                                                <img
                                                    src={config.logo_url}
                                                    alt="Logo preview"
                                                    className="max-h-10 max-w-full object-contain"
                                                />
                                            </div>
                                            <span className="text-xs text-[#4f665a]">
                                                A logo acima será usada no Admin e no Portal de Seleção de Módulos.
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Comunicação e Suporte */}
                    <section className="bg-white p-6 rounded-2xl border border-[#e0f0ea] shadow-sm">
                        <div className="flex items-center gap-3 mb-6 text-[#255f4f]">
                            <Globe size={22} />
                            <h2 className="font-bold text-lg">
                                Comunicação e Suporte
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-[#4f665a]">
                                    E-mail de Suporte ao Cliente
                                </label>
                                <div className="relative">
                                    <Mail
                                        className="absolute left-3 top-3.5 text-[#9db4aa]"
                                        size={18}
                                    />
                                    <input
                                        type="email"
                                        value={config.email_suporte ?? ""}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                email_suporte: e.target.value,
                                            })
                                        }
                                        className="w-full pl-10 p-3 rounded-xl border border-[#d1e5dc] outline-none"
                                        placeholder="suporte@legado.com"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* COLUNA DIREITA – STATUS & REGRAS */}
                <div className="space-y-6">
                    <section className="bg-white p-6 rounded-2xl border border-[#e0f0ea] shadow-sm">
                        <div className="flex items-center gap-3 mb-6 text-[#255f4f]">
                            <ShieldAlert size={22} />
                            <h2 className="font-bold text-lg">Status do Sistema</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Manutenção */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f4fbf8] border border-[#e3f1eb]">
                                <div>
                                    <p className="font-bold text-[#255f4f] text-sm">
                                        Modo Manutenção
                                    </p>
                                    <p className="text-[11px] text-[#6b8c7d]">
                                        Bloqueia o acesso de clientes enquanto estiver ativo.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!config.manutencao_ativa}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                manutencao_ativa: e.target.checked,
                                            })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-red-500 relative transition-colors">
                                        <div className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                                    </div>
                                </label>
                            </div>

                            {/* Novos cadastros */}
                            <div className="flex items-center justify-between p-4 rounded-xl bg-[#f4fbf8] border border-[#e3f1eb]">
                                <div>
                                    <p className="font-bold text-[#255f4f] text-sm">
                                        Novos Cadastros
                                    </p>
                                    <p className="text-[11px] text-[#6b8c7d]">
                                        Controla se novos titulares podem ser criados.
                                    </p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={!!config.permite_novos_cadastros}
                                        onChange={(e) =>
                                            setConfig({
                                                ...config,
                                                permite_novos_cadastros:
                                                    e.target.checked,
                                            })
                                        }
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-legado-primary relative transition-colors">
                                        <div className="absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-5" />
                                    </div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Card de Aviso */}
                    <div className="bg-[#fffbeb] p-6 rounded-2xl border border-[#fef3c7] flex gap-4">
                        <AlertTriangle
                            className="text-[#d97706] shrink-0"
                            size={24}
                        />
                        <div>
                            <p className="text-sm font-bold text-[#92400e]">
                                Atenção
                            </p>
                            <p className="text-xs text-[#b45309] leading-relaxed">
                                Alterações neste painel são globais e afetam todos os
                                parceiros e clientes da plataforma em tempo real.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}