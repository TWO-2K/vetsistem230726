import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations";
import {
  ContaBloqueadaError,
  limparTentativas,
  registrarTentativaFalha,
  verificarBloqueio,
} from "@/lib/login-rate-limit";

export class EmpresaSuspensaError extends CredentialsSignin {
  code = "empresa-suspensa";
}

export class ContaBloqueadaAuthError extends CredentialsSignin {
  code = "conta-bloqueada";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          await verificarBloqueio("tenant", parsed.data.email);
        } catch (error) {
          if (error instanceof ContaBloqueadaError) throw new ContaBloqueadaAuthError();
          throw error;
        }

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email },
          include: { tenant: true },
        });
        if (!usuario || !usuario.ativo) {
          await registrarTentativaFalha("tenant", parsed.data.email);
          return null;
        }
        if (usuario.tenant.status === "SUSPENSO") throw new EmpresaSuspensaError();

        const senhaValida = await bcrypt.compare(
          parsed.data.password,
          usuario.senhaHash
        );
        if (!senhaValida) {
          await registrarTentativaFalha("tenant", parsed.data.email);
          return null;
        }
        await limparTentativas("tenant", parsed.data.email);

        return {
          id: usuario.id,
          name: usuario.nome,
          email: usuario.email,
          tipo: "TENANT" as const,
          tenantId: usuario.tenantId,
          papel: usuario.papel,
        };
      },
    }),
    Credentials({
      id: "super-admin",
      name: "Super Admin",
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const parsed = signInSchema.safeParse(credentials);
        if (!parsed.success) return null;

        try {
          await verificarBloqueio("super-admin", parsed.data.email);
        } catch (error) {
          if (error instanceof ContaBloqueadaError) throw new ContaBloqueadaAuthError();
          throw error;
        }

        const superAdmin = await prisma.superAdmin.findUnique({
          where: { email: parsed.data.email },
        });
        if (!superAdmin) {
          await registrarTentativaFalha("super-admin", parsed.data.email);
          return null;
        }

        const senhaValida = await bcrypt.compare(
          parsed.data.password,
          superAdmin.senhaHash
        );
        if (!senhaValida) {
          await registrarTentativaFalha("super-admin", parsed.data.email);
          return null;
        }
        await limparTentativas("super-admin", parsed.data.email);

        return {
          id: superAdmin.id,
          name: superAdmin.nome,
          email: superAdmin.email,
          tipo: "SUPER_ADMIN" as const,
        };
      },
    }),
  ],
  callbacks: {
    jwt: async ({ token, user }) => {
      if (user) {
        token.tipo = user.tipo;
        if (user.tipo === "TENANT") {
          token.tenantId = user.tenantId;
          token.papel = user.papel;
        }
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.tipo = token.tipo as "TENANT" | "SUPER_ADMIN";
        session.user.tenantId = token.tenantId as string | undefined;
        session.user.papel = token.papel as string | undefined;
      }
      return session;
    },
  },
});
