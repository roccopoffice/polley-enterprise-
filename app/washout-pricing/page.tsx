import type { Metadata } from "next";
import Link from "next/link";
import { SectionHeader } from "@/components/SectionHeader";
import { PricingTable } from "@/components/PricingTable";
import { Button } from "@/components/Button";

export const metadata: Metadata = {
  title: "Washout Pricing | Polley Enterprise",
  description:
    "Clear trailer washout pricing for Houston and Texas clients, including outside cleaning and add-on services.",
  openGraph: {
    title: "Washout Pricing | Polley Enterprise",
    description: "View trailer washout pricing and schedule service.",
  },
  keywords: ["trailer washout pricing", "Houston washout", "semi truck washout services"],
};

const rows = [
  { service: "Washout", price: "$45.00" },
  { service: "Outside Only", price: "$35.00" },
  { service: "Trailer Deodorizer", price: "$3.50" },
  { service: "Hand Dry", price: "$7.70" },
  { service: "Hand Dry and Tire Dressing", price: "$18.70" },
  { service: "Blue Coral Paint Protectant", price: "$19.90" },
  { service: "Full Package", price: "$32.50" },
];

export default function WashoutPricingPage() {
  return (
    <section className="bg-enterprise-light pb-20 pt-32">
      <div className="mx-auto max-w-5xl px-4">
        <SectionHeader
          eyebrow="Washout Pricing"
          title="Trailer Washout Pricing"
          description="Polley Enterprise offers professional trailer washout and cleaning services with clear, upfront pricing."
          align="center"
        />
        <div className="mt-10">
          <PricingTable rows={rows} />
        </div>
        <div className="mt-8 text-center">
          <Link href="/contact">
            <Button>Schedule Service</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
