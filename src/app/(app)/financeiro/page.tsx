import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { podeGerenciarFinanceiro } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Wallet, X } from "lucide-react";
import { cancelarCobranca, marcarComoPago } from "@/actions/financeiro";
import {
  FORMA_PAGAMENTO_LABEL,
  STATUS_COBRANCA_COLOR,
  STATUS_COBRANCA_VISUAL_LABEL,
  getStatusCobrancaVisual,
} from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function FinanceiroPage() {
  const session = await requireSession();
  if (!podeGerenciarFinanceiro(session.user.papel)) redirect("/dashboard");

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);

  const cobrancas = await prisma.cobranca.findMany({
    where: { tenantId: session.user.tenantId },
    include: { cliente: true, pet: true },
    orderBy: [{ status: "asc" }, { dataVencimento: "asc" }, { criadoEm: "desc" }],
  });

  const pendentes = cobrancas.filter((c) => c.status === "PENDENTE");
  const totalPendente = pendentes.reduce((soma, c) => soma + c.valor, 0);
  const vencidas = pendentes.filter(
    (c) => c.dataVencimento && c.dataVencimento < new Date()
  );
  const recebidoNoMes = cobrancas
    .filter(
      (c) =>
        c.status === "PAGO" && c.dataPagamento && c.dataPagamento >= inicioMes
    )
    .reduce((soma, c) => soma + c.valor, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
            Financeiro
          </h1>
          <p className="text-text-secondary">
            Contas a receber da clínica.
          </p>
        </div>
        <Button render={<Link href="/financeiro/novo" />} nativeButton={false}>
          <Plus className="h-4 w-4" /> Nova cobrança
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              A receber
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
            {totalPendente.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Vencidas
            </CardTitle>
          </CardHeader>
          <CardContent className="font-display text-3xl font-semibold tracking-tight text-text">
            {vencidas.length}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-text-secondary">
              Recebido no mês
            </CardTitle>
          </CardHeader>
          <CardContent className="font-mono text-3xl font-semibold tracking-tight text-text">
            {recebidoNoMes.toLocaleString("pt-BR", {
              style: "currency",
              currency: "BRL",
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardContent className="p-0">
          {cobrancas.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-16 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-bg-sunken text-text-tertiary">
                <Wallet className="h-6 w-6" />
              </div>
              <p className="text-text-secondary">Nenhuma cobrança lançada.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Vencimento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-64">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cobrancas.map((cobranca) => {
                  const statusVisual = getStatusCobrancaVisual(
                    cobranca.status,
                    cobranca.dataVencimento
                  );
                  return (
                    <TableRow key={cobranca.id}>
                      <TableCell className="font-medium text-text">
                        <Link
                          href={`/clientes/${cobranca.cliente.id}`}
                          className="hover:underline"
                        >
                          {cobranca.cliente.nome}
                        </Link>
                        {cobranca.pet && (
                          <span className="text-text-tertiary">
                            {" "}
                            · {cobranca.pet.nome}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-text-secondary">{cobranca.descricao}</TableCell>
                      <TableCell className="font-mono text-text">
                        {cobranca.valor.toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })}
                      </TableCell>
                      <TableCell className="font-mono text-text-secondary">
                        {cobranca.dataVencimento
                          ? cobranca.dataVencimento.toLocaleDateString("pt-BR")
                          : "—"}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            "rounded-full px-2.5 py-1 text-xs font-medium",
                            STATUS_COBRANCA_COLOR[statusVisual]
                          )}
                        >
                          {STATUS_COBRANCA_VISUAL_LABEL[statusVisual]}
                        </span>
                      </TableCell>
                      <TableCell>
                        {cobranca.status === "PENDENTE" ? (
                          <div className="flex items-center gap-2">
                            <form action={marcarComoPago} className="flex items-center gap-2">
                              <input type="hidden" name="cobrancaId" value={cobranca.id} />
                              <Select name="formaPagamento" items={FORMA_PAGAMENTO_LABEL} defaultValue="DINHEIRO">
                                <SelectTrigger size="sm" className="w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(FORMA_PAGAMENTO_LABEL) as (keyof typeof FORMA_PAGAMENTO_LABEL)[]).map(
                                    (forma) => (
                                      <SelectItem key={forma} value={forma}>
                                        {FORMA_PAGAMENTO_LABEL[forma]}
                                      </SelectItem>
                                    )
                                  )}
                                </SelectContent>
                              </Select>
                              <Button type="submit" size="sm">
                                Marcar pago
                              </Button>
                            </form>
                            <form action={cancelarCobranca.bind(null, cobranca.id)}>
                              <Button type="submit" variant="ghost" size="icon">
                                <X className="h-4 w-4" />
                              </Button>
                            </form>
                          </div>
                        ) : (
                          <span className="text-xs text-text-tertiary">
                            {cobranca.status === "PAGO" && cobranca.formaPagamento
                              ? FORMA_PAGAMENTO_LABEL[cobranca.formaPagamento]
                              : "—"}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
