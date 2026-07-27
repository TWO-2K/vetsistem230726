import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireSession } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { podeGerenciarEstoque } from "@/lib/rbac";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Pencil, Power, PowerOff, Package } from "lucide-react";
import { ativarProduto, desativarProduto } from "@/actions/estoque";
import { MovimentoEstoqueQuickAdd } from "@/components/forms/movimento-estoque-quick-add";
import { TIPO_MOVIMENTO_LABEL, TIPO_MOVIMENTO_COLOR } from "@/lib/labels";
import { cn } from "@/lib/utils";

export default async function ProdutoDetalhePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession();
  if (!podeGerenciarEstoque(session.user.papel)) redirect("/dashboard");
  const { id } = await params;

  const produto = await prisma.produto.findUnique({
    where: { id, tenantId: session.user.tenantId },
    include: {
      movimentos: {
        orderBy: { criadoEm: "desc" },
        include: { usuario: true, prontuario: { select: { petId: true } } },
      },
    },
  });

  if (!produto) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/estoque"
        className="inline-flex items-center gap-1 text-sm text-text-secondary hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Estoque
      </Link>

      <Card className="shadow-sm">
        <CardContent className="flex flex-col gap-4 pt-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-primary">
              <Package className="h-7 w-7" />
            </div>
            <div className="space-y-1.5">
              <h1 className="font-heading text-2xl font-semibold tracking-tight text-text">
                {produto.nome}
                {!produto.ativo && (
                  <span className="ml-2 text-sm font-normal text-text-tertiary">
                    (Inativo)
                  </span>
                )}
              </h1>
              <p className="text-sm text-text-secondary">
                {produto.categoria ? `${produto.categoria} · ` : ""}
                {produto.unidadeMedida}
              </p>
              <p className="font-mono text-sm text-text-secondary">
                Estoque atual: <span className="font-medium text-text">{produto.quantidadeAtual} {produto.unidadeMedida}</span>
                {" "}· Mínimo: {produto.quantidadeMinima} {produto.unidadeMedida}
              </p>
              {(produto.precoCusto || produto.precoVenda) && (
                <p className="font-mono text-sm text-text-secondary">
                  {produto.precoCusto && `Custo: R$ ${produto.precoCusto.toFixed(2)}`}
                  {produto.precoCusto && produto.precoVenda && " · "}
                  {produto.precoVenda && `Venda: R$ ${produto.precoVenda.toFixed(2)}`}
                </p>
              )}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <Button
              render={<Link href={`/estoque/${produto.id}/editar`} />}
              nativeButton={false}
              variant="outline"
              size="sm"
            >
              <Pencil className="h-4 w-4" /> Editar
            </Button>
            <form
              action={
                produto.ativo
                  ? desativarProduto.bind(null, produto.id)
                  : ativarProduto.bind(null, produto.id)
              }
            >
              <Button type="submit" variant="outline" size="sm">
                {produto.ativo ? (
                  <>
                    <PowerOff className="h-4 w-4" /> Desativar
                  </>
                ) : (
                  <>
                    <Power className="h-4 w-4" /> Ativar
                  </>
                )}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Movimentações</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <MovimentoEstoqueQuickAdd produtoId={produto.id} />
          {produto.movimentos.length === 0 ? (
            <p className="text-sm text-text-secondary">
              Nenhuma movimentação registrada ainda.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {produto.movimentos.map((mov) => (
                <div
                  key={mov.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-3 first:pt-0 last:pb-0"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          TIPO_MOVIMENTO_COLOR[mov.tipo]
                        )}
                      >
                        {TIPO_MOVIMENTO_LABEL[mov.tipo]}
                      </span>
                      <span className="font-mono font-medium text-text">
                        {mov.quantidade > 0 ? "+" : ""}
                        {mov.quantidade} {produto.unidadeMedida}
                      </span>
                    </div>
                    {mov.observacoes && (
                      <p className="text-sm text-text-secondary">{mov.observacoes}</p>
                    )}
                    {mov.prontuario && (
                      <Link
                        href={`/pets/${mov.prontuario.petId}`}
                        className="text-xs text-primary hover:underline"
                      >
                        Baixa automática · Ver prontuário
                      </Link>
                    )}
                  </div>
                  <span className="font-mono text-xs text-text-tertiary">
                    {mov.criadoEm.toLocaleString("pt-BR")} · {mov.usuario.nome}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
