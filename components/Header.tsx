"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Quotes", href: "/quotes" },
  { label: "Track", href: "/track" },
  { label: "Contact", href: "/#contact" },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomeTop = pathname === "/" && !isScrolled && !open;

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const closeOnResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };
    window.addEventListener("resize", closeOnResize);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("resize", closeOnResize);
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || (href !== "/" && !href.startsWith("/#") && pathname.startsWith(href));

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300",
          isHomeTop ? "border-white/15 bg-transparent" : "border-white/12 bg-enterprise-navy"
        )}
      >
        <div className="container-enterprise flex items-center justify-between py-4">
          <Link
            href="/"
            className="inline-flex rounded-sharp focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-enterprise-bright"
          >
            <span className="inline-flex items-center gap-3">
              <span className="relative h-10 w-10 shrink-0 overflow-hidden rounded-sharp border border-white/20 sm:h-11 sm:w-11">
                <Image
                  src="/images/logo-square.png"
                  alt="Polley Enterprise logo"
                  fill
                  sizes="44px"
                  className="object-cover"
                  priority
                />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="font-display block text-base font-extrabold uppercase tracking-tight text-white sm:text-lg">
                  Polley Enterprise
                </span>
                <span className="mt-0.5 block text-[9px] font-semibold uppercase tracking-[0.16em] text-white/75 sm:text-[10px]">
                  Transportation &amp; Logistics
                </span>
              </span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 xl:flex" aria-label="Primary">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "border-b py-1 text-[11px] font-semibold uppercase tracking-[0.16em] transition-colors",
                  isActive(link.href)
                    ? "border-enterprise-gold text-white"
                    : "border-transparent text-white/70 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="hidden items-center gap-6 xl:flex">
            <Link
              href="tel:18329604471"
              className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white transition-colors hover:text-enterprise-gold"
            >
              <Phone className="h-3.5 w-3.5" />
              832-960-4471
            </Link>
            <Link
              href="/quotes"
              className="inline-flex items-center justify-center rounded-sharp bg-enterprise-gold px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
            >
              Request A Quote
            </Link>
          </div>
          <div className="flex items-center gap-2 xl:hidden">
            <Link
              href="/quotes"
              className="inline-flex items-center justify-center rounded-sharp bg-enterprise-gold px-4 py-2.5 text-[0.6875rem] font-bold uppercase tracking-[0.12em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
            >
              Quote
            </Link>
            <button
              type="button"
              className="rounded-sharp border border-white/30 p-2.5 text-white transition-colors hover:bg-white/10"
              onClick={() => setOpen((value) => !value)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>
      <div
        id="mobile-menu"
        className={cn(
          "fixed inset-0 z-40 bg-enterprise-navy-deep transition duration-300 xl:hidden",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        )}
        aria-hidden={!open}
      >
        <div className="flex h-full flex-col px-5 pb-10 pt-24 sm:px-8">
          <nav className="flex-1 overflow-y-auto border-t border-white/10" aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "font-display block border-b border-white/10 py-5 text-2xl font-bold uppercase tracking-[0.01em] transition-colors",
                  isActive(link.href) ? "text-enterprise-gold" : "text-white/85 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="font-display block border-b border-white/10 py-5 text-2xl font-bold uppercase tracking-[0.01em] text-white/85 transition-colors hover:text-white"
            >
              Employee Login
            </Link>
          </nav>
          <div className="mt-8 grid gap-3">
            <Link
              href="/quotes"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center rounded-sharp bg-enterprise-gold px-7 py-3.5 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
            >
              Request A Quote
            </Link>
            <Link
              href="tel:18329604471"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-sharp border border-white/45 px-7 py-3.5 text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-white transition-colors hover:bg-white/10"
            >
              Call 832-960-4471
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
