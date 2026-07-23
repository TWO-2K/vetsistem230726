-- AlterTable
ALTER TABLE "MovimentoEstoque" ADD COLUMN     "cobrancaId" TEXT;

-- CreateIndex
CREATE INDEX "MovimentoEstoque_cobrancaId_idx" ON "MovimentoEstoque"("cobrancaId");

-- AddForeignKey
ALTER TABLE "MovimentoEstoque" ADD CONSTRAINT "MovimentoEstoque_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE SET NULL ON UPDATE CASCADE;
