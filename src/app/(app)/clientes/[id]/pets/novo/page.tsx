import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetForm } from "@/components/forms/pet-form";
import { criarPet } from "@/actions/pets";

export default async function NovoPetPage({
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
        <h1 className="font-heading text-3xl font-bold tracking-tight text-text">
          Novo pet
        </h1>
        <p className="text-sm text-text-secondary">Tutor: {cliente.nome}</p>
      </div>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Dados do pet</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm clienteId={cliente.id} action={criarPet} />
        </CardContent>
      </Card>
    </div>
  );
}
