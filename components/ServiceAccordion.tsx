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
    <div className="border-t border-enterprise-border">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <article key={item.title} className="border-b border-enterprise-border bg-transparent">
            <button
              type="button"
              className="flex w-full items-start justify-between gap-4 py-7 text-left"
              onClick={() => setOpenIndex(isOpen ? -1 : index)}
              aria-expanded={isOpen}
            >
              <div className="grid grid-cols-[auto_1fr] gap-x-5 sm:gap-x-8">
                <span className="index-numeral pt-1.5">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 className="font-display text-xl font-bold uppercase leading-tight tracking-[0.01em] text-enterprise-charcoal sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm leading-[1.7] text-enterprise-gray md:text-base">
                    {item.summary}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={cn(
                  "mt-1 h-5 w-5 shrink-0 text-enterprise-blue transition-transform",
                  isOpen ? "rotate-180" : "rotate-0"
                )}
              />
            </button>
            {isOpen ? (
              <div className="pb-8 pl-0 sm:pl-[4.5rem]">
                <ul className="max-w-2xl border-t border-enterprise-border">
                  {item.bullets.map((bullet) => (
                    <li
                      key={bullet}
                      className="border-b border-enterprise-border py-3 text-sm font-medium text-enterprise-charcoal md:text-[0.9375rem]"
                    >
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
