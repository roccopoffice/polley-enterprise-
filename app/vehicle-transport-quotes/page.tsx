import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { VehicleTransportQuoteForm } from "@/components/forms/VehicleTransportQuoteForm";

export const metadata: Metadata = {
  title: "Vehicle Transport Quote | Polley Enterprise",
  description:
    "Request a vehicle transportation quote in Houston and across Texas. Open and enclosed options available.",
  openGraph: {
    title: "Vehicle Transport Quote | Polley Enterprise",
    description:
      "Tell us your pickup, delivery, and vehicle details to receive a transportation quote.",
  },
  keywords: ["vehicle transport quote Houston", "car hauler Texas", "open trailer", "enclosed trailer"],
};

export default function VehicleTransportQuotesPage() {
  return (
    <section className="bg-enterprise-light pb-20 pt-32">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeader
          eyebrow="Vehicle Transport Quotes"
          title="Request a Vehicle Transport Quote"
          description="Tell us about your vehicle, pickup location, delivery location, and trailer preference. Polley Enterprise will review your request and follow up with quote details."
        />
        <div className="mt-10">
          <VehicleTransportQuoteForm />
        </div>
      </div>
    </section>
  );
}
