import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(1, "Informe a senha"),
});

export const clienteSchema = z.object({
  nome: z.string().min(2, "Informe o nome do cliente"),
  telefone: z.string().min(8, "Informe um telefone válido"),
  email: z.string().email("E-mail inválido").optional().or(z.literal("")),
  cpf: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
});

export const petSchema = z.object({
  clienteId: z.string().min(1, "Selecione o tutor"),
  nome: z.string().min(1, "Informe o nome do pet"),
  especie: z.string().min(1, "Informe a espécie"),
  raca: z.string().optional().or(z.literal("")),
  sexo: z.enum(["MACHO", "FEMEA"]).optional().or(z.literal("")),
  dataNascimento: z.string().optional().or(z.literal("")),
  peso: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

export const prontuarioSchema = z.object({
  petId: z.string().min(1),
  tipo: z.enum(["CONSULTA", "RETORNO", "EXAME", "VACINA", "CIRURGIA", "OUTRO"]),
  anamnese: z.string().optional().or(z.literal("")),
  diagnostico: z.string().optional().or(z.literal("")),
  prescricao: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

export const agendamentoSchema = z.object({
  clienteId: z.string().min(1, "Selecione o tutor"),
  petId: z.string().min(1, "Selecione o pet"),
  dataHora: z.string().min(1, "Informe data e hora"),
  servico: z.string().min(1, "Informe o serviço"),
  observacoes: z.string().optional().or(z.literal("")),
});

export const funcionarioSchema = z.object({
  nome: z.string().min(2, "Informe o nome"),
  email: z.string().email("E-mail inválido"),
  papel: z.enum(["ADMIN", "VET", "RECEPCAO"]),
  senha: z.string().min(6, "A senha deve ter ao menos 6 caracteres").optional().or(z.literal("")),
});

export const internacaoSchema = z.object({
  petId: z.string().min(1),
  motivo: z.string().min(2, "Informe o motivo da internação"),
  observacoes: z.string().optional().or(z.literal("")),
});

export const evolucaoSchema = z.object({
  internacaoId: z.string().min(1),
  texto: z.string().min(1, "Informe o texto da evolução"),
});

export const vacinaSchema = z.object({
  petId: z.string().min(1),
  nome: z.string().min(1, "Informe o nome da vacina"),
  dataAplicacao: z.string().min(1, "Informe a data de aplicação"),
  proximaDose: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

export const cobrancaSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  petId: z.string().optional().or(z.literal("")),
  descricao: z.string().min(1, "Informe a descrição"),
  valor: z.string().min(1, "Informe o valor"),
  dataVencimento: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),
});

export const pagamentoSchema = z.object({
  cobrancaId: z.string().min(1),
  formaPagamento: z.enum([
    "DINHEIRO",
    "PIX",
    "CARTAO_CREDITO",
    "CARTAO_DEBITO",
    "OUTRO",
  ]),
});

export const produtoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do produto"),
  categoria: z.string().optional().or(z.literal("")),
  unidadeMedida: z.string().min(1, "Informe a unidade de medida"),
  quantidadeMinima: z.string().optional().or(z.literal("")),
  precoCusto: z.string().optional().or(z.literal("")),
  precoVenda: z.string().optional().or(z.literal("")),
});

export const movimentoEstoqueSchema = z.object({
  produtoId: z.string().min(1, "Selecione o produto"),
  tipo: z.enum(["ENTRADA", "SAIDA", "AJUSTE"]),
  quantidade: z.string().min(1, "Informe a quantidade"),
  observacoes: z.string().optional().or(z.literal("")),
});

export const empresaSchema = z.object({
  nome: z.string().min(2, "Informe o nome da empresa"),
  planoId: z.string().optional().or(z.literal("")),
});

export const empresaAdminSchema = z.object({
  nomeAdmin: z.string().min(2, "Informe o nome do administrador"),
  emailAdmin: z.string().email("E-mail inválido"),
  senhaAdmin: z.string().min(6, "A senha deve ter ao menos 6 caracteres"),
});

export const planoSchema = z.object({
  nome: z.string().min(2, "Informe o nome do plano"),
  limiteUsuarios: z.string().optional().or(z.literal("")),
  descricaoRecursos: z.string().optional().or(z.literal("")),
  precoReferencia: z.string().optional().or(z.literal("")),
});

export const vendaPdvSchema = z.object({
  clienteId: z.string().min(1, "Selecione o cliente"),
  petId: z.string().optional().or(z.literal("")),
  formaPagamento: z.enum([
    "DINHEIRO",
    "PIX",
    "CARTAO_CREDITO",
    "CARTAO_DEBITO",
    "OUTRO",
  ]),
});
