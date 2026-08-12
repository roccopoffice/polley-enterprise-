type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow ? (
        <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-enterprise-blue/20 bg-gradient-to-r from-white to-enterprise-light px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-enterprise-blue shadow-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-enterprise-gold" />
          {eyebrow}
        </p>
      ) : null}
      <h2
        className={
          align === "center"
            ? "gold-underline text-2xl font-bold leading-[1.1] tracking-tight text-enterprise-charcoal sm:text-3xl md:text-[3.1rem] md:leading-[1.08]"
            : "text-2xl font-bold leading-[1.1] tracking-tight text-enterprise-charcoal sm:text-3xl md:text-[3.1rem] md:leading-[1.08]"
        }
      >
        {title}
      </h2>
      {description ? (
        <p className="mt-5 text-base leading-relaxed text-enterprise-gray md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}
