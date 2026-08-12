import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { PowerWashingQuoteForm } from "@/components/forms/PowerWashingQuoteForm";

export const metadata: Metadata = {
  title: "Power Washing Quote | Polley Enterprise",
  description:
    "Request a residential power washing quote for homes, driveways, patios, sidewalks, and exterior surfaces in Houston.",
  openGraph: {
    title: "Power Washing Quote | Polley Enterprise",
    description: "Send your property details and service needs for a custom quote.",
  },
  keywords: ["power washing quote Houston", "driveway washing", "house washing Texas"],
};

export default function PowerWashingQuotesPage() {
  return (
    <section className="bg-enterprise-light pb-20 pt-32">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeader
          eyebrow="Power Washing Quotes"
          title="Request a Power Washing Quote"
          description="Send us your property details and service needs. Upload photos if available so we can better understand the project."
        />
        <div className="mt-10">
          <PowerWashingQuoteForm />
        </div>
      </div>
    </section>
  );
}
