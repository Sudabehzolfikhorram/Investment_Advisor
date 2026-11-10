import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const fa = new Intl.NumberFormat("fa-IR");
export const faNumber = (n: number) => fa.format(n);
