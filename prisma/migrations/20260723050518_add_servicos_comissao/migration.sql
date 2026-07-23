-- AlterTable
ALTER TABLE "Agendamento" ADD COLUMN     "servicoId" TEXT;

-- CreateTable
CREATE TABLE "Servico" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "precoPadrao" DOUBLE PRECISION NOT NULL,
    "percentualComissao" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Servico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CobrancaServico" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "cobrancaId" TEXT NOT NULL,
    "servicoId" TEXT NOT NULL,
    "profissionalId" TEXT NOT NULL,
    "valor" DOUBLE PRECISION NOT NULL,
    "percentualComissao" DOUBLE PRECISION NOT NULL,
    "valorComissao" DOUBLE PRECISION NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CobrancaServico_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Servico_tenantId_idx" ON "Servico"("tenantId");

-- CreateIndex
CREATE INDEX "Servico_nome_idx" ON "Servico"("nome");

-- CreateIndex
CREATE INDEX "CobrancaServico_tenantId_idx" ON "CobrancaServico"("tenantId");

-- CreateIndex
CREATE INDEX "CobrancaServico_cobrancaId_idx" ON "CobrancaServico"("cobrancaId");

-- CreateIndex
CREATE INDEX "CobrancaServico_profissionalId_idx" ON "CobrancaServico"("profissionalId");

-- CreateIndex
CREATE INDEX "CobrancaServico_servicoId_idx" ON "CobrancaServico"("servicoId");

-- CreateIndex
CREATE INDEX "Agendamento_servicoId_idx" ON "Agendamento"("servicoId");

-- AddForeignKey
ALTER TABLE "Agendamento" ADD CONSTRAINT "Agendamento_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servico" ADD CONSTRAINT "Servico_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaServico" ADD CONSTRAINT "CobrancaServico_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaServico" ADD CONSTRAINT "CobrancaServico_cobrancaId_fkey" FOREIGN KEY ("cobrancaId") REFERENCES "Cobranca"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaServico" ADD CONSTRAINT "CobrancaServico_servicoId_fkey" FOREIGN KEY ("servicoId") REFERENCES "Servico"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CobrancaServico" ADD CONSTRAINT "CobrancaServico_profissionalId_fkey" FOREIGN KEY ("profissionalId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
