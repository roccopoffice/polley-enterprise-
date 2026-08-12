import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { EmployeeDashboard } from "@/components/tracking/EmployeeDashboard";

export const metadata: Metadata = {
  title: "Employee Dashboard | Polley Enterprise",
  description: "Employee dispatch dashboard for Polley Enterprise shipment tracking.",
};

export default function DashboardPage() {
  return (
    <>
      <section className="page-top pb-12">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Dashboard"
            title="Shipment dispatch center"
            description="Start shifts, update shipment status, and keep customer tracking accurate."
            align="center"
          />
        </div>
      </section>
      <section className="pb-28">
        <div className="mx-auto max-w-7xl px-4">
          <EmployeeDashboard />
        </div>
      </section>
    </>
  );
}
