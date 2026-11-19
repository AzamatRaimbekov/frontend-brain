import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/** The only class-merging helper (react-ui section 3). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
