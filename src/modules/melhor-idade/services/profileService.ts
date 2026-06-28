import type { HumorTipo, MiProfile, PessoaRede } from "../types";
import { readStorage, writeStorage } from "./storage";

const PROFILE_KEY = "profile";

const DEFAULT_PROFILE: MiProfile = {
    onboardingComplete: false,
    nome: "",
    rede: [],
};

export const profileService = {
    get(): MiProfile {
        return readStorage(PROFILE_KEY, DEFAULT_PROFILE);
    },

    save(profile: MiProfile): MiProfile {
        writeStorage(PROFILE_KEY, profile);
        return profile;
    },

    completeOnboarding(data: {
        nome: string;
        rede: PessoaRede[];
        humor: HumorTipo;
        fotoUrl?: string;
    }): MiProfile {
        const profile: MiProfile = {
            onboardingComplete: true,
            nome: data.nome,
            fotoUrl: data.fotoUrl,
            rede: data.rede,
            humorAtual: data.humor,
            humorAtualizadoEm: new Date().toISOString(),
        };
        return this.save(profile);
    },

    updateHumor(humor: HumorTipo): MiProfile {
        const current = this.get();
        return this.save({
            ...current,
            humorAtual: humor,
            humorAtualizadoEm: new Date().toISOString(),
        });
    },

    isOnboardingComplete(): boolean {
        return this.get().onboardingComplete;
    },
};
