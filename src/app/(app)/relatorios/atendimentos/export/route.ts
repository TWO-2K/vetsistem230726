import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { isAdmin } from "@/lib/rbac";
import { getRelatorioAtendimentos } from "@/lib/relatorios";
import { toCsv } from "@/lib/csv";
import { TIPO_PRONTUARIO_LABEL } from "@/lib/labels";

export async function GET(request: NextRequest) {
  const session = await requireSession();
  if (!isAdmin(session.user.papel)) redirect("/dashboard");

  const { searchParams } = new URL(request.url);
  const inicioParam = searchParams.get("inicio");
  const fimParam = searchParams.get("fim");
  const usuarioId = searchParams.get("usuarioId") || undefined;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);

  const inicio = inicioParam ? new Date(`${inicioParam}T00:00:00`) : inicioMes;
  const fim = fimParam ? new Date(`${fimParam}T23:59:59`) : hoje;

  const { prontuarios } = await getRelatorioAtendimentos(
    session.user.tenantId,
    inicio,
    fim,
    usuarioId
  );

  const csv = toCsv(
    ["Data", "Pet", "Cliente", "Tipo", "Veterinário"],
    prontuarios.map((p) => [
      p.data.toLocaleDateString("pt-BR"),
      p.pet.nome,
      p.pet.cliente.nome,
      TIPO_PRONTUARIO_LABEL[p.tipo],
      p.usuario.nome,
    ])
  );

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="relatorio-atendimentos.csv"',
    },
  });
}
