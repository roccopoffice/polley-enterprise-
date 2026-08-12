import Link from "next/link";
import { Button } from "@/components/Button";

type CTASectionProps = {
  title: string;
  description: string;
  primaryText: string;
  primaryHref: string;
  secondaryText?: string;
  secondaryHref?: string;
};

export function CTASection({
  title,
  description,
  primaryText,
  primaryHref,
  secondaryText,
  secondaryHref,
}: CTASectionProps) {
  return (
    <section className="bg-enterprise-navy py-20">
      <div className="mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-3xl font-bold text-white md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-white/80 md:text-lg">{description}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href={primaryHref}>
            <Button className="w-full min-w-52 sm:w-auto">{primaryText}</Button>
          </Link>
          {secondaryText && secondaryHref ? (
            <Link href={secondaryHref}>
              <Button variant="secondary" className="w-full min-w-52 border-white text-white hover:bg-white/10 sm:w-auto">
                {secondaryText}
              </Button>
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}
