import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section id="top" className="relative min-h-[100svh] overflow-hidden bg-enterprise-navy">
      <div className="absolute inset-0">
        <Image
          src="/images/home-hero-polley.png"
          alt="Polley Enterprise hot shot hauling, transportation, and fleet services"
          fill
          priority
          sizes="100vw"
          className="object-cover object-[62%_center] lg:hidden"
        />
        <video
          className="hidden h-full w-full object-cover lg:block"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster="/images/home-hero-polley.png"
        >
          <source src="/videos/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-enterprise-navy via-enterprise-navy/70 to-enterprise-navy/25 lg:hidden" />
        <div className="absolute inset-0 hidden bg-gradient-to-r from-enterprise-navy via-enterprise-navy/70 to-transparent lg:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-t from-enterprise-navy/70 via-transparent to-enterprise-navy/25 lg:block" />
      </div>

      <div className="relative flex min-h-[100svh] flex-col justify-end pt-32 lg:justify-center lg:pt-28">
        <div className="container-enterprise w-full pb-24 lg:pb-32">
          <div className="animate-hero-in max-w-2xl">
            <p className="font-display text-[clamp(1.75rem,4vw,2.75rem)] font-extrabold uppercase leading-none tracking-[0.01em] text-white">
              Polley Enterprise
            </p>
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-enterprise-gold">
              Transportation &amp; Logistics
            </p>
            <h1 className="heading-hero mt-8 text-white">
              Hot Shot Hauling
              <span className="block text-enterprise-gold">From Houston To Anywhere</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-[1.75] text-white/75 sm:text-lg">
              Urgent hauling, vehicle transport, freight, trailer washouts, rig cleaning, power
              washing, and moving support — handled by one Houston team you can actually reach.
            </p>
            <ul className="mt-7 grid gap-3 border-y border-white/15 py-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 sm:grid-cols-3">
              <li>Fast scheduling</li>
              <li>One team, many services</li>
              <li>Direct dispatch line</li>
            </ul>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/quotes"
                className="inline-flex w-full items-center justify-center rounded-sharp bg-enterprise-gold px-9 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-[#ffe39a] sm:w-auto"
              >
                Request A Quote
              </Link>
              <Link
                href="/services"
                className="inline-flex w-full items-center justify-center rounded-sharp border border-white/45 px-9 py-4 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:border-white hover:bg-white/10 sm:w-auto md:hidden"
              >
                View Services
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
        <div className="relative hidden border-t border-white/10 lg:block">
          <div className="container-enterprise flex items-center justify-between py-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Houston and Texas hauling, transport, washout, and cleaning corridors
            </p>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/55">
              Hauling · Transport · Cleaning
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
