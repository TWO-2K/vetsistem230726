import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEmpresa } from "@/lib/rbac";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmpresaForm } from "@/components/forms/empresa-form";
import { atualizarPerfilEmpresa } from "@/actions/empresa";

export default async function EmpresaPage() {
  const session = await requireSession();
  if (!podeGerenciarEmpresa(session.user.papel)) redirect("/dashboard");

  const empresa = await prisma.tenant.findUniqueOrThrow({
    where: { id: session.user.tenantId },
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">Minha empresa</h1>
        <p className="text-muted-foreground">
          Dados gerais, endereço e horário de funcionamento da clínica.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Perfil da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <EmpresaForm empresa={empresa} action={atualizarPerfilEmpresa} />
        </CardContent>
      </Card>
    </div>
  );
}
