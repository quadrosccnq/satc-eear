import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, adminProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import * as db from "./db";
import { exportRouter } from "./routers/export";
import { itensRouter } from "./routers/itens";

// Middleware para verificar se o usuário é gerente ou administrador
const gerenteOuAdminProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  if (ctx.user.role !== "gerente" && ctx.user.role !== "administrador") {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a gerentes e administradores" 
    });
  }
  return next({ ctx });
});

// Middleware para verificar se o usuário é instrutor, coordenador, gerente ou administrador
const instrutorOuSuperiorProcedure = protectedProcedure.use(async ({ ctx, next }) => {
  const allowedRoles = ["instrutor", "coordenador", "gerente", "administrador"];
  if (!allowedRoles.includes(ctx.user.role)) {
    throw new TRPCError({ 
      code: "FORBIDDEN", 
      message: "Acesso restrito a instrutores e superiores" 
    });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ========== Gerenciamento de Usuários ==========
  users: router({
    // Listar todos os usuários (apenas gerentes e administradores)
    list: gerenteOuAdminProcedure.query(async () => {
      return await db.getAllUsers();
    }),

    // Obter usuário por ID
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getUserById(input.id);
      }),

    // Criar novo usuário (apenas gerentes e administradores)
    create: gerenteOuAdminProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        role: z.enum(["aluno", "instrutor", "coordenador", "gerente", "administrador"]),
        unidade: z.string().optional(),
        orgaoAtc: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Gerar um openId temporário para o usuário
        const openId = `temp_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        
        await db.createUser({
          openId,
          name: input.name,
          email: input.email,
          role: input.role,
          unidade: input.unidade,
          orgaoAtc: input.orgaoAtc,
          loginMethod: "manual",
        });

        return { success: true, message: "Usuário criado com sucesso" };
      }),

    // Atualizar usuário (apenas gerentes e administradores)
    update: gerenteOuAdminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        role: z.enum(["aluno", "instrutor", "coordenador", "gerente", "administrador"]).optional(),
        unidade: z.string().optional(),
        orgaoAtc: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await db.updateUser(id, updates);
        return { success: true, message: "Usuário atualizado com sucesso" };
      }),

    // Excluir usuário (apenas gerentes e administradores)
    delete: gerenteOuAdminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteUser(input.id);
        return { success: true, message: "Usuário excluído com sucesso" };
      }),
  }),

  // ========== Fichas de Avaliação ==========
  fichas: router({
    // Listar fichas (com controle de acesso)
    list: protectedProcedure.query(async ({ ctx }) => {
      const user = ctx.user;
      
      // Alunos veem apenas suas próprias fichas
      if (user.role === "aluno") {
        return await db.getFichasByAvaliado(user.id);
      }
      
      // Instrutores veem fichas que criaram
      if (user.role === "instrutor") {
        return await db.getFichasByAvaliador(user.id);
      }
      
      // Coordenadores, gerentes e administradores veem todas
      return await db.getAllFichas();
    }),

    // Obter ficha por ID (com controle de acesso)
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input, ctx }) => {
        const ficha = await db.getFichaById(input.id);
        
        if (!ficha) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada" });
        }

        // Alunos só podem ver suas próprias fichas
        if (ctx.user.role === "aluno" && ficha.avaliadoId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        // Instrutores só podem ver fichas que criaram
        if (ctx.user.role === "instrutor" && ficha.avaliadorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        return ficha;
      }),

    // Obter itens de avaliação de uma ficha
    getItens: protectedProcedure
      .input(z.object({ fichaId: z.number() }))
      .query(async ({ input, ctx }) => {
        // Verificar se o usuário tem acesso à ficha
        const ficha = await db.getFichaById(input.fichaId);
        
        if (!ficha) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada" });
        }

        if (ctx.user.role === "aluno" && ficha.avaliadoId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        if (ctx.user.role === "instrutor" && ficha.avaliadorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        return await db.getItensByFichaId(input.fichaId);
      }),

    // Criar ficha (apenas instrutores e superiores)
    create: instrutorOuSuperiorProcedure
      .input(z.object({
        avaliadoId: z.number(),
        avaliadoNome: z.string(),
        orgaoAtc: z.string(),
        localAvaliacao: z.string(),
        dataAvaliacao: z.date(),
        finalidade: z.enum(["Final", "Estágio"]),
        licenca: z.string().optional(),
        condicoesCenario: z.string().optional(),
        copiarItensPadrao: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { copiarItensPadrao, ...fichaData } = input;
        
        const result = await db.createFicha({
          ...fichaData,
          avaliadorId: ctx.user.id,
          avaliadorNome: ctx.user.name || "Sem nome",
          status: "rascunho",
        });

        // Obter a ficha recém-criada para pegar o ID
        const fichas = await db.getAllFichas();
        const novaFicha = fichas[fichas.length - 1];
        const fichaId = novaFicha?.id || 0;

        // Copiar itens padrão se solicitado
        if (copiarItensPadrao && fichaId > 0) {
          await db.copiarItensPadraoParaFicha(fichaId);
        }

        // Registrar no histórico
        if (fichaId > 0) {
          await db.createHistorico({
            fichaId,
            usuarioId: ctx.user.id,
            usuarioNome: ctx.user.name || "Sem nome",
            acao: "criacao",
            descricao: copiarItensPadrao 
              ? "Ficha de avaliação criada com itens padrão"
              : "Ficha de avaliação criada",
          });
        }

        return { success: true, fichaId };
      }),

    // Atualizar ficha (apenas o criador ou superiores)
    update: instrutorOuSuperiorProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(["rascunho", "finalizada", "aprovada", "reprovada"]).optional(),
        condicoesCenario: z.string().optional(),
        tempoPosicaoControle: z.number().optional(),
        tempoPosicaoAssistente: z.number().optional(),
        rendimento: z.string().optional(),
        comentarios: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        
        const ficha = await db.getFichaById(id);
        if (!ficha) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada" });
        }

        // Instrutores só podem editar suas próprias fichas
        if (ctx.user.role === "instrutor" && ficha.avaliadorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        await db.updateFicha(id, updates);

        // Registrar no histórico
        await db.createHistorico({
          fichaId: id,
          usuarioId: ctx.user.id,
          usuarioNome: ctx.user.name || "Sem nome",
          acao: "edicao",
          descricao: `Ficha atualizada: ${Object.keys(updates).join(", ")}`,
        });

        return { success: true };
      }),

    // Excluir ficha (apenas coordenadores e superiores)
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const allowedRoles = ["coordenador", "gerente", "administrador"];
        if (!allowedRoles.includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        await db.deleteFicha(input.id);
        return { success: true };
      }),

    // Salvar item de avaliação
    saveItem: instrutorOuSuperiorProcedure
      .input(z.object({
        fichaId: z.number(),
        area: z.string(),
        areaNome: z.string(),
        subitem: z.string(),
        conceito: z.enum(["O", "B", "R", "NS", "NA"]).optional(),
        observacoes: z.string().optional(),
        ordem: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        const ficha = await db.getFichaById(input.fichaId);
        if (!ficha) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada" });
        }

        // Instrutores só podem editar suas próprias fichas
        if (ctx.user.role === "instrutor" && ficha.avaliadorId !== ctx.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        await db.createItemAvaliacao(input);
        return { success: true };
      }),

    // Obter histórico de uma ficha
    getHistorico: protectedProcedure
      .input(z.object({ fichaId: z.number() }))
      .query(async ({ input, ctx }) => {
        const ficha = await db.getFichaById(input.fichaId);
        if (!ficha) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Ficha não encontrada" });
        }

        // Alunos não podem ver histórico
        if (ctx.user.role === "aluno") {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        return await db.getHistoricoByFichaId(input.fichaId);
      }),
  }),

  // ========== Relatórios ==========
  relatorios: router({
    // Listar relatórios do usuário
    list: protectedProcedure.query(async ({ ctx }) => {
      return await db.getRelatoriosByUsuario(ctx.user.id);
    }),

    // Criar relatório (apenas coordenadores e superiores)
    create: protectedProcedure
      .input(z.object({
        titulo: z.string(),
        tipo: z.string(),
        parametros: z.string().optional(),
        resultado: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const allowedRoles = ["coordenador", "gerente", "administrador"];
        if (!allowedRoles.includes(ctx.user.role)) {
          throw new TRPCError({ code: "FORBIDDEN", message: "Acesso negado" });
        }

        await db.createRelatorio({
          ...input,
          criadoPorId: ctx.user.id,
          criadoPorNome: ctx.user.name || "Sem nome",
        });

        return { success: true };
      }),
  }),

  export: exportRouter,
  itens: itensRouter,
});

export type AppRouter = typeof appRouter;
