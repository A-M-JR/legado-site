import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import type { HumorTipo, MiProfile } from "../types";
import { profileService } from "../services/profileService";

interface MelhorIdadeContextValue {
    profile: MiProfile;
    refreshProfile: () => void;
    updateHumor: (humor: HumorTipo) => void;
}

const MelhorIdadeContext = createContext<MelhorIdadeContextValue | null>(null);

export function MelhorIdadeProvider({ children }: { children: ReactNode }) {
    const [profile, setProfile] = useState<MiProfile>(() => profileService.get());

    const refreshProfile = useCallback(() => {
        setProfile(profileService.get());
    }, []);

    const updateHumor = useCallback((humor: HumorTipo) => {
        const updated = profileService.updateHumor(humor);
        setProfile(updated);
    }, []);

    const value = useMemo(
        () => ({ profile, refreshProfile, updateHumor }),
        [profile, refreshProfile, updateHumor]
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
