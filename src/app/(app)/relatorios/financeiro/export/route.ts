import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getRelatorioFinanceiro } from "@/lib/relatorios";
import { toCsv } from "@/lib/csv";
import { FORMA_PAGAMENTO_LABEL } from "@/lib/labels";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  const { searchParams } = new URL(request.url);
  const inicioParam = searchParams.get("inicio");
  const fimParam = searchParams.get("fim");

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const inicio = inicioParam ? new Date(`${inicioParam}T00:00:00`) : inicioMes;
  const fim = fimParam ? new Date(`${fimParam}T23:59:59`) : hoje;

  const { cobrancas } = await getRelatorioFinanceiro(
    session.user.tenantId,
    inicio,
    fim
  );

  const csv = toCsv(
    ["Data", "Cliente", "Descrição", "Forma de pagamento", "Valor"],
    cobrancas.map((c) => [
      c.dataPagamento?.toLocaleDateString("pt-BR") ?? "",
      c.cliente.nome,
      c.descricao,
      c.formaPagamento ? FORMA_PAGAMENTO_LABEL[c.formaPagamento] : "",
      c.valor.toFixed(2).replace(".", ","),
    ])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="relatorio-financeiro.csv"',
    },
  });
}
