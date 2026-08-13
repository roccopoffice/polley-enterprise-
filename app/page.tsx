import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Hero } from "@/components/Hero";
import { SectionHeader } from "@/components/SectionHeader";
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
  keywords: [
    "Houston hot shot hauling",
    "vehicle transport Houston",
    "freight hauling Texas",
    "fleet cleaning",
    "trailer washout",
    "power washing",
  ],
};

const stripItems = [
  "Hot Shot Hauling",
  "Vehicle Transport",
  "Freight & Cargo",
  "Washouts & Cleaning",
  "Moving Support",
];

const services = [
  {
    title: "Hot Shot Hauling",
    description:
      "Fast, flexible hauling for urgent loads, equipment, and time-sensitive deliveries.",
    imageSrc: "/images/hot-shot.jpg",
    imageAlt: "Hot shot hauling rig with flatbed trailer",
  },
  {
    title: "Vehicle Transportation",
    description: "Open or enclosed transport for cars, trucks, and specialty vehicles.",
    imageSrc: "/images/car-transport.jpg",
    imageAlt: "Vehicle on a transport trailer",
  },
  {
    title: "Freight & Cargo Support",
    description: "Freight hauling, equipment transport, courier routes, and general load support.",
    imageSrc: "/images/freight-hauling.jpg",
    imageAlt: "Semi truck carrying freight",
  },
  {
    title: "Trailer Washouts",
    description: "Clean, ready trailers with fast washout turnaround.",
    imageSrc: "/images/trailer-washout.jpg",
    imageAlt: "Trailer washout service in progress",
  },
  {
    title: "Big Rig Cleaning",
    description: "Exterior cleaning for semis and fleet vehicles.",
    imageSrc: "/images/big-rig-cleaning.jpg",
    imageAlt: "Cleaned semi truck exterior",
  },
  {
    title: "Residential Power Washing",
    description: "Driveways, siding, patios, and exterior surface cleaning.",
    imageSrc: "/images/power-washing.jpg",
    imageAlt: "Home exterior power washing",
  },
];

const capabilities = [
  {
    title: "Hot shot rig and flatbed hauling",
    description: "Urgent loads picked up and delivered on your timeline, not next week's.",
  },
  {
    title: "Vehicle, freight, and equipment movement",
    description: "Cars, cargo, and machinery moved locally or across Texas.",
  },
  {
    title: "Trailer washouts and 18-wheeler cleaning",
    description: "Trailers and rigs cleaned fast so your fleet keeps rolling.",
  },
  {
    title: "Power washing and moving support",
    description: "Residential exterior cleaning plus loading, hauling, and moving help.",
  },
  {
    title: "Personnel transportation",
    description: "Safe, professional transport for teams, crews, and consultants.",
  },
];

const reasons = [
  {
    title: "One team, many services",
    description:
      "Hauling, transport, washouts, cleaning, and moving handled by the same crew — no juggling vendors.",
  },
  {
    title: "Fast, honest scheduling",
    description:
      "Call or send a request and get real timing and pricing, not a form receipt that goes nowhere.",
  },
  {
    title: "Houston-based, Texas-wide",
    description:
      "Local knowledge of Houston routes with reach across the state for longer moves.",
  },
  {
    title: "Direct dispatch line",
    description: "Call 832-960-4471 for scheduling, updates, and urgent same-day requests.",
  },
];

