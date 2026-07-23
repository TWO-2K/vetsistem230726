import { differenceInYears, differenceInMonths } from "date-fns";

export function formatIdade(dataNascimento: Date): string {
  const anos = differenceInYears(new Date(), dataNascimento);
  const meses = differenceInMonths(new Date(), dataNascimento) % 12;

  if (anos === 0 && meses === 0) return "recém-nascido";

  const partes: string[] = [];
  if (anos > 0) partes.push(`${anos} ano${anos > 1 ? "s" : ""}`);
  if (meses > 0) partes.push(`${meses} ${meses > 1 ? "meses" : "mês"}`);
  return partes.join(", ");
}
