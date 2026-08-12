"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type AnimatedSectionProps = HTMLMotionProps<"section"> & {
  children: ReactNode;
};

export function AnimatedSection({ children, className, ...props }: AnimatedSectionProps) {
  return (
    <motion.section
      {...props}
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.55, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.section>
  );
}
