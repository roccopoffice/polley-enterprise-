import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { TrackShipmentForm } from "@/components/tracking/TrackShipmentForm";

export const metadata: Metadata = {
  title: "Track Shipment | Polley Enterprise",
  description: "Track a Polley Enterprise shipment with your tracking number.",
  openGraph: {
    title: "Track Shipment | Polley Enterprise",
    description: "Customer shipment tracking for Polley Enterprise.",
  },
  keywords: ["Polley Enterprise tracking", "shipment tracking", "fleet tracker"],
};

export default function TrackPage() {
  return (
    <>
      <section className="page-top pb-14">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="Track"
            title="Track your shipment"
            description="Enter your tracking number to see the latest status and location update."
            align="center"
          />
        </div>
      </section>
      <section className="pb-28">
        <div className="mx-auto max-w-6xl px-4">
          <TrackShipmentForm />
        </div>
      </section>
    </>
  );
}
