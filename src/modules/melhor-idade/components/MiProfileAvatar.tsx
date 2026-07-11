import { useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import clsx from "clsx";

type MiProfileAvatarProps = {
    nome?: string;
    fotoUrl?: string;
    size?: "md" | "lg";
    onClick?: () => void;
    className?: string;
};

const SIZES = {
    md: "w-16 h-16 sm:w-20 sm:h-20",
    lg: "w-28 h-28",
};

const ICON_SIZES = {
    md: "h-8 w-8 sm:h-10 sm:w-10",
    lg: "h-14 w-14",
};

export function MiProfileAvatar({
    nome,
    fotoUrl,
    size = "md",
    onClick,
    className,
}: MiProfileAvatarProps) {
    const Wrapper = onClick ? "button" : "div";

    return (
        <Wrapper
            type={onClick ? "button" : undefined}
            onClick={onClick}
            className={clsx(
                "rounded-full shrink-0 border-4 border-white shadow-lg overflow-hidden",
                SIZES[size],
                onClick && "hover:ring-2 hover:ring-[#5ba58c]/50 transition",
                className
            )}
            aria-label={onClick ? "Configurar perfil" : undefined}
        >
            {fotoUrl ? (
                <img
                    src={fotoUrl}
                    alt={nome || "Foto do perfil"}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-[#e3f1eb] flex items-center justify-center">
                    <User className={clsx("text-[#5ba58c]", ICON_SIZES[size])} />
                </div>
            )}
        </Wrapper>
    );
}

export function MiProfileGreeting({
    nome,
    fotoUrl,
    onConfigurar,
}: {
    nome?: string;
    fotoUrl?: string;
    onConfigurar?: () => void;
}) {
    const navigate = useNavigate();
    const abrirPerfil = onConfigurar ?? (() => navigate("/melhor-idade/perfil"));

    return (
        <section className="flex items-center gap-4 sm:gap-5">
            <MiProfileAvatar
                nome={nome}
                fotoUrl={fotoUrl}
                onClick={abrirPerfil}
            />
            <div className="flex-1 min-w-0">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#255f4f] truncate">
                    Olá, {nome || "você"}! 👋
                </h1>
                <p className="text-sm sm:text-base text-[#6b8c7d]">Hoje é um novo dia.</p>
                <button
                    type="button"
                    onClick={abrirPerfil}
                    className="mt-1 text-sm font-semibold text-[#5ba58c] hover:underline"
                >
                    Configurar meu perfil
                </button>
            </div>
        </section>
    );
}
