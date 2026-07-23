export function toCsv(headers: string[], rows: (string | number)[][]): string {
  const escapar = (v: string | number) => {
    const s = String(v);
    return /[",\n;]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const linhas = [headers, ...rows].map((linha) => linha.map(escapar).join(";"));
  return "﻿" + linhas.join("\r\n");
}
