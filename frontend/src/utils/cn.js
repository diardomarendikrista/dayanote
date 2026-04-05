/**
 * @fileoverview Utility for conditionally merging Tailwind CSS classes.
 * Combines `clsx` for conditional logic and `tailwind-merge` to resolve conflicts.
 */

import { twMerge } from "tailwind-merge";
import clsx from "clsx";

/**
 * Merges class names and resolves Tailwind CSS conflicts.
 * 
 * @param {...(string|Object|Array|undefined|null)} classes - Classes to merge.
 * @returns {string} The merged and optimized class string.
 */
export function cn(...classes) {
  return twMerge(clsx(classes));
}
