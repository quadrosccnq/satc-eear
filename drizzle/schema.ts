import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Tabela de usuários com 5 níveis de acesso:
 * - aluno: Pode visualizar apenas suas próprias fichas
 * - instrutor: Pode criar e editar fichas de avaliação
 * - coordenador: Pode visualizar e gerenciar fichas de sua unidade
 * - gerente: Pode gerenciar usuários e visualizar relatórios gerais
 * - administrador: Acesso total ao sistema
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["aluno", "instrutor", "coordenador", "gerente", "administrador"]).default("aluno").notNull(),
  unidade: varchar("unidade", { length: 255 }), // Unidade/Órgão ATC do usuário
  orgaoAtc: varchar("orgaoAtc", { length: 255 }), // Órgão ATC específico
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de fichas de avaliação prática de ATCO
 * Baseada no Anexo C da CIRCEA 100-51
 */
export const fichasAvaliacao = mysqlTable("fichas_avaliacao", {
  id: int("id").autoincrement().primaryKey(),
  // Dados do avaliado
  avaliadoId: int("avaliadoId").notNull().references(() => users.id),
  avaliadoNome: varchar("avaliadoNome", { length: 255 }).notNull(),
  // Dados do avaliador
  avaliadorId: int("avaliadorId").notNull().references(() => users.id),
  avaliadorNome: varchar("avaliadorNome", { length: 255 }).notNull(),
  // Informações da avaliação
  orgaoAtc: varchar("orgaoAtc", { length: 255 }).notNull(),
  localAvaliacao: varchar("localAvaliacao", { length: 255 }).notNull(),
  dataAvaliacao: timestamp("dataAvaliacao").notNull(),
  finalidade: mysqlEnum("finalidade", ["Final", "Estágio"]).notNull(),
  licenca: varchar("licenca", { length: 100 }),
  // Condições do cenário
  condicoesCenario: text("condicoesCenario"), // Meteorologia, volume de tráfego, falhas, etc
  // Tempos avaliados
  tempoPosicaoControle: int("tempoPosicaoControle").default(0), // em minutos
  tempoPosicaoAssistente: int("tempoPosicaoAssistente").default(0), // em minutos
  // Rendimento geral
  rendimento: varchar("rendimento", { length: 20 }), // Calculado ou "NC" (Não Calculado)
  // Comentários gerais
  comentarios: text("comentarios"),
  // Status da ficha
  status: mysqlEnum("status", ["rascunho", "finalizada", "aprovada", "reprovada"]).default("rascunho").notNull(),
  // Assinaturas
  assinadoPorAvaliado: int("assinadoPorAvaliado").default(0), // boolean
  assinadoPorAvaliador: int("assinadoPorAvaliador").default(0), // boolean
  assinadoPorChefe: int("assinadoPorChefe").default(0), // boolean
  chefeOrgaoId: int("chefeOrgaoId").references(() => users.id),
  chefeOrgaoNome: varchar("chefeOrgaoNome", { length: 255 }),
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FichaAvaliacao = typeof fichasAvaliacao.$inferSelect;
export type InsertFichaAvaliacao = typeof fichasAvaliacao.$inferInsert;

/**
 * Tabela de itens de avaliação
 * Representa as 11 áreas principais de avaliação do Anexo C
 */
export const itensAvaliacao = mysqlTable("itens_avaliacao", {
  id: int("id").autoincrement().primaryKey(),
  fichaId: int("fichaId").notNull().references(() => fichasAvaliacao.id, { onDelete: "cascade" }),
  // Identificação do item
  area: varchar("area", { length: 1 }).notNull(), // A, B, C, D, E, F, G, H, I, J, K
  areaNome: varchar("areaNome", { length: 255 }).notNull(), // Ex: "LEGISLAÇÃO DE TRÁFEGO AÉREO"
  subitem: varchar("subitem", { length: 255 }).notNull(), // Ex: "Conhecimento das normas de tráfego aéreo"
  // Conceito atribuído
  conceito: mysqlEnum("conceito", ["O", "B", "R", "NS", "NA"]), // Ótimo, Bom, Regular, Não Satisfatório, Não Avaliado
  // Observações específicas do item
  observacoes: text("observacoes"),
  // Ordem de exibição
  ordem: int("ordem").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ItemAvaliacao = typeof itensAvaliacao.$inferSelect;
export type InsertItemAvaliacao = typeof itensAvaliacao.$inferInsert;

/**
 * Tabela de histórico de alterações
 * Para auditoria e rastreabilidade
 */
export const historicoAlteracoes = mysqlTable("historico_alteracoes", {
  id: int("id").autoincrement().primaryKey(),
  fichaId: int("fichaId").notNull().references(() => fichasAvaliacao.id, { onDelete: "cascade" }),
  usuarioId: int("usuarioId").notNull().references(() => users.id),
  usuarioNome: varchar("usuarioNome", { length: 255 }).notNull(),
  acao: varchar("acao", { length: 50 }).notNull(), // criacao, edicao, aprovacao, reprovacao, exclusao
  descricao: text("descricao"),
  dataHora: timestamp("dataHora").defaultNow().notNull(),
});

export type HistoricoAlteracao = typeof historicoAlteracoes.$inferSelect;
export type InsertHistoricoAlteracao = typeof historicoAlteracoes.$inferInsert;

/**
 * Tabela de relatórios salvos
 * Para armazenar relatórios gerados pelos gerentes e administradores
 */
export const relatorios = mysqlTable("relatorios", {
  id: int("id").autoincrement().primaryKey(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  tipo: varchar("tipo", { length: 100 }).notNull(), // desempenho_aluno, estatisticas_instrutor, dashboard_coordenador, etc
  criadoPorId: int("criadoPorId").notNull().references(() => users.id),
  criadoPorNome: varchar("criadoPorNome", { length: 255 }).notNull(),
  parametros: text("parametros"), // JSON com filtros e parâmetros do relatório
  resultado: text("resultado"), // JSON com dados do relatório
  dataGeracao: timestamp("dataGeracao").defaultNow().notNull(),
});

export type Relatorio = typeof relatorios.$inferSelect;
export type InsertRelatorio = typeof relatorios.$inferInsert;

/**
 * Tabela de itens de avaliação padrão (importados da planilha)
 * Contém todos os itens que podem ser usados nas fichas de avaliação
 */
export const itensAvaliacaoPadrao = mysqlTable("itens_avaliacao_padrao", {
  id: int("id").autoincrement().primaryKey(),
  // Identificação do item
  anexoC: varchar("anexoC", { length: 255 }).notNull(), // Categoria/Anexo C (ex: "AVALIAÇÃO COMPORTAMENTAL")
  oi: varchar("oi", { length: 255 }).notNull(), // Descrição do item (ex: "Interesse")
  referencia: varchar("referencia", { length: 100 }), // Referência (ex: "ATM-002")
  // Distribuição nos estágios
  distribuicao: text("distribuicao"), // JSON com array de estágios onde o item é avaliado
  // Ativo/Inativo
  ativo: int("ativo").default(1), // boolean
  // Metadados
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type ItemAvaliacaoPadrao = typeof itensAvaliacaoPadrao.$inferSelect;
export type InsertItemAvaliacaoPadrao = typeof itensAvaliacaoPadrao.$inferInsert;
