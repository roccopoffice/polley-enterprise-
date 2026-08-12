import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
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
      <form name="contact-form" method="POST" data-netlify="true" data-netlify-honeypot="companyWebsite" hidden>
        <input type="hidden" name="form-name" value="contact-form" />
        <input type="text" name="name" />
        <input type="email" name="email" />
        <input type="tel" name="phone" />
        <input type="text" name="subject" />
        <textarea name="message" />
        <input type="text" name="companyWebsite" />
        <input type="text" name="submittedAt" />
      </form>

      <section className="bg-enterprise-light pb-20 page-top">
      <div className="mx-auto max-w-7xl px-4">
        <SectionHeader
          eyebrow="Contact"
          title="Contact Polley Enterprise"
          description="Contact Polley Enterprise for transportation, hauling, washout, power washing, moving, and personnel transportation services in Houston and across Texas."
        />
        <div className="mt-10 grid gap-8 lg:grid-cols-2">
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
