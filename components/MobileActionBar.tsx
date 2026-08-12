import Link from "next/link";
import { MessageSquare, Phone } from "lucide-react";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/20 bg-enterprise-navy/95 px-3 py-3 shadow-[0_-12px_30px_rgba(6,16,36,0.22)] backdrop-blur-md md:hidden pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
      <div className="mx-auto grid max-w-md grid-cols-2 gap-3">
        <Link
          href="tel:18329604471"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-3.5 text-sm font-semibold text-white"
        >
          <Phone className="h-4 w-4 text-enterprise-gold" />
          Call
        </Link>
        <Link
          href="/quotes"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-enterprise-gold px-4 py-3.5 text-sm font-semibold text-enterprise-navy"
        >
          <MessageSquare className="h-4 w-4" />
          Get Quote
        </Link>
      </div>
    </div>
  );
}
