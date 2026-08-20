import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Keeps long hashes and addresses readable without hiding which value it is. */
export function truncateMiddle(value: string, lead = 8, tail = 6): string {
  return value.length > lead + tail + 1 ? `${value.slice(0, lead)}…${value.slice(-tail)}` : value;
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
