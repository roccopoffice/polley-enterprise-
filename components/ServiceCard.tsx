import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

type ServiceCardProps = {
  title: string;
  description: string;
  href: string;
  imageSrc: string;
  imageAlt: string;
  icon: ReactNode;
  ctaLabel?: string;
};

export function ServiceCard({
  title,
  description,
  href,
  imageSrc,
  imageAlt,
  icon,
  ctaLabel = "Learn More",
}: ServiceCardProps) {
  const isAnchor = href.startsWith("#");

  return (
    <article className="group card-glow overflow-hidden rounded-3xl border border-enterprise-border/80 bg-white shadow-[0_14px_35px_rgba(6,33,63,0.07)]">
      <div className="relative h-48 overflow-hidden sm:h-56">
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover saturate-90 transition duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-enterprise-navy/55 via-enterprise-navy/10 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-[3px] scale-x-0 bg-gradient-to-r from-enterprise-blue via-enterprise-gold to-enterprise-blue transition-transform duration-500 group-hover:scale-x-100" />
      </div>
      <div className="space-y-4 p-5 sm:p-6 md:p-7">
        <div className="inline-flex rounded-full border border-enterprise-border bg-enterprise-light p-2 text-enterprise-blue shadow-[0_0_16px_rgba(30,136,229,0.28)] transition-colors duration-300 group-hover:border-enterprise-gold/50 group-hover:text-enterprise-navy">
          {icon}
        </div>
        <h3 className="text-xl font-bold leading-tight text-enterprise-charcoal sm:text-[1.45rem]">{title}</h3>
        <p className="text-base leading-relaxed text-enterprise-gray">{description}</p>
        {isAnchor ? (
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-enterprise-blue transition hover:gap-3"
          >
            Get Quote <ArrowRight className="h-4 w-4" />
          </a>
        ) : (
          <Link
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.12em] text-enterprise-blue transition hover:gap-3"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </article>
  );
}
