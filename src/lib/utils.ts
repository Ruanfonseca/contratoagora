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

  // Verificando se o formato de data é no padrão 'YYYY-MM-DD'
  if (Data.length !== 10 || Data[4] !== '-' || Data[7] !== '-') {
    console.error('Formato de data inválido');
    return 'Data inválida';
  }

  // Extraindo as partes diretamente
  const year = Data.substring(0, 4);
  const month = Data.substring(5, 7);
  const day = Data.substring(8, 10);

  return `${day}/${month}/${year}`;
}
