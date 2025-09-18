import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatarData(Data: string): string {
  if (typeof Data !== "string" || Data.trim() === "") {
    console.error("Data inválida ou vazia");
    return "Data inválida";
  }
  const partes = Data.split("-");
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

export function verificarValor(valor: string) {
  return valor === undefined || valor === null || valor === ""
    ? " ______________ "
    : `${valor}`;
}

export function verificarValorEspecial(valor: string) {
  return valor === undefined || valor === null || valor === ""
    ? " "
    : `${valor}`;
}

// util.ts
/**
 * Valida diferentes documentos de identificação pelo valor digitado
 * @param tipo Tipo de documento (Rg, CNH, Passaporte, Ctps, Identidade funcional)
 * @param valor Valor digitado pelo usuário
 * @returns boolean - true se for válido, false caso contrário
 */
export function validador(tipo: string, valor: string): boolean {
  if (!valor || valor.trim() === "") return false;

  switch (tipo) {
    case "Rg":
      // RG geralmente de 7 a 10 dígitos numéricos
      return /^[0-9]{7,10}$/.test(valor);

    case "CNH":
      // CNH tem 11 dígitos numéricos
      return /^[0-9]{11}$/.test(valor);

    case "Passaporte":
      // Passaporte brasileiro: 2 letras + 6 a 7 dígitos
      return /^[A-Z]{2}[0-9]{6,7}$/i.test(valor);

    case "Ctps":
      // CTPS geralmente: número de 7 dígitos + dígito verificador
      return /^[0-9]{7,8}$/.test(valor);

    case "Identidade funcional":
      // Pode variar, aqui aceitamos letras e números de 5 a 15 caracteres
      return /^[A-Za-z0-9]{5,15}$/.test(valor);

    default:
      return false;
  }
}

// Função auxiliar para converter números em extenso (simplificada)
export function extenso(valor: number): string {
  // Implementação simplificada - seria necessário uma biblioteca ou função mais completa
  const unidades = [
    "zero",
    "um",
    "dois",
    "três",
    "quatro",
    "cinco",
    "seis",
    "sete",
    "oito",
    "nove",
  ];
  const dezenas = [
    "dez",
    "vinte",
    "trinta",
    "quarenta",
    "cinquenta",
    "sessenta",
    "setenta",
    "oitenta",
    "noventa",
  ];
  const centenas = [
    "cem",
    "duzentos",
    "trezentos",
    "quatrocentos",
    "quinhentos",
    "seiscentos",
    "setecentos",
    "oitocentos",
    "novecentos",
  ];

  if (valor === 0) return "zero reais";
  if (valor < 10) return unidades[Math.floor(valor)] + " reais";
  if (valor < 100)
    return (
      dezenas[Math.floor(valor / 10) - 1] +
      (valor % 10 !== 0 ? " e " + unidades[valor % 10] : "") +
      " reais"
    );
  if (valor < 1000)
    return (
      centenas[Math.floor(valor / 100) - 1] +
      (valor % 100 !== 0 ? " e " + extenso(valor % 100) : " reais")
    );

  return "valor em reais"; // Para valores maiores, seria necessária implementação mais completa
}
