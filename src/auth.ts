import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signInSchema } from "@/lib/validations";

export class EmpresaSuspensaError extends CredentialsSignin {
  code = "empresa-suspensa";
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

        const usuario = await prisma.usuario.findUnique({
          where: { email: parsed.data.email },
          include: { tenant: true },
        });
        if (!usuario) return null;
        if (!usuario.ativo) return null;
        if (usuario.tenant.status === "SUSPENSO") throw new EmpresaSuspensaError();

        const senhaValida = await bcrypt.compare(
          parsed.data.password,
          usuario.senhaHash
        );
        if (!senhaValida) return null;

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

        const superAdmin = await prisma.superAdmin.findUnique({
          where: { email: parsed.data.email },
        });
        if (!superAdmin) return null;

        const senhaValida = await bcrypt.compare(
          parsed.data.password,
          superAdmin.senhaHash
        );
        if (!senhaValida) return null;

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
