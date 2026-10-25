import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

/*
 * tailwind-merge must know the extra Mbank font sizes (text-2xs, text-caption, text-md from
 * mbank-tokens.css); otherwise it treats them as text colours and drops one of the two classes.
 */
const twMerge = extendTailwindMerge({
  extend: { classGroups: { "font-size": [{ text: ["2xs", "caption", "md"] }] } },
})

/** The only class-merging helper (react-ui section 3). */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
