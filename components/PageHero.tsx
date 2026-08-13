import type { ReactNode } from "react";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="bg-enterprise-navy text-white">
      <div className="container-enterprise flex min-h-[42vh] flex-col justify-end pb-16 pt-36 md:pt-44">
        <div className="animate-hero-in max-w-2xl">
          <p className="eyebrow eyebrow-light mb-6">{eyebrow}</p>
          <h1 className="heading-display text-white">{title}</h1>
          <p className="mt-6 max-w-xl text-base leading-[1.75] text-white/70 sm:text-lg">
            {description}
          </p>
          {children ? <div className="mt-8">{children}</div> : null}
        </div>
      </div>
    </section>
  );
}
