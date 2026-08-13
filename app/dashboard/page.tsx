import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { EmployeeDashboard } from "@/components/tracking/EmployeeDashboard";

export const metadata: Metadata = {
  title: "Employee Dashboard | Polley Enterprise",
  description: "Employee dispatch dashboard for Polley Enterprise shipment tracking.",
};

export default function DashboardPage() {
  return (
    <>
      <PageHero
        eyebrow="Dashboard"
        title="Shipment dispatch center"
        description="Start shifts, update shipment status, and keep customer tracking accurate."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise">
          <EmployeeDashboard />
        </div>
      </section>
    </>
  );
}
