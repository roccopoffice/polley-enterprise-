import Image from "next/image";
import Link from "next/link";

export function Footer() {
  return (
    <footer id="contact" className="relative overflow-hidden bg-[#071327] text-white">
      <div className="pointer-events-none absolute -left-24 top-8 h-56 w-56 rounded-full bg-enterprise-bright/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-24 bottom-8 h-56 w-56 rounded-full bg-enterprise-blue/12 blur-3xl" />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative h-14 w-14 overflow-hidden rounded-lg border border-white/25 bg-white">
              <Image
                src="/images/logo-square.png"
                alt="Polley Enterprise logo"
                fill
                sizes="56px"
                className="object-cover"
              />
            </div>
            <h3 className="text-xl font-bold">Polley Enterprise</h3>
          </div>
          <p className="mt-2 text-sm text-white/80">Houston, Texas</p>
          <p className="mt-4 text-sm text-white/90">
            <Link href="tel:18329604471" className="text-enterprise-bright">
              (832) 960-4471
            </Link>
          </p>
          <p className="mt-2 text-sm text-white/90">
            <Link href="mailto:petrucking96@gmail.com" className="text-enterprise-bright">
              petrucking96@gmail.com
            </Link>
          </p>
          <p className="mt-2 text-sm text-white/90">
            <Link
              href="https://www.instagram.com/polley_enterprise/"
              target="_blank"
              rel="noreferrer"
              className="text-enterprise-bright"
            >
              @polley_enterprise
            </Link>
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Quick Links</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/" className="hover:text-enterprise-bright">
                Home
              </Link>
            </li>
            <li>
              <Link href="/services" className="hover:text-enterprise-bright">
                Services
              </Link>
            </li>
            <li>
              <Link href="/quotes" className="hover:text-enterprise-bright">
                Quotes
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:text-enterprise-bright">
                Track Shipment
              </Link>
            </li>
            <li>
              <Link href="/#contact" className="hover:text-enterprise-bright">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/20 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.12em] text-white/70">Need help quickly?</p>
          <p className="mt-3 text-sm text-white/85">Speak directly with our team for fast scheduling.</p>
          <Link href="tel:18329604471" className="mt-5 inline-flex rounded-xl bg-enterprise-blue px-4 py-2 text-sm font-semibold text-white hover:bg-enterprise-bright">
            Call Now
          </Link>
          </div>
          <div className="rounded-2xl border border-enterprise-gold/45 bg-enterprise-gold/10 p-6 shadow-[0_18px_45px_rgba(245,215,110,0.12)]">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-enterprise-gold">
              Employee Access
            </p>
            <p className="mt-3 text-sm text-white/85">
              Log in to manage shipments, start shifts, and update tracking.
            </p>
            <Link
              href="/login"
              className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-enterprise-gold px-4 py-3 text-sm font-bold text-enterprise-navy transition hover:bg-white"
            >
              Employee Login
            </Link>
          </div>
        </div>
      </div>
      <div className="border-t border-white/15">
        <p className="mx-auto max-w-7xl px-4 py-5 text-center text-xs text-white/65">
          © 2026 Polley Enterprise. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
