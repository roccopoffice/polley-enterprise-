import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
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
    <>
      <PageHero
        eyebrow="Careers"
        title="Join Our Team"
        description="Polley Enterprise is looking for dependable, hardworking team members who take pride in professional service, safe transportation, and customer satisfaction."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise max-w-4xl">
          <p className="prose-muted">
            Applicants may apply for Drivers, Transport Specialists, Laborers, Washout Technicians,
            Power Washing Technicians, and General Operations.
          </p>
          <div className="mt-10">
            <CareersApplicationForm />
          </div>
        </div>
      </section>
    </>
  );
}
