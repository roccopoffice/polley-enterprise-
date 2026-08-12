import type { ReactNode } from "react";
import { SectionHeader } from "@/components/SectionHeader";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, description, children }: PageHeroProps) {
  return (
    <section className="bg-enterprise-light pb-16 pt-32">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader eyebrow={eyebrow} title={title} description={description} />
        {children ? <div className="mt-8">{children}</div> : null}
      </div>
    </section>
  );
}
