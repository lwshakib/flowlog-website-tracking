/**
 * @file lib/utils.ts
 * @description Utility functions for the application.
 * Highlights include the standard Tailwind CSS class merging utility.
 */

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * cn
 * @description Combines multiple class names and resolves Tailwind CSS conflicts.
 * Useful for conditional styling and extending component styles.
 * @param {...ClassValue[]} inputs - An array of class names or conditional class objects.
 * @returns {string} The merged and optimized class string.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
