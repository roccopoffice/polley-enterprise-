type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  dark?: boolean;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
  dark = false,
}: SectionHeaderProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow ? (
        <p className={dark ? "eyebrow eyebrow-light mb-6" : "eyebrow mb-6"}>{eyebrow}</p>
      ) : null}
      <h2 className={dark ? "heading-display text-white" : "heading-display text-enterprise-charcoal"}>
        {title}
      </h2>
      {description ? (
        <p
          className={
            dark
              ? "mt-6 text-base leading-[1.75] text-white/70 sm:text-lg"
              : "mt-6 text-base leading-[1.75] text-enterprise-gray sm:text-lg"
          }
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
