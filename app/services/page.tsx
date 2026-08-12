import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedSection } from "@/components/AnimatedSection";
import { Button } from "@/components/Button";
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
      <section className="page-top pb-16">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="Services"
            title="Professional services built around your schedule"
            description="Every service is handled with clear communication, dependable timing, and practical support."
            align="center"
          />
        </div>
      </section>
      <AnimatedSection className="section-spacing">
        <div className="mx-auto max-w-6xl px-4">
          <ServiceAccordion items={serviceSections} />
        </div>
      </AnimatedSection>
      <section className="pb-28">
        <div className="mx-auto max-w-6xl px-4 text-center">
          <div className="section-shell px-6 py-9">
            <p className="text-enterprise-gray">
              Need help choosing? Tell us your goal and we will guide you.
            </p>
            <div className="mt-5 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/quotes">
                <Button className="rounded-2xl px-8 py-3.5">Get a Quote</Button>
              </Link>
              <Link href="tel:18329604471">
                <Button variant="secondary" className="rounded-2xl px-8 py-3.5">
                  Call Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
