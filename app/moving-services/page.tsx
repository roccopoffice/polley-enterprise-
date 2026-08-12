import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Moving Services | Polley Enterprise",
  description:
    "Local and regional moving support for residential customers, apartments, and small businesses.",
  openGraph: {
    title: "Moving Services | Polley Enterprise",
    description:
      "Dependable moving assistance with professional care and clear communication across Houston and surrounding areas.",
  },
  keywords: ["Houston moving services", "apartment moving", "small business moving support"],
};

const items = [
  "Residential moving",
  "Apartment moving",
  "Small business moving",
  "Furniture transportation",
  "Local and regional moves",
];

export default function MovingServicesPage() {
  return (
    <section className="bg-enterprise-light pb-20 pt-32">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          eyebrow="Moving Services"
          title="Moving Services"
          description="Polley Enterprise can assist with local and regional moving needs for residential customers, apartment residents, and small businesses."
        />
        <div className="mt-8 rounded-3xl border border-enterprise-border bg-white p-8 shadow-card">
          <ul className="grid gap-3 text-enterprise-charcoal md:grid-cols-2">
            {items.map((item) => (
              <li key={item} className="rounded-xl bg-enterprise-light px-4 py-3 font-medium">
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 leading-relaxed text-enterprise-gray">
            Whether you are relocating across town, moving into an apartment, transporting furniture, or
            moving items for a small business, Polley Enterprise provides dependable moving assistance
            with professional care and communication.
          </p>
          <div className="mt-8">
            <Link href="/contact?subject=Moving%20Quote%20Request">
              <Button>Request a Moving Quote</Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
