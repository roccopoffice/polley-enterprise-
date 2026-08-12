import type { Metadata } from "next";
import Link from "next/link";
import {
  Truck,
  Car,
  Waves,
  SprayCan,
  House,
  Users,
  Package,
  CheckCircle2,
} from "lucide-react";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
import { AnimatedSection } from "@/components/AnimatedSection";
import { ServiceCard } from "@/components/ServiceCard";
import { Button } from "@/components/Button";
import { FAQSection } from "@/components/FAQSection";

export const metadata: Metadata = {
  title: "Polley Enterprise | Hot Shot, Transport, Hauling & Cleaning Services",
  description:
    "Polley Enterprise provides hot shot hauling, vehicle transportation, freight support, fleet cleaning, washouts, power washing, moving support, and personnel transportation in Houston and across Texas.",
  openGraph: {
    title: "Polley Enterprise | Hot Shot, Transport, Hauling & Cleaning Services",
    description:
      "Houston service support for hauling, transport, cleaning, washouts, moving, and personnel transportation.",
  },
  keywords: ["Houston hot shot hauling", "vehicle transport Houston", "freight hauling Texas", "fleet cleaning", "trailer washout", "power washing"],
};

const services = [
  {
    title: "Hot Shot Hauling",
    description: "Fast, flexible hauling for urgent loads, equipment, and time-sensitive deliveries.",
    href: "/quotes",
    imageSrc: "/images/hot-shot.jpg",
    imageAlt: "Hot shot hauling rig with flatbed trailer",
    icon: <Truck className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Vehicle Transportation",
    description: "Open or enclosed transport for cars, trucks, and specialty vehicles.",
    href: "/quotes",
    imageSrc: "/images/car-transport.jpg",
    imageAlt: "Vehicle on a transport trailer",
    icon: <Car className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Freight & Cargo Support",
    description: "Freight hauling, equipment transport, courier routes, and general load support.",
    href: "/quotes",
    imageSrc: "/images/freight-hauling.jpg",
    imageAlt: "Semi truck carrying freight",
    icon: <Truck className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Trailer Washouts",
    description: "Clean, ready trailers with fast washout turnaround.",
    href: "/quotes",
    imageSrc: "/images/trailer-washout.jpg",
    imageAlt: "Trailer washout service in progress",
    icon: <Waves className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Big Rig Cleaning",
    description: "Exterior cleaning for semis and fleet vehicles.",
    href: "/quotes",
    imageSrc: "/images/big-rig-cleaning.jpg",
    imageAlt: "Cleaned semi truck exterior",
    icon: <SprayCan className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Residential Power Washing",
    description: "Driveways, siding, patios, and exterior surface cleaning.",
    href: "/quotes",
    imageSrc: "/images/power-washing.jpg",
    imageAlt: "Home exterior power washing",
    icon: <House className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Personnel Transportation",
    description: "Safe transportation support for teams and consultants.",
    href: "/quotes",
    imageSrc: "/images/personnel-transport.jpg",
    imageAlt: "Professional personnel transportation service",
    icon: <Users className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
  {
    title: "Moving Services",
    description: "Simple moving help for homes, apartments, and small businesses.",
    href: "/quotes",
    imageSrc: "/images/moving-services.jpg",
    imageAlt: "Moving support service with loaded truck",
    icon: <Package className="h-5 w-5" />,
    ctaLabel: "Get Quote",
  },
];

const reasons = [
  "Hot shot and freight-ready",
  "Vehicle transport support",
  "Fleet and rig cleaning",
  "Local and regional routes",
  "Clear customer updates",
  "Easy quote process",
];

const processSteps = [
  {
    label: "Pick the job",
    description: "Hauling, transport, cleaning, moving, or personnel service.",
  },
  {
    label: "Share the details",
    description: "Tell us where, when, what is moving, and what support is needed.",
  },
  {
    label: "We handle the work",
    description: "The team follows up with clear timing, pricing, and next steps.",
  },
];

const capabilityHighlights = [
  "Hot shot rig and flatbed hauling",
  "Vehicle, freight, and equipment movement",
  "Trailer washouts and 18-wheeler cleaning",
  "Residential power washing and moving support",
];

const testimonials = [
  {
    quote:
      "Called in the morning, load was picked up the same day. Straightforward pricing and no runaround.",
    name: "Marcus D.",
    service: "Hot Shot Hauling",
  },
  {
    quote:
      "They moved my son's car from Houston to Dallas without a scratch. Kept me updated the whole way.",
    name: "Denise W.",
    service: "Vehicle Transport",
  },
  {
    quote:
      "Our trailers come back clean and ready every time. Polley is part of our regular routine now.",
    name: "R. Alvarez",
    service: "Trailer Washouts",
  },
];

const bigStats = [
  { value: "8+", label: "Services Offered" },
  { value: "24/7", label: "Request Line" },
  { value: "TX", label: "Statewide Routes" },
  { value: "#1", label: "Priority: Your Job" },
];

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Stats band */}
      <div className="navy-grid-bg relative overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-10 md:grid-cols-4 md:py-12">
          {bigStats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-gold-gradient text-3xl font-extrabold tracking-tight md:text-5xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-[0.18em] text-white/70 md:text-xs">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
      <AnimatedSection className="section-spacing">
        <div className="mx-auto max-w-6xl px-4">
          <SectionHeader
            eyebrow="What We Do"
            title="One team for hauling, transport, cleaning, and support."
            description="Polley Enterprise is built for customers who need real help fast: hot shot hauling, vehicle movement, freight support, washouts, cleaning, moving, and personnel transportation."
            align="center"
          />
          <div className="section-shell mx-auto mt-10 max-w-6xl overflow-hidden p-0">
            <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="navy-grid-bg relative overflow-hidden p-7 text-white md:p-10">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-enterprise-gold/10 blur-3xl animate-pulseglow" />
                <p className="text-sm font-bold uppercase tracking-[0.16em] text-enterprise-gold">
                  Built Around Service
                </p>
                <h3 className="mt-4 text-3xl font-bold leading-tight md:text-4xl">
                  If it needs to move, get cleaned, or get handled, start here.
                </h3>
                <div className="mt-6 space-y-3">
                  {capabilityHighlights.map((item) => (
                    <p key={item} className="flex gap-3 text-sm text-white/90 md:text-base">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-enterprise-gold" />
                      <span>{item}</span>
                    </p>
                  ))}
                </div>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link href="/quotes">
                    <Button className="w-full rounded-2xl sm:w-auto">Request Service</Button>
                  </Link>
                  <Link href="/services">
                    <Button
                      variant="secondary"
                      className="w-full rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/15 sm:w-auto"
                    >
                      View Services
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-3 md:p-8 lg:grid-cols-1">
              {processSteps.map((step, index) => (
                <div
                  key={step.label}
                  className="card-glow rounded-2xl border border-enterprise-border bg-white p-5"
                >
                  <p className="text-gold-gradient text-2xl font-extrabold">0{index + 1}</p>
                  <h3 className="mt-2 text-lg font-bold text-enterprise-charcoal">{step.label}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-enterprise-gray">{step.description}</p>
                </div>
              ))}
            </div>
            </div>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-spacing">
        <div className="mx-auto max-w-7xl px-4">
          <SectionHeader
            eyebrow="Core Services"
            title="See the work before you even call"
            description="Hauling, transport, cleaning, washouts, and support — pick what you need and get a quote in minutes."
            align="center"
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.slice(0, 6).map((service) => (
              <ServiceCard key={service.title} {...service} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href="/services">
              <Button variant="secondary">See All Services</Button>
            </Link>
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-spacing">
        <div className="mx-auto max-w-5xl px-4">
          <SectionHeader
            eyebrow="Why It Works"
            title="A simple way to book serious work"
            align="center"
          />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {reasons.map((item) => (
              <div
                key={item}
                className="card-glow rounded-2xl border border-enterprise-border bg-white p-5 shadow-[0_14px_32px_rgba(6,33,63,0.08)]"
              >
                <p className="flex items-start gap-2 text-enterprise-charcoal">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-enterprise-blue" />
                  <span>{item}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>

      {/* Testimonials */}
      <AnimatedSection className="section-spacing navy-grid-bg relative overflow-hidden">
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full bg-enterprise-bright/15 blur-3xl animate-pulseglow" />
        <div className="mx-auto max-w-7xl px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-enterprise-gold/40 bg-enterprise-gold/10 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-enterprise-gold">
              <span className="h-1.5 w-1.5 rounded-full bg-enterprise-gold" />
              What Customers Say
            </p>
            <h2 className="text-2xl font-bold leading-[1.1] tracking-tight text-white sm:text-3xl md:text-[3.1rem] md:leading-[1.08]">
              Trusted for the jobs that matter
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {testimonials.map((item) => (
              <figure
                key={item.name}
                className="flex flex-col justify-between rounded-3xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm transition-colors hover:border-enterprise-gold/40 md:p-7"
              >
                <div>
                  <p className="text-gold-gradient text-2xl font-extrabold leading-none">&ldquo;</p>
                  <blockquote className="mt-2 text-base leading-relaxed text-white/90">
                    {item.quote}
                  </blockquote>
                </div>
                <figcaption className="mt-6 border-t border-white/10 pt-4">
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-enterprise-gold">
                    {item.service}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <FAQSection />

      <section className="section-spacing pb-28 pt-0">
        <div className="mx-auto max-w-7xl px-4 text-center">
          <div className="navy-grid-bg relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] px-6 py-12 shadow-[0_30px_80px_rgba(6,16,36,0.35)] md:px-10 md:py-16">
            <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-enterprise-bright/25 blur-3xl animate-pulseglow" />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-enterprise-gold/15 blur-3xl animate-pulseglow" />
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-enterprise-gold">
              Let&apos;s Get It Handled
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white md:text-5xl">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-white/80">
              Tell us what needs to be hauled, moved, cleaned, washed, or transported. We will
              follow up with clear next steps.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link href="/quotes">
                <Button variant="gold" className="rounded-2xl px-8 py-3.5">
                  Go to Quotes
                </Button>
              </Link>
              <Link href="tel:18329604471">
                <Button
                  variant="secondary"
                  className="rounded-2xl border-white/40 bg-white/10 px-8 py-3.5 text-white hover:bg-white/15"
                >
                  Call (832) 960-4471
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
