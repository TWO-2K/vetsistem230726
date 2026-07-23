import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getClientesInativos } from "@/lib/relatorios";
import { toCsv } from "@/lib/csv";

const DIAS_PADRAO = 60;

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  const { searchParams } = new URL(request.url);
  const diasParam = Number(searchParams.get("dias"));
  const dias = diasParam > 0 ? diasParam : DIAS_PADRAO;

  const inativos = await getClientesInativos(session.user.tenantId, dias);

  const csv = toCsv(
    ["Cliente", "Telefone", "Última atividade"],
    inativos.map(({ cliente, ultimaAtividade }) => [
      cliente.nome,
      cliente.telefone,
      ultimaAtividade ? ultimaAtividade.toLocaleDateString("pt-BR") : "Nunca",
    ])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="relatorio-clientes-inativos.csv"',
    },
  });
}
