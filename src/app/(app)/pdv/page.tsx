import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeGerenciarFinanceiro } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { PdvForm } from "@/components/forms/pdv-form";
import { registrarVendaPdv } from "@/actions/pdv";

export default async function PdvPage() {
  const session = await requireSession();
  if (!podeGerenciarFinanceiro(session.user.papel)) redirect("/dashboard");

  const [clientes, produtos] = await Promise.all([
    prisma.cliente.findMany({
      where: { tenantId: session.user.tenantId },
      include: { pets: true },
      orderBy: { nome: "asc" },
    }),
    prisma.produto.findMany({
      where: { tenantId: session.user.tenantId, ativo: true },
      orderBy: { nome: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          PDV — Venda avulsa
        </h1>
        <p className="text-muted-foreground">
          Venda de produtos com baixa automática de estoque.
        </p>
      </div>
      <PdvForm clientes={clientes} produtos={produtos} action={registrarVendaPdv} />
    </div>
  );
}
