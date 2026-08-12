import type { Metadata } from "next";
import { SectionHeader } from "@/components/SectionHeader";
import { LoginForm } from "@/components/tracking/LoginForm";

export const metadata: Metadata = {
  title: "Employee Login | Polley Enterprise",
  description: "Employee login for Polley Enterprise shipment tracking and dispatch.",
};

export default function LoginPage() {
  return (
    <>
      <section className="page-top pb-12">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="Employees"
            title="Dispatch and shipment access"
            description="Secure access for Polley Enterprise employees and dispatch users."
            align="center"
          />
        </div>
      </section>
      <section className="pb-28">
        <div className="mx-auto max-w-6xl px-4">
          <LoginForm />
        </div>
      </section>
    </>
  );
}
