import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { CareersApplicationForm } from "@/components/forms/CareersApplicationForm";

export const metadata: Metadata = {
  title: "Careers | Polley Enterprise",
  description:
    "Apply to join Polley Enterprise for transportation, washout, power washing, and operations positions.",
  openGraph: {
    title: "Careers | Polley Enterprise",
    description:
      "Join a dependable Houston-based team focused on safe transportation and professional customer service.",
  },
  keywords: ["Houston trucking jobs", "washout technician jobs", "transport specialists careers"],
};

export default function CareersPage() {
  return (
    <section className="bg-enterprise-light pb-20 pt-32">
      <div className="mx-auto max-w-4xl px-4">
        <SectionHeader
          eyebrow="Careers"
          title="Join Our Team"
          description="Polley Enterprise is looking for dependable, hardworking team members who take pride in professional service, safe transportation, and customer satisfaction."
        />
        <p className="mt-6 text-enterprise-gray">
          Applicants may apply for Drivers, Transport Specialists, Laborers, Washout Technicians,
          Power Washing Technicians, and General Operations.
        </p>
        <div className="mt-10">
          <CareersApplicationForm />
        </div>
      </div>
    </section>
  );
}
