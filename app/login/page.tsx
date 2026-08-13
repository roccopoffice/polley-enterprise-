import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { LoginForm } from "@/components/tracking/LoginForm";

export const metadata: Metadata = {
  title: "Employee Login | Polley Enterprise",
  description: "Employee login for Polley Enterprise shipment tracking and dispatch.",
};

export default function LoginPage() {
  return (
    <>
      <PageHero
        eyebrow="Employees"
        title="Dispatch and shipment access"
        description="Secure access for Polley Enterprise employees and dispatch users."
      />
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise max-w-5xl">
          <LoginForm />
        </div>
      </section>
    </>
  );
}
