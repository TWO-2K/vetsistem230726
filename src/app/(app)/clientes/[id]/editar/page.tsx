import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/forms/cliente-form";
import { atualizarCliente } from "@/actions/clientes";

export default async function EditarClientePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const cliente = await prisma.cliente.findUnique({
    where: { id, tenantId: session.user.tenantId },
  });

  if (!cliente) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Editar cliente
        </h1>
        <p className="text-muted-foreground">{cliente.nome}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm
            cliente={cliente}
            action={atualizarCliente.bind(null, cliente.id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
