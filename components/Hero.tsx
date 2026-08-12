import Image from "next/image";
import Link from "next/link";
import { Car, MapPin, SprayCan, Truck } from "lucide-react";
import { Button } from "@/components/Button";
import { cn } from "@/lib/utils";

const heroStats = [
  { label: "Hot Shot", value: "Ready Hauling", icon: Truck },
  { label: "Vehicles", value: "Transport", icon: Car },
  { label: "Cleaning", value: "Fleet + Rig", icon: SprayCan },
  { label: "Houston", value: "Local + Regional", icon: MapPin },
];

const tickerItems = [
  "Hot Shot Hauling",
  "Vehicle Transport",
  "Freight & Cargo",
  "Trailer Washouts",
  "Big Rig Cleaning",
  "Power Washing",
  "Moving Support",
  "Personnel Transport",
];

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-enterprise-navy text-white lg:min-h-screen">
      {/* Cinematic layer: live video on desktop, animated image on mobile (saves data) */}
      <div className="relative h-[50vh] min-h-[320px] max-h-[460px] overflow-hidden lg:absolute lg:inset-0 lg:h-auto lg:max-h-none">
        <Image
          src="/images/home-hero-polley.png"
          alt="Polley Enterprise hot shot hauling, transportation, and fleet services"
          fill
          priority
          sizes="100vw"
          className="animate-kenburns object-cover object-[30%_center] sm:object-[34%_center] lg:hidden"
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
        <div className="light-sweep" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#061024]/10 via-[#061024]/8 to-[#061024]/90 lg:hidden" />
        <div className="absolute inset-0 hidden bg-[#061024]/18 lg:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-l from-[#061024]/98 via-[#061024]/54 to-[#061024]/0 lg:block" />
        <div className="absolute inset-0 hidden bg-gradient-to-t from-[#061024]/70 via-transparent to-[#061024]/16 lg:block" />
      </div>

      {/* Floating glow orbs (desktop) */}
      <div className="pointer-events-none absolute -right-20 top-24 hidden h-72 w-72 rounded-full bg-enterprise-bright/20 blur-[100px] lg:block animate-pulseglow" />
      <div className="pointer-events-none absolute right-1/3 bottom-32 hidden h-56 w-56 rounded-full bg-enterprise-gold/10 blur-[90px] lg:block animate-pulseglow" />

      {/* Content — below the image on mobile, overlaid on desktop */}
      <div className="relative -mt-8 rounded-t-[2rem] bg-[#061024] px-4 pb-24 pt-8 shadow-[0_-20px_50px_rgba(0,0,0,0.35)] sm:-mt-10 sm:px-5 sm:pt-10 lg:mx-auto lg:mt-0 lg:flex lg:min-h-screen lg:max-w-7xl lg:flex-col lg:justify-center lg:rounded-none lg:bg-transparent lg:px-4 lg:pb-32 lg:pt-36 lg:shadow-none xl:pt-40">
        <div className="max-w-2xl lg:ml-auto lg:max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-enterprise-gold/40 bg-enterprise-gold/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-enterprise-gold backdrop-blur-md sm:px-4 sm:text-xs">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-enterprise-gold opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-enterprise-gold" />
            </span>
            Houston logistics & service support
          </p>
          <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.05] tracking-tight sm:mt-5 sm:text-5xl md:text-7xl">
            <span className="text-gold-gradient">Hot shot hauling.</span>
            <br />
            Vehicle transport.
            <br />
            Fleet-ready service.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90 sm:mt-6 md:text-xl">
            From urgent hauling and car transport to rig cleaning, washouts, power washing, and
            moving support, Polley Enterprise gets the job handled.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row">
            <Link href="/quotes">
              <Button variant="gold" className="w-full rounded-xl px-7 sm:w-auto">
                Get a Quote
              </Button>
            </Link>
            <Link href="tel:18329604471">
              <Button
                variant="secondary"
                className="w-full rounded-xl border-white/50 bg-white/10 text-white backdrop-blur-md hover:bg-white/15 sm:w-auto"
              >
                Call Now
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:mt-8 sm:gap-3 lg:absolute lg:bottom-28 lg:right-10 lg:mt-0 lg:grid-cols-2 lg:w-[38rem]">
          {heroStats.map(({ label, value, icon: Icon }, index) => (
            <div
              key={label}
              className={cn(
                "flex items-center gap-2.5 rounded-xl border border-white/15 bg-white/10 p-3 text-white backdrop-blur-md transition-colors hover:border-enterprise-gold/50 sm:gap-3 sm:rounded-2xl sm:p-4 lg:bg-white/14 lg:shadow-[0_18px_45px_rgba(0,0,0,0.18)] lg:backdrop-blur-xl",
                index > 1 ? "hidden sm:flex" : undefined
              )}
            >
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/20 bg-white/10 text-enterprise-gold sm:h-11 sm:w-11 sm:rounded-xl">
                <Icon className="h-3.5 w-3.5 sm:h-5 sm:w-5" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-[8px] font-semibold uppercase tracking-[0.1em] text-white/70 sm:text-[10px] sm:tracking-[0.16em]">
                  {label}
                </p>
                <p className="truncate text-[11px] font-semibold text-white sm:text-sm md:text-base">
                  {value}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Scrolling service ticker */}
      <div className="relative border-t border-white/10 bg-[#050d1d]/90 py-3.5 backdrop-blur-sm lg:absolute lg:inset-x-0 lg:bottom-0">
        <div className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_8%,black_92%,transparent)]">
          <div className="animate-marquee flex shrink-0 items-center gap-8 pr-8">
            {[...tickerItems, ...tickerItems].map((item, index) => (
              <span
                key={`${item}-${index}`}
                className="flex items-center gap-8 whitespace-nowrap text-xs font-bold uppercase tracking-[0.2em] text-white/75"
              >
                {item}
                <span className="text-enterprise-gold">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
