import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { ContactInfo } from "@/components/ContactInfo";
import { ContactForm } from "@/components/forms/ContactForm";
import { GoogleMap } from "@/components/GoogleMap";

export const metadata: Metadata = {
  title: "Contact | Polley Enterprise",
  description:
    "Contact Polley Enterprise for transportation, hauling, washout, power washing, moving, and personnel transportation services in Houston and across Texas.",
  openGraph: {
    title: "Contact | Polley Enterprise",
    description:
      "Reach out to Polley Enterprise for service questions, scheduling, and quote requests.",
  },
  keywords: ["contact Polley Enterprise", "Houston hauling contact", "transport services Texas"],
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Contact Polley Enterprise"
        description="Reach out for transportation, hauling, washout, power washing, moving, and personnel transportation services in Houston and across Texas."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise">
          <div className="grid gap-8 lg:grid-cols-2">
            <ContactInfo />
            <ContactForm />
          </div>
          <div className="mt-10">
            <GoogleMap />
          </div>
        </div>
      </section>
    </>
  );
}
