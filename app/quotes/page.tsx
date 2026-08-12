import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { SectionHeader } from "@/components/SectionHeader";
import { UnifiedQuoteForm } from "@/components/forms/UnifiedQuoteForm";
import { Button } from "@/components/Button";

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
  // Static HTML form so Netlify detects this form at deploy time.
  const nextSteps = [
    "We review your service request.",
    "We call or email to confirm details.",
    "You get clear next steps before scheduling.",
  ];

  return (
    <>
      <form
        name="unified-quote-form"
        method="POST"
        data-netlify="true"
        data-netlify-honeypot="companyWebsite"
        hidden
      >
        <input type="hidden" name="form-name" value="unified-quote-form" />
        <input type="text" name="fullName" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="inquiryType" />
        <input type="text" name="location" />
        <input type="text" name="preferredDate" />
        <textarea name="details" />
        <input type="text" name="companyWebsite" />
        <input type="text" name="submittedAt" />
      </form>

      <section className="page-top pb-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="Quotes"
            title="Request your quote in one step"
            description="Share what you need and our team will follow up quickly with next steps."
            align="center"
          />
        </div>
      </section>
      <section className="pb-28">
        <div className="mx-auto grid max-w-6xl gap-6 px-4 lg:grid-cols-[1.15fr_0.85fr]">
          <UnifiedQuoteForm />
          <aside className="section-shell h-fit p-6 md:p-8">
            <h3 className="text-2xl font-bold text-enterprise-charcoal">Need quick help?</h3>
            <p className="mt-3 text-enterprise-gray">
              Call us directly and we can walk through your request in minutes.
            </p>
            <div className="mt-5">
              <Link href="tel:18329604471">
                <Button className="w-full rounded-2xl px-8 py-3.5">Call (832) 960-4471</Button>
              </Link>
            </div>
            <div className="mt-6 rounded-2xl border border-enterprise-border bg-enterprise-light/60 p-4">
              <p className="text-sm text-enterprise-charcoal">
                Prefer text/email? Submit the form and we will follow up promptly.
              </p>
            </div>
            <div className="mt-6 border-t border-enterprise-border pt-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.14em] text-enterprise-blue">
                What happens next
              </h4>
              <div className="mt-4 space-y-3">
                {nextSteps.map((step) => (
                  <p key={step} className="flex gap-2 text-sm text-enterprise-charcoal">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-enterprise-blue" />
                    <span>{step}</span>
                  </p>
                ))}
              </div>
            </div>
          </aside>
          </div>
      </section>
    </>
  );
}
