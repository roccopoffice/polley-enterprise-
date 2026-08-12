import Link from "next/link";
import { Mail, MapPin, Phone, Instagram } from "lucide-react";

export function ContactInfo() {
  return (
    <div className="rounded-3xl border border-enterprise-border bg-white p-6 shadow-card md:p-8">
      <h3 className="text-2xl font-bold text-enterprise-charcoal">Contact Information</h3>
      <p className="mt-2 text-enterprise-gray">Anthony Polley</p>
      <div className="mt-6 space-y-4">
        <p className="flex items-center gap-3 text-enterprise-charcoal">
          <MapPin className="h-5 w-5 text-enterprise-blue" />
          Houston, Texas
        </p>
        <Link
          href="tel:18329604471"
          className="flex items-center gap-3 text-enterprise-charcoal transition hover:text-enterprise-blue"
        >
          <Phone className="h-5 w-5 text-enterprise-blue" />
          (832) 960-4471
        </Link>
        <Link
          href="mailto:petrucking96@gmail.com"
          className="flex items-center gap-3 text-enterprise-charcoal transition hover:text-enterprise-blue"
        >
          <Mail className="h-5 w-5 text-enterprise-blue" />
          petrucking96@gmail.com
        </Link>
        <Link
          href="https://www.instagram.com/polley_enterprise/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-3 text-enterprise-charcoal transition hover:text-enterprise-blue"
        >
          <Instagram className="h-5 w-5 text-enterprise-blue" />
          Instagram
        </Link>
      </div>
    </div>
  );
}
