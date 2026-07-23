import { requireSuperAdminSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { criarEmpresa } from "@/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default async function NovaEmpresaPage() {
  await requireSuperAdminSession();

  const planos = await prisma.plano.findMany({ orderBy: { nome: "asc" } });
  const planoItems = Object.fromEntries(planos.map((p) => [p.id, p.nome]));

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">
          Nova empresa
        </h1>
        <p className="text-muted-foreground">
          Cadastre a clínica e o usuário administrador inicial.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Dados da empresa</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={criarEmpresa} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da empresa *</Label>
              <Input id="nome" name="nome" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="planoId">Plano</Label>
              <Select name="planoId" items={planoItems}>
                <SelectTrigger id="planoId" className="w-full">
                  <SelectValue placeholder="Sem plano" />
                </SelectTrigger>
                <SelectContent>
                  {planos.map((plano) => (
                    <SelectItem key={plano.id} value={plano.id}>
                      {plano.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <h3 className="mb-3 text-sm font-semibold">
                Administrador inicial
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nomeAdmin">Nome *</Label>
                  <Input id="nomeAdmin" name="nomeAdmin" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emailAdmin">E-mail *</Label>
                  <Input
                    id="emailAdmin"
                    name="emailAdmin"
                    type="email"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senhaAdmin">Senha *</Label>
                  <Input
                    id="senhaAdmin"
                    name="senhaAdmin"
                    type="password"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit">Criar empresa</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
