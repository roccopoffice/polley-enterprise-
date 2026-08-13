import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { ServiceAccordion } from "@/components/ServiceAccordion";

export const metadata: Metadata = {
  title: "Services | Polley Enterprise",
  description:
    "Explore Polley Enterprise services with clear details for transportation, hauling, cleaning, power washing, and moving support.",
  openGraph: {
    title: "Services | Polley Enterprise",
    description: "Service details in an easy dropdown format.",
  },
  keywords: ["Houston services", "hauling", "vehicle transport", "moving help"],
};

const serviceSections = [
  {
    title: "Vehicle Transportation",
    summary: "Open and enclosed transport for personal and business vehicles.",
    bullets: [
      "Cars, trucks, SUVs, and specialty vehicles",
      "Open or enclosed trailer options",
      "Pickup and delivery coordination",
      "Clear updates on timing",
    ],
  },
  {
    title: "Trucking & Hauling",
    summary: "Reliable freight and general hauling support.",
    bullets: [
      "General freight and cargo hauling",
      "Equipment transportation",
      "Commercial and personal loads",
      "Flexible scheduling options",
    ],
  },
  {
    title: "Trailer Washouts",
    summary: "Fast washout service to keep trailers load-ready.",
    bullets: [
      "Inside washout service",
      "Outside rinse options",
      "Deodorizer and add-ons available",
      "Great for quick turnaround",
    ],
  },
  {
    title: "Big Rig Cleaning",
    summary: "Exterior cleaning for semis and fleet vehicles.",
    bullets: [
      "Semi truck exterior cleaning",
      "Fleet wash support",
      "Detail-focused service",
      "Professional road-ready appearance",
    ],
  },
  {
    title: "Power Washing",
    summary: "Residential power washing for common outdoor surfaces.",
    bullets: [
      "House washing",
      "Driveways and sidewalks",
      "Patios and garages",
      "Exterior surfaces",
    ],
  },
  {
    title: "Personnel Transportation",
    summary: "Safe transportation support for consultants and crews.",
    bullets: [
      "Work-site transportation",
      "Helipad and port routes",
      "Industrial destination support",
      "Reliable pickup timing",
    ],
  },
  {
    title: "Moving Services",
    summary: "Moving help for homes, apartments, and small businesses.",
    bullets: [
      "Residential and apartment moves",
      "Small business moving help",
      "Furniture transport support",
      "Local and regional options",
    ],
  },
];

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="Services"
        title="Built around your schedule"
        description="Every service is handled with clear communication, dependable timing, and practical support."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise max-w-5xl">
          <ServiceAccordion items={serviceSections} />
          <div className="mt-14 flex flex-col gap-4 border-t border-enterprise-border pt-8 text-sm leading-relaxed text-enterprise-gray md:flex-row md:items-center md:justify-between">
            <p>Need help choosing? Tell us your goal and we will guide you.</p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quotes"
                className="inline-flex items-center justify-center rounded-sharp bg-enterprise-gold px-8 py-3.5 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
              >
                Request A Quote
              </Link>
              <Link
                href="tel:18329604471"
                className="inline-flex items-center justify-center rounded-sharp border border-enterprise-charcoal/25 px-8 py-3.5 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-charcoal transition-colors hover:border-enterprise-charcoal hover:bg-enterprise-charcoal hover:text-white"
              >
                Call 832-960-4471
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
