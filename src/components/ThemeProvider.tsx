// src/components/ThemeProvider.tsx
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

/**
 * Função auxiliar para escurecer uma cor hexadecimal
 * Útil para criar variações de hover/active
 */
function darkenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.max(0, (num >> 16) - Math.round(255 * percent));
    const g = Math.max(0, ((num >> 8) & 0x00FF) - Math.round(255 * percent));
    const b = Math.max(0, (num & 0x0000FF) - Math.round(255 * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/**
 * Função auxiliar para clarear uma cor hexadecimal
 * Útil para fundos suaves
 */
function lightenColor(hex: string, percent: number): string {
    const num = parseInt(hex.replace("#", ""), 16);
    const r = Math.min(255, (num >> 16) + Math.round(255 * percent));
    const g = Math.min(255, ((num >> 8) & 0x00FF) + Math.round(255 * percent));
    const b = Math.min(255, (num & 0x0000FF) + Math.round(255 * percent));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function ThemeProvider() {
    useEffect(() => {
        async function applyTheme() {
            const { data } = await supabase
                .from("config_sistema")
                .select("cor_primaria")
                .limit(1)
                .maybeSingle();

            if (data?.cor_primaria) {
                const corPrimaria = data.cor_primaria;

                // Injeta a cor principal
                document.documentElement.style.setProperty('--primary-color', corPrimaria);

                // Cria variações automáticas
                document.documentElement.style.setProperty(
                    '--primary-color-light',
                    lightenColor(corPrimaria, 0.4)
                );
                document.documentElement.style.setProperty(
                    '--primary-color-dark',
                    darkenColor(corPrimaria, 0.15)
                );

                console.log('🎨 Tema aplicado:', corPrimaria);
            }
        }
        applyTheme();

        // Listener para mudanças em tempo real (opcional, mas muito útil)
        const channel = supabase
            .channel('config-changes')
            .on('postgres_changes',
                { event: 'UPDATE', schema: 'public', table: 'config_sistema' },
                (payload) => {
                    if (payload.new.cor_primaria) {
                        const novaCor = payload.new.cor_primaria;
                        document.documentElement.style.setProperty('--primary-color', novaCor);
                        document.documentElement.style.setProperty(
                            '--primary-color-light',
                            lightenColor(novaCor, 0.4)
                        );
                        document.documentElement.style.setProperty(
                            '--primary-color-dark',
                            darkenColor(novaCor, 0.15)
                        );
                        console.log('🎨 Tema atualizado em tempo real:', novaCor);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    return null;
}