import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HumorTipo, MiProfile, PessoaRede } from "../types";
import { profileService } from "../services/profileService";

const DEFAULT_PROFILE: MiProfile = {
    onboardingComplete: false,
    nome: "",
    rede: [],
};

interface MelhorIdadeContextValue {
    profile: MiProfile;
    loading: boolean;
    refreshProfile: () => Promise<void>;
    updateHumor: (humor: HumorTipo) => Promise<void>;
    updateProfile: (data: { nome?: string; fotoUrl?: string; rede?: PessoaRede[] }) => Promise<void>;
}

const MelhorIdadeContext = createContext<MelhorIdadeContextValue | null>(null);

export function MelhorIdadeProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<MiProfile>(DEFAULT_PROFILE);
    const [loading, setLoading] = useState(true);

    const refreshProfile = useCallback(async () => {
        const data = await profileService.get();
        setProfile(data);
    }, []);

    useEffect(() => {
        refreshProfile().finally(() => setLoading(false));
    }, [refreshProfile]);

    const updateHumor = useCallback(async (humor: HumorTipo) => {
        const updated = await profileService.updateHumor(humor);
        setProfile(updated);
    }, []);

    const updateProfile = useCallback(
        async (data: { nome?: string; fotoUrl?: string; rede?: PessoaRede[] }) => {
            const updated = await profileService.updateProfile(data);
            setProfile(updated);
        },
        []
    );

    const value = useMemo(
        () => ({ profile, loading, refreshProfile, updateHumor, updateProfile }),
        [profile, loading, refreshProfile, updateHumor, updateProfile]
    );

    return (
        <MelhorIdadeContext.Provider value={value}>
            {children}
        </MelhorIdadeContext.Provider>
    );
}

export function useMelhorIdade() {
    const ctx = useContext(MelhorIdadeContext);
    if (!ctx) throw new Error("useMelhorIdade deve ser usado dentro de MelhorIdadeProvider");
    return ctx;
}
