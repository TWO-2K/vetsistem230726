import { Papel } from "@/generated/prisma/client";

export function isAdmin(papel: string) {
  return papel === Papel.ADMIN;
}

export function podeAtenderClinico(papel: string) {
  return papel === Papel.ADMIN || papel === Papel.VET;
}

export function podeGerenciarFinanceiro(papel: string) {
  return papel === Papel.ADMIN || papel === Papel.RECEPCAO;
}

export function podeGerenciarEstoque(papel: string) {
  return papel === Papel.ADMIN;
}

export function requireRole(papel: string, permitido: Papel[]) {
  if (!permitido.includes(papel as Papel)) {
    throw new Error("Você não tem permissão para executar esta ação.");
  }
}
