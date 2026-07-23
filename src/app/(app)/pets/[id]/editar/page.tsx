import { notFound } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PetForm } from "@/components/forms/pet-form";
import { atualizarPet } from "@/actions/pets";

export default async function EditarPetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  const { id } = await params;

  const pet = await prisma.pet.findUnique({
    where: { id, tenantId: session.user.tenantId },
    include: { cliente: true },
  });

  if (!pet) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">Editar pet</h1>
        <p className="text-muted-foreground">Tutor: {pet.cliente.nome}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados do pet</CardTitle>
        </CardHeader>
        <CardContent>
          <PetForm
            pet={pet}
            clienteId={pet.clienteId}
            action={atualizarPet.bind(null, pet.id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