const processSteps = [
  {
    title: "Pick the job",
    description: "Hauling, transport, cleaning, washouts, moving, or personnel service.",
  },
  {
    title: "Share the details",
    description: "Tell us where, when, what is moving, and what support is needed.",
  },
  {
    title: "We handle the work",
    description: "The team follows up with clear timing, pricing, and next steps.",
  },
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

export default function HomePage() {
  return (
    <>
      <Hero />

      {/* Services strip */}
      <div className="border-b border-enterprise-border bg-white">
        <div className="container-enterprise grid grid-cols-2 gap-y-4 py-7 sm:grid-cols-3 lg:grid-cols-5 lg:gap-y-0 lg:divide-x lg:divide-enterprise-border lg:py-0">
          {stripItems.map((item) => (
            <p
              key={item}
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-enterprise-charcoal/70 lg:px-6 lg:py-7 lg:text-center"
            >
              {item}
            </p>
          ))}
        </div>
      </div>

      {/* Core services */}
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise">
          <SectionHeader
            eyebrow="Core Services"
            title="Work we handle every week"
            description="From urgent hauling and car transport to washouts, rig cleaning, and power washing — pick what you need and get a quote in minutes."
          />
          <div className="mt-16 grid gap-x-10 gap-y-14 md:grid-cols-3">
            {services.map((service, index) => (
              <article key={service.title} className="group">
                <Link href="/quotes" className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-enterprise-bright focus-visible:ring-offset-4">
                  <div className="relative aspect-[4/3] overflow-hidden bg-enterprise-navy">
                    <Image
                      src={service.imageSrc}
                      alt={service.imageAlt}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="mt-6 flex items-baseline gap-4 border-t border-enterprise-border pt-5">
                    <span className="index-numeral">0{index + 1}</span>
                    <h3 className="font-display text-[1.375rem] font-bold uppercase leading-tight tracking-[0.01em] text-enterprise-charcoal transition-colors group-hover:text-enterprise-blue">
                      {service.title}
                    </h3>
                  </div>
                  <p className="mt-4 text-[0.9375rem] leading-[1.7] text-enterprise-gray">
                    {service.description}
                  </p>
                </Link>
              </article>
            ))}
          </div>
          <div className="mt-16 border-t border-enterprise-border pt-10">
            <Link
              href="/services"
              className="inline-flex items-center justify-center rounded-sharp border border-enterprise-charcoal/25 px-9 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-charcoal transition-colors hover:border-enterprise-charcoal hover:bg-enterprise-charcoal hover:text-white"
            >
              See All Services
            </Link>
          </div>
        </div>
      </section>

      {/* Capabilities — dark */}
      <section className="section-pad relative overflow-hidden bg-enterprise-navy-deep text-white">
        <div className="absolute inset-0">
          <Image
            src="/images/freight-hauling.jpg"
            alt="Polley Enterprise freight hauling"
            fill
            sizes="100vw"
            className="object-cover opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-enterprise-navy-deep via-enterprise-navy-deep/90 to-enterprise-navy-deep/45" />
        </div>
        <div className="container-enterprise relative grid gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
          <div>
            <p className="eyebrow eyebrow-light mb-6">Built Around Service</p>
            <h2 className="heading-display text-white">
              If it needs to move, get cleaned, or get handled — start here
            </h2>
            <p className="mt-6 text-base leading-[1.75] text-white/70 sm:text-lg">
              Polley Enterprise is built for customers who need real help fast, with one crew
              covering the whole job from pickup to cleanup.
            </p>
            <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Link
                href="/quotes"
                className="inline-flex items-center justify-center rounded-sharp bg-enterprise-gold px-6 py-3.5 text-[11px] font-bold uppercase tracking-[0.16em] text-enterprise-navy transition-colors hover:bg-white"
              >
                Request Service
              </Link>
              <Link
                href="/services"
                className="inline-block border-b border-white/30 pb-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 transition-colors hover:border-enterprise-gold hover:text-enterprise-gold"
              >
                View All Services
              </Link>
            </div>
          </div>
          <div>
            {capabilities.map((item, index) => (
              <div
                key={item.title}
                className="grid grid-cols-[auto_1fr] gap-x-6 border-t border-white/10 py-7 last:border-b sm:gap-x-10"
              >
                <span className="index-numeral index-numeral-light pt-1">0{index + 1}</span>
                <div>
                  <h3 className="font-display text-lg font-bold uppercase tracking-[0.02em] text-white sm:text-xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[0.9375rem] leading-[1.7] text-white/65">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Polley */}
      <section className="section-pad bg-enterprise-canvas">
        <div className="container-enterprise">
          <SectionHeader
            eyebrow="Why Polley Enterprise"
            title="A simple way to book serious work"
            description="Customers stay because the job gets done, the phone gets answered, and the price is what we said it would be."
          />
          <div className="mt-16 grid border-t border-enterprise-border sm:grid-cols-2">
            {reasons.map((item, index) => (
              <div
                key={item.title}
                className="border-b border-enterprise-border py-9 sm:pr-10 sm:even:border-l sm:even:pl-10 sm:even:pr-0"
              >
                <span className="index-numeral">0{index + 1}</span>
                <h3 className="font-display mt-4 text-xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
                  {item.title}
                </h3>
                <p className="mt-3 max-w-md text-[0.9375rem] leading-[1.7] text-enterprise-gray">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Request process */}
      <section className="section-pad bg-white">
        <div className="container-enterprise">
          <SectionHeader
            eyebrow="Request Process"
            title="What happens after you reach out"
            description="No confusing forms, no waiting games. Tell us the job and we take it from there."
          />
          <div className="mt-14 grid border-t border-enterprise-border lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <article
                key={step.title}
                className="border-b border-enterprise-border py-9 lg:border-r lg:px-8 lg:first:pl-0 lg:last:border-r-0 lg:last:pr-0"
              >
                <p className="index-numeral">0{index + 1}</p>
                <h3 className="font-display mt-5 text-xl font-bold uppercase tracking-[0.01em] text-enterprise-charcoal">
                  {step.title}
                </h3>
                <p className="mt-4 text-sm leading-[1.75] text-enterprise-gray">
                  {step.description}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-10 flex flex-col gap-4 border-t border-enterprise-border pt-8 text-sm leading-relaxed text-enterprise-gray md:flex-row md:items-center md:justify-between">
            <p>
              For urgent, same-day moves, call{" "}
              <Link href="tel:18329604471" className="font-semibold text-enterprise-blue">
                832-960-4471
              </Link>
              .
            </p>
            <Link
              href="/quotes"
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-enterprise-navy underline decoration-enterprise-gold underline-offset-4"
            >
              Request A Quote <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-pad bg-enterprise-light">
        <div className="container-enterprise">
          <SectionHeader
            eyebrow="What Customers Say"
            title="Trusted for the jobs that matter"
          />
          <div className="mt-14 grid border-t border-enterprise-charcoal/15 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <figure
                key={item.name}
                className="flex flex-col justify-between border-b border-enterprise-charcoal/15 py-9 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0 md:last:pr-0"
              >
                <div>
                  <span className="index-numeral">0{index + 1}</span>
                  <blockquote className="mt-5 text-base leading-[1.75] text-enterprise-charcoal">
                    &ldquo;{item.quote}&rdquo;
                  </blockquote>
                </div>
                <figcaption className="mt-7">
                  <p className="font-display text-lg font-bold uppercase tracking-[0.02em] text-enterprise-charcoal">
                    {item.name}
                  </p>
                  <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-enterprise-blue">
                    {item.service}
                  </p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <FAQSection />

      {/* CTA banner */}
      <section className="section-pad bg-enterprise-navy text-white">
        <div className="container-enterprise">
          <div className="grid gap-12 border-t border-white/15 pt-14 xl:grid-cols-[1.1fr_0.9fr] xl:items-end xl:gap-20">
            <div>
              <p className="eyebrow eyebrow-light mb-6">Next Step</p>
              <h2 className="heading-display text-white">Ready to get it handled?</h2>
            </div>
            <div>
              <p className="text-base leading-[1.75] text-white/70">
                Tell us what needs to be hauled, moved, cleaned, washed, or transported. We will
                follow up with clear timing, pricing, and next steps.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/quotes"
                  className="inline-flex items-center justify-center rounded-sharp bg-enterprise-gold px-9 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
                >
                  Request A Quote
                </Link>
                <Link
                  href="tel:18329604471"
                  className="hidden items-center justify-center rounded-sharp border border-white/45 px-9 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10 md:inline-flex"
                >
                  Call 832-960-4471
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
