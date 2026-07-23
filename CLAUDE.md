@AGENTS.md

# VET_SISTEMA

Sistema de gestão veterinária multi-tenant (single-tenant na prática hoje). Next.js 16 (App Router) + React 19 + Prisma 7 + PostgreSQL (Supabase em produção, Docker local em dev) + NextAuth v5 + Zod + Tailwind + Base UI.

Dev server roda na porta **3010** (`npm run dev`).

## Banco de dados
- `prisma.config.ts` carrega `.env` (produção, Supabase) e depois `.env.local` sobrepõe (dev local, Docker). `DIRECT_URL` é usada por Migrate/seed; `DATABASE_URL` (via pooler, porta 6543) é usada pela aplicação em runtime.
- Client customizado: `src/generated/prisma/client` (não é o `@prisma/client` padrão) + `@prisma/adapter-pg`.
- Sempre rodar `npx prisma generate` depois de qualquer `migrate dev`/mudança no schema — o client fica desatualizado até isso rodar.
- Para aplicar migrations locais no Supabase (produção): usar `npx prisma migrate deploy` com `.env.local` temporariamente fora do caminho (ele sobrepõe pra Docker local). Ver seção de deploy abaixo.
- Seed: `npx prisma db seed` (nunca rodar `npx tsx prisma/seed.ts` direto — pula o carregamento de env do Prisma e quebra a conexão).

## Estrutura
- `src/app/(app)/<modulo>/page.tsx` — Server Component, busca dados, checa RBAC via `podeXxx(papel)` + `redirect`.
- `src/app/(app)/<modulo>/novo/page.tsx`, `[id]/editar/page.tsx` — formulários de criação/edição.
- `src/actions/<modulo>.ts` — Server Actions (`"use server"`), `requireRole(papel, [Papel...])`, validação Zod, `revalidatePath`.
- `src/components/forms/<modulo>-form.tsx` — client component do formulário (React Hook Form + Zod resolver).
- `src/lib/validations.ts` — todos os Zod schemas.
- `src/lib/rbac.ts` — `requireRole` (actions) + `podeXxx(papel)` (páginas, boolean).
- `src/lib/relatorios.ts` — funções de agregação para relatórios.
- `src/lib/tenant-guard.ts` — `assertXPertenceAoTenant` para validar ownership antes de operar.

Módulos existentes: clientes, pets, prontuários, agenda (agendamentos), internações, vacinas, financeiro (cobranças), estoque (produtos), pdv, relatórios, funcionários, serviços (catálogo), comissões (relatório).

## Padrões a seguir
- RBAC é por página/action, não há middleware central. Sempre replicar o padrão `podeXxx`/`requireRole` já usado nos módulos vizinhos.
- Todo model tem `tenantId` — nunca esquecer de filtrar/gravar por `session.user.tenantId`.
- `Select` (Base UI) exige prop `items` (map valor→label) pra renderizar labels corretamente — não é Radix.
- `Button` compõe com links via `render={<Link .../>} nativeButton={false}`, não `asChild`.
- Snapshot de valores calculados (ex.: percentual de comissão) na hora da transação, não recalcular depois a partir de tabelas que podem mudar.
- Sem abstrações prematuras: copiar o padrão CRUD de um módulo existente (ex. `estoque.ts`/`produto-form.tsx`) em vez de criar uma camada genérica.

## Roadmap
Níveis 0-6 completos (Clientes/Pets/Prontuário, Agenda, Funcionários/RBAC, Internação, Vacinas, Financeiro, Estoque, PDV, Relatórios, Serviços/Comissão). Falta apenas o **Nível 7**: super-admin real / multi-tenant de verdade / hardening pra produção no Supabase.

## Deploy de migrations pro Supabase (produção)
`prisma.config.ts` usa `DIRECT_URL` pra migrate/seed. Localmente o `.env.local` sobrepõe pra Docker, então pra rodar contra produção:
```powershell
Rename-Item .env.local .env.local.bak
npx prisma migrate deploy
Rename-Item .env.local.bak .env.local
```
Ou definir `DIRECT_URL` inline no shell antes do comando (sem tocar em arquivos). Na Vercel, `prisma generate` já roda no build automaticamente — não precisa rodar manualmente lá.
