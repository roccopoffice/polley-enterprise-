import Image from "next/image";
import Link from "next/link";

const navigateLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Request A Quote", href: "/quotes" },
  { label: "Track Shipment", href: "/track" },
  { label: "Careers", href: "/careers" },
  { label: "Contact", href: "/#contact" },
];

export function Footer() {
  return (
    <footer id="contact" className="bg-enterprise-navy-deep text-white">
      <div className="container-enterprise grid gap-12 py-20 md:grid-cols-[1.2fr_0.9fr_1fr] md:gap-16">
        <div>
          <Link href="/" className="inline-flex">
            <span className="inline-flex items-center gap-3">
              <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-sharp border border-white/20 sm:h-16 sm:w-16">
                <Image
                  src="/images/logo-square.png"
                  alt="Polley Enterprise logo"
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="font-display block text-xl font-extrabold uppercase tracking-tight text-white sm:text-2xl">
                  Polley Enterprise
                </span>
                <span className="mt-0.5 block text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-xs">
                  Transportation &amp; Logistics
                </span>
              </span>
            </span>
          </Link>
          <p className="mt-7 max-w-sm text-[0.9375rem] leading-[1.75] text-white/65">
            Hot shot hauling, vehicle transport, freight, washouts, cleaning, and moving support —
            handled by one Houston team you can actually reach.
          </p>
          <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.2em] text-white/45">
            Houston, Texas and surrounding transport corridors
          </p>
          <p className="mt-4 text-sm">
            <Link
              href="https://www.instagram.com/polley_enterprise/"
              target="_blank"
              rel="noreferrer"
              className="border-b border-white/25 pb-1 text-white/75 transition-colors hover:border-enterprise-gold hover:text-enterprise-gold"
            >
              @polley_enterprise
            </Link>
          </p>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Navigate
          </h3>
          <ul className="mt-6 border-t border-white/10">
            {navigateLinks.map((link) => (
              <li key={link.href} className="border-b border-white/10">
                <Link
                  href={link.href}
                  className="block py-3 text-sm text-white/75 transition-colors hover:text-enterprise-gold"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
            Direct Line
          </h3>
          <Link
            href="tel:18329604471"
            className="font-display mt-6 block text-3xl font-bold uppercase tracking-[0.01em] text-white transition-colors hover:text-enterprise-gold"
          >
            832-960-4471
          </Link>
          <p className="mt-4 max-w-xs text-[0.9375rem] leading-[1.7] text-white/65">
            Speak with our team for scheduling, quotes, and urgent moves across Houston and Texas.
          </p>
          <Link
            href="mailto:petrucking96@gmail.com"
            className="mt-6 inline-block border-b border-white/25 pb-1 text-sm text-white/75 transition-colors hover:border-enterprise-gold hover:text-enterprise-gold"
          >
            petrucking96@gmail.com
          </Link>
          <div className="mt-8 border-t border-white/10 pt-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-enterprise-gold">
              Employee Access
            </p>
            <p className="mt-3 text-sm leading-[1.7] text-white/65">
              Log in to manage shipments, start shifts, and update tracking.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-sharp bg-enterprise-gold px-4 py-3 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-white"
            >
              Employee Login
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-enterprise flex flex-col gap-3 py-6 text-[11px] uppercase tracking-[0.16em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Polley Enterprise</p>
          <p>Houston, Texas · Transportation &amp; Service Support</p>
        </div>
      </div>
    </footer>
  );
}
