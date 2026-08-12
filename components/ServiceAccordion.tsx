"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type ServiceAccordionItem = {
  title: string;
  summary: string;
  bullets: string[];
};

type ServiceAccordionProps = {
  items: ServiceAccordionItem[];
};

export function ServiceAccordion({ items }: ServiceAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number>(0);

  return (
    <div className="space-y-5">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article
            key={item.title}
            className="overflow-hidden rounded-3xl border border-enterprise-border bg-white shadow-[0_14px_35px_rgba(6,33,63,0.08)] transition hover:shadow-[0_18px_46px_rgba(11,42,91,0.16)]"
          >
            <button
              type="button"
              className="flex w-full items-center justify-between gap-4 bg-gradient-to-r from-white to-enterprise-light/40 p-5 text-left sm:p-6 md:p-7"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <div>
                <h3 className="text-xl font-bold leading-tight text-enterprise-charcoal sm:text-2xl">{item.title}</h3>
                <p className="mt-2 text-sm text-enterprise-gray md:text-base">{item.summary}</p>
              </div>
              <span className="rounded-full bg-white p-2 shadow-sm">
                <ChevronDown
                  className={cn(
                    "h-5 w-5 shrink-0 text-enterprise-blue transition-transform",
                    isOpen ? "rotate-180" : "rotate-0"
                  )}
                />
              </span>
            </button>
            {isOpen ? (
              <div className="border-t border-enterprise-border px-5 py-5 sm:px-6 md:px-7">
                <ul className="space-y-2.5">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="rounded-lg bg-enterprise-light/35 px-3.5 py-2.5 text-sm text-enterprise-charcoal md:text-base"
                    >
                      <span className="mr-2 text-enterprise-blue">•</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
