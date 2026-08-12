"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Phone, X } from "lucide-react";
import { Button } from "@/components/Button";
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
  const isHomeTop = pathname === "/" && !isScrolled;

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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all",
        isScrolled ? "pt-2 sm:pt-3" : "pt-3 sm:pt-4"
      )}
    >
      <div
        className={cn(
          "mx-3 flex max-w-7xl items-center justify-between rounded-2xl px-3 py-2.5 transition-all sm:mx-4 sm:px-4 sm:py-3.5 xl:mx-auto",
          isHomeTop
            ? "bg-transparent"
            : "glass-panel shadow-[0_10px_28px_rgba(11,42,91,0.12)]"
        )}
      >
        <Link href="/" className="flex min-w-0 items-center gap-2.5 sm:gap-3">
          <span
            className={cn(
              "relative h-9 w-9 shrink-0 overflow-hidden rounded-lg sm:h-12 sm:w-12",
              isHomeTop
                ? "border border-white/20 bg-white/10 backdrop-blur-sm"
                : "border border-enterprise-border bg-white"
            )}
          >
            <Image
              src="/images/logo-square.png"
              alt="Polley Enterprise logo"
              fill
              sizes="48px"
              className="object-contain"
              priority
            />
          </span>
          <span
            className={cn(
              "truncate text-sm font-bold tracking-tight sm:text-xl",
              isHomeTop ? "text-white" : "text-enterprise-navy"
            )}
          >
            Polley Enterprise
          </span>
        </Link>
        <nav className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium uppercase tracking-[0.11em] transition",
                pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                  ? isHomeTop
                    ? "text-white"
                    : "text-enterprise-blue"
                  : isHomeTop
                    ? "text-white/85 hover:text-white"
                    : "text-enterprise-charcoal hover:text-enterprise-blue"
              )}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="tel:18329604471"
            className={cn("text-sm font-semibold", isHomeTop ? "text-white" : "text-enterprise-navy")}
          >
            (832) 960-4471
          </Link>
          <Link href="/quotes">
            <Button className="px-5 py-2.5">Request a Quote</Button>
          </Link>
        </nav>
        <button
          type="button"
          className={cn(
            "rounded-lg border p-2 shadow-sm lg:hidden",
            isHomeTop
              ? "border-white/30 bg-white/15 text-white backdrop-blur-sm"
              : "border-enterprise-border bg-white/90 text-enterprise-charcoal"
          )}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open ? (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-menu"
            className="relative z-50 mx-3 mt-2 rounded-2xl border border-enterprise-border bg-white px-4 pb-5 pt-3 shadow-[0_14px_32px_rgba(11,79,156,0.18)] sm:mx-4 lg:hidden"
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "rounded-xl px-3 py-3 text-base font-medium",
                    pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href))
                      ? "bg-enterprise-light text-enterprise-blue"
                      : "text-enterprise-charcoal hover:bg-enterprise-light"
                  )}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="tel:18329604471"
                onClick={() => setOpen(false)}
                className="mt-2 flex items-center gap-2 rounded-xl border border-enterprise-border px-3 py-3 text-base font-semibold text-enterprise-navy"
              >
                <Phone className="h-4 w-4 text-enterprise-blue" />
                Call (832) 960-4471
              </Link>
              <Link href="/quotes" onClick={() => setOpen(false)} className="mt-2">
                <Button className="w-full rounded-xl py-3.5">Request a Quote</Button>
              </Link>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
