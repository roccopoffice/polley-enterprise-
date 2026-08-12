import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatLabel(value: string) {
  return value
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (char) => char.toUpperCase())
    .trim();
}

export function isFastSubmission(clientTimestamp: number, minMs = 2000) {
  if (!clientTimestamp || Number.isNaN(clientTimestamp)) return false;
  const elapsed = Date.now() - clientTimestamp;
  return elapsed < minMs;
}
