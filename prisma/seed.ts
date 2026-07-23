import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const senhaSuperAdminHash = await bcrypt.hash("123456", 10);
  await prisma.superAdmin.upsert({
    where: { email: "superadmin@vetsistema.com" },
    update: {},
    create: {
      nome: "Super Admin",
      email: "superadmin@vetsistema.com",
      senhaHash: senhaSuperAdminHash,
    },
  });

  const plano = await prisma.plano.upsert({
    where: { id: "plano-demo" },
    update: {},
    create: {
      id: "plano-demo",
      nome: "Plano Demo",
      limiteUsuarios: 10,
      precoReferencia: 199,
    },
  });

  const tenant = await prisma.tenant.upsert({
    where: { id: "tenant-demo" },
    update: {},
    create: {
      id: "tenant-demo",
      nome: "Clínica VetSistema Demo",
      status: "ATIVO",
      planoId: plano.id,
    },
  });

  const senhaHash = await bcrypt.hash("123456", 10);
  const usuario = await prisma.usuario.upsert({
    where: { email: "admin@vetsistema.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: "Dra. Ana Souza",
      email: "admin@vetsistema.com",
      senhaHash,
      papel: "ADMIN",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "vet@vetsistema.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: "Dr. Carlos Lima",
      email: "vet@vetsistema.com",
      senhaHash,
      papel: "VET",
    },
  });

  await prisma.usuario.upsert({
    where: { email: "recepcao@vetsistema.com" },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: "Marina Costa",
      email: "recepcao@vetsistema.com",
      senhaHash,
      papel: "RECEPCAO",
    },
  });

  const cliente = await prisma.cliente.upsert({
    where: { id: "cliente-demo-1" },
    update: {},
    create: {
      id: "cliente-demo-1",
      tenantId: tenant.id,
      nome: "João Pereira",
      telefone: "(11) 98888-7777",
      email: "joao.pereira@example.com",
    },
  });

  const pet = await prisma.pet.upsert({
    where: { id: "pet-demo-1" },
    update: {},
    create: {
      id: "pet-demo-1",
      tenantId: tenant.id,
      clienteId: cliente.id,
      nome: "Rex",
      especie: "Cão",
      raca: "Labrador",
      sexo: "MACHO",
      peso: 28.5,
    },
  });

  await prisma.prontuario.create({
    data: {
      tenantId: tenant.id,
      petId: pet.id,
      usuarioId: usuario.id,
      tipo: "CONSULTA",
      anamnese: "Tutor relata apatia e diminuição do apetite há 2 dias.",
      diagnostico: "Gastroenterite leve.",
      prescricao: "Dieta leve por 3 dias e observação.",
    },
  });

  const proximaDoseVacina = new Date();
  proximaDoseVacina.setDate(proximaDoseVacina.getDate() + 5);

  await prisma.vacina.upsert({
    where: { id: "vacina-demo-1" },
    update: {},
    create: {
      id: "vacina-demo-1",
      tenantId: tenant.id,
      petId: pet.id,
      usuarioId: usuario.id,
      nome: "V10",
      proximaDose: proximaDoseVacina,
    },
  });

  const servicosDemo = [
    { id: "servico-demo-consulta", nome: "Consulta", precoPadrao: 80, percentualComissao: 20 },
    { id: "servico-demo-banho", nome: "Banho", precoPadrao: 60, percentualComissao: 15 },
    { id: "servico-demo-vacina", nome: "Vacina", precoPadrao: 50, percentualComissao: 10 },
    { id: "servico-demo-cirurgia", nome: "Cirurgia", precoPadrao: 300, percentualComissao: 25 },
  ];
  for (const s of servicosDemo) {
    await prisma.servico.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, tenantId: tenant.id },
    });
  }

  const amanha = new Date();
  amanha.setDate(amanha.getDate() + 1);
  amanha.setHours(10, 0, 0, 0);

  await prisma.agendamento.create({
    data: {
      tenantId: tenant.id,
      clienteId: cliente.id,
      petId: pet.id,
      usuarioId: usuario.id,
      dataHora: amanha,
      servico: "Retorno consulta",
      status: "AGENDADO",
    },
  });

  const vencimentoCobranca = new Date();
  vencimentoCobranca.setDate(vencimentoCobranca.getDate() + 3);

  await prisma.cobranca.upsert({
    where: { id: "cobranca-demo-1" },
    update: {},
    create: {
      id: "cobranca-demo-1",
      tenantId: tenant.id,
      clienteId: cliente.id,
      petId: pet.id,
      usuarioId: usuario.id,
      descricao: "Consulta veterinária",
      valor: 150,
      dataVencimento: vencimentoCobranca,
    },
  });

  console.log(
    "Seed concluído. Logins (senha: 123456): admin@vetsistema.com, vet@vetsistema.com, recepcao@vetsistema.com. Super-admin (/admin/login): superadmin@vetsistema.com"
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
