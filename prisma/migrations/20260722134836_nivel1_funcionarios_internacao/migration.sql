-- CreateEnum
CREATE TYPE "StatusInternacao" AS ENUM ('ATIVA', 'ALTA');

-- CreateTable
CREATE TABLE "Internacao" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "motivo" TEXT NOT NULL,
    "status" "StatusInternacao" NOT NULL DEFAULT 'ATIVA',
    "observacoes" TEXT,
    "dataEntrada" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataAlta" TIMESTAMP(3),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Internacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InternacaoEvolucao" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "internacaoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "texto" TEXT NOT NULL,
    "data" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternacaoEvolucao_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Internacao_tenantId_idx" ON "Internacao"("tenantId");

-- CreateIndex
CREATE INDEX "Internacao_petId_idx" ON "Internacao"("petId");

-- CreateIndex
CREATE INDEX "InternacaoEvolucao_tenantId_idx" ON "InternacaoEvolucao"("tenantId");

-- CreateIndex
CREATE INDEX "InternacaoEvolucao_internacaoId_idx" ON "InternacaoEvolucao"("internacaoId");

-- AddForeignKey
ALTER TABLE "Internacao" ADD CONSTRAINT "Internacao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internacao" ADD CONSTRAINT "Internacao_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Internacao" ADD CONSTRAINT "Internacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternacaoEvolucao" ADD CONSTRAINT "InternacaoEvolucao_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternacaoEvolucao" ADD CONSTRAINT "InternacaoEvolucao_internacaoId_fkey" FOREIGN KEY ("internacaoId") REFERENCES "Internacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InternacaoEvolucao" ADD CONSTRAINT "InternacaoEvolucao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
