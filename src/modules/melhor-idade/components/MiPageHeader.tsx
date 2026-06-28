interface MiPageHeaderProps {
    eyebrow?: string;
    title: string;
    subtitle?: string;
}

export function MiPageHeader({ eyebrow, title, subtitle }: MiPageHeaderProps) {
    return (
        <section className="space-y-1">
            {eyebrow && (
                <p className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-[#9db4aa]">
                    {eyebrow}
                </p>
            )}
            <h1 className="text-2xl sm:text-3xl font-bold text-[#255f4f] leading-tight">
                {title}
            </h1>
            {subtitle && (
                <p className="text-sm sm:text-base text-[#6b8c7d] leading-relaxed max-w-prose">
                    {subtitle}
                </p>
            )}
        </section>
    );
}
