-- AlterTable
ALTER TABLE "Tenant" ADD COLUMN     "cnpj" TEXT,
ADD COLUMN     "diasFuncionamento" INTEGER[] DEFAULT ARRAY[1, 2, 3, 4, 5]::INTEGER[],
ADD COLUMN     "email" TEXT,
ADD COLUMN     "endereco" TEXT,
ADD COLUMN     "horarioFim" TEXT NOT NULL DEFAULT '18:00',
ADD COLUMN     "horarioInicio" TEXT NOT NULL DEFAULT '08:00',
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "telefone" TEXT;
