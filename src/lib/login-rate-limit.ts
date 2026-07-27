import { prisma } from "@/lib/prisma";

const MAX_TENTATIVAS = 5;
const JANELA_MINUTOS = 15;
const BLOQUEIO_MINUTOS = 15;

export class ContaBloqueadaError extends Error {}

function normalizarIdentificador(provider: "tenant" | "super-admin", email: string) {
  return `${provider}:${email.trim().toLowerCase()}`;
}

export async function verificarBloqueio(
  provider: "tenant" | "super-admin",
  email: string
) {
  const identificador = normalizarIdentificador(provider, email);
  const tentativa = await prisma.tentativaLogin.findUnique({
    where: { identificador },
  });
  if (tentativa?.bloqueadoAte && tentativa.bloqueadoAte > new Date()) {
    throw new ContaBloqueadaError();
  }
}

export async function registrarTentativaFalha(
  provider: "tenant" | "super-admin",
  email: string
) {
  const identificador = normalizarIdentificador(provider, email);
  const agora = new Date();
  const existente = await prisma.tentativaLogin.findUnique({
    where: { identificador },
  });

  const janelaExpirada =
    !existente ||
    agora.getTime() - existente.atualizadoEm.getTime() > JANELA_MINUTOS * 60_000;
  const novasTentativas = janelaExpirada ? 1 : existente.tentativas + 1;
  const bloqueadoAte =
    novasTentativas >= MAX_TENTATIVAS
      ? new Date(agora.getTime() + BLOQUEIO_MINUTOS * 60_000)
      : null;

  await prisma.tentativaLogin.upsert({
    where: { identificador },
    create: { identificador, tentativas: novasTentativas, bloqueadoAte },
    update: { tentativas: novasTentativas, bloqueadoAte },
  });
}

export async function limparTentativas(
  provider: "tenant" | "super-admin",
  email: string
) {
  const identificador = normalizarIdentificador(provider, email);
  await prisma.tentativaLogin.deleteMany({ where: { identificador } });
}
