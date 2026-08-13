import Link from "next/link";
import { Phone } from "lucide-react";

export function MobileActionBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/15 bg-enterprise-navy-deep/95 backdrop-blur-md md:hidden">
      <Link
        href="tel:18329604471"
        className="flex items-center justify-center gap-2.5 border-r border-white/15 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-gold transition-colors hover:text-white"
      >
        <Phone className="h-4 w-4" />
        Call Now
      </Link>
      <Link
        href="/quotes"
        className="flex items-center justify-center gap-2.5 bg-enterprise-gold px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-[0.8125rem] font-bold uppercase tracking-[0.14em] text-enterprise-navy transition-colors hover:bg-[#ffe39a]"
      >
        Get Quote
      </Link>
    </div>
  );
}
