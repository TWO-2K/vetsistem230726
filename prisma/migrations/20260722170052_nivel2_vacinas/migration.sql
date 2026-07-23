-- CreateTable
CREATE TABLE "Vacina" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "petId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "dataAplicacao" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "proximaDose" TIMESTAMP(3),
    "observacoes" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Vacina_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vacina_tenantId_idx" ON "Vacina"("tenantId");

-- CreateIndex
CREATE INDEX "Vacina_petId_idx" ON "Vacina"("petId");

-- CreateIndex
CREATE INDEX "Vacina_proximaDose_idx" ON "Vacina"("proximaDose");

-- AddForeignKey
ALTER TABLE "Vacina" ADD CONSTRAINT "Vacina_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacina" ADD CONSTRAINT "Vacina_petId_fkey" FOREIGN KEY ("petId") REFERENCES "Pet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Vacina" ADD CONSTRAINT "Vacina_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
