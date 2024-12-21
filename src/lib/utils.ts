import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function formatarData(Data: string): string {
  const [year, month, day] = Data.split('-');
  return `${day}/${month}/${year}`;
};