import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClienteForm } from "@/components/forms/cliente-form";
import { criarCliente } from "@/actions/clientes";

export default function NovoClientePage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-heading font-bold tracking-tight">Novo cliente</h1>
        <p className="text-muted-foreground">Cadastre um novo tutor.</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Dados do cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <ClienteForm action={criarCliente} />
        </CardContent>
      </Card>
    </div>
  );
}
