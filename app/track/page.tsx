import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
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
      <PageHero
        eyebrow="Track"
        title="Track your shipment"
        description="Enter your tracking number to see the latest status and location update."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise max-w-5xl">
          <TrackShipmentForm />
        </div>
      </section>
    </>
  );
}
