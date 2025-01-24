import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatarData(Data: string): string {
  if (typeof Data !== 'string' || Data.trim() === '') {
    console.error('Data inválida ou vazia');
    return 'Data inválida';
  }
  const partes = Data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


export function verificarValor(valor: string) {
  return valor === undefined || valor === null || valor === "" ? " ______________ " : `${valor}`;
}