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

export function verificarValorEspecial(valor: string) {
  return valor === undefined || valor === null || valor === "" ? " " : `${valor}`;
}


// Função auxiliar para converter números em extenso (simplificada)
export function extenso(valor: number): string {
  // Implementação simplificada - seria necessário uma biblioteca ou função mais completa
  const unidades = ["zero", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove"];
  const dezenas = ["dez", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
  const centenas = ["cem", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

  if (valor === 0) return "zero reais";
  if (valor < 10) return unidades[Math.floor(valor)] + " reais";
  if (valor < 100) return dezenas[Math.floor(valor / 10) - 1] + (valor % 10 !== 0 ? " e " + unidades[valor % 10] : "") + " reais";
  if (valor < 1000) return centenas[Math.floor(valor / 100) - 1] + (valor % 100 !== 0 ? " e " + extenso(valor % 100) : " reais");

  return "valor em reais"; // Para valores maiores, seria necessária implementação mais completa
}
