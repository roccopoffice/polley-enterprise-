import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { UnifiedQuoteForm } from "@/components/forms/UnifiedQuoteForm";

export const metadata: Metadata = {
  title: "Quotes | Polley Enterprise",
  description: "One quick quote form for all Polley Enterprise services.",
  openGraph: {
    title: "Quotes | Polley Enterprise",
    description: "Simple quote request page with one form.",
  },
  keywords: ["quote request", "Houston hauling quote", "transport quote"],
};

export default function QuotesPage() {
  const nextSteps = [
    "We review your service request.",
    "We call or email to confirm details.",
    "You get clear next steps before scheduling.",
  ];

  return (
    <>
      <PageHero
        eyebrow="Quotes"
        title="Request your quote in one step"
        description="Share what you need and our team will follow up quickly with next steps."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          <UnifiedQuoteForm />
          <aside className="h-fit">
            <h3 className="font-display text-2xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
              Need quick help?
            </h3>
            <p className="mt-3 text-[0.9375rem] leading-[1.7] text-enterprise-gray">
              Call us directly and we can walk through your request in minutes.
            </p>
            <Link
              href="tel:18329604471"
              className="mt-6 inline-flex w-full items-center justify-center rounded-sharp bg-enterprise-gold px-8 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
            >
              Call 832-960-4471
            </Link>
            <p className="mt-6 border-t border-enterprise-border pt-6 text-sm leading-[1.7] text-enterprise-gray">
              Prefer text/email? Submit the form and we will follow up promptly.
            </p>
            <div className="mt-8">
              <h4 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-enterprise-blue">
                What happens next
              </h4>
              <ol className="mt-5 border-t border-enterprise-border">
                {nextSteps.map((step, index) => (
                  <li
                    key={step}
                    className="grid grid-cols-[auto_1fr] gap-x-5 border-b border-enterprise-border py-4"
                  >
                    <span className="index-numeral pt-0.5">0{index + 1}</span>
                    <span className="text-sm leading-[1.7] text-enterprise-charcoal">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
