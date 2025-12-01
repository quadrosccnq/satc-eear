import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { itensAvaliacaoPadrao } from "../../drizzle/schema";
import { eq, like } from "drizzle-orm";

export const itensRouter = router({
  /**
   * Listar todos os itens de avaliação padrão
   */
  list: protectedProcedure
    .input(
      z.object({
        anexoC: z.string().optional(),
        ativo: z.boolean().optional(),
      }).optional()
    )
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      let baseQuery = db.select().from(itensAvaliacaoPadrao);
      let query: any = baseQuery;

      if (input?.anexoC) {
        query = baseQuery.where(like(itensAvaliacaoPadrao.anexoC, `%${input.anexoC}%`));
      }

      if (input?.ativo !== undefined) {
        if (input?.anexoC) {
          query = query.where(eq(itensAvaliacaoPadrao.ativo, input.ativo ? 1 : 0));
        } else {
          query = baseQuery.where(eq(itensAvaliacaoPadrao.ativo, input.ativo ? 1 : 0));
        }
      }

      const items = await query;
      return items.map((item: any) => ({
        ...item,
        distribuicao: item.distribuicao ? JSON.parse(item.distribuicao) : [],
        ativo: item.ativo === 1,
      }));
    }),

  /**
   * Obter um item específico
   */
  getById: protectedProcedure
    .input(z.number())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const item = await db.select().from(itensAvaliacaoPadrao).where(eq(itensAvaliacaoPadrao.id, input)).limit(1);
      
      if (item.length === 0) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Item not found" });
      }

      return {
        ...item[0],
        distribuicao: item[0].distribuicao ? JSON.parse(item[0].distribuicao) : [],
        ativo: item[0].ativo === 1,
      };
    }),

  /**
   * Criar novo item de avaliação
   */
  create: protectedProcedure
    .input(
      z.object({
        anexoC: z.string().min(1),
        oi: z.string().min(1),
        referencia: z.string().optional(),
        distribuicao: z.array(z.number()).optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      // Apenas gerente e administrador podem criar itens
      if (!["gerente", "administrador"].includes(ctx.user?.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.insert(itensAvaliacaoPadrao).values({
        anexoC: input.anexoC,
        oi: input.oi,
        referencia: input.referencia,
        distribuicao: input.distribuicao ? JSON.stringify(input.distribuicao) : JSON.stringify([]),
        ativo: 1,
      });

      return { success: true };
    }),

  /**
   * Atualizar item de avaliação
   */
  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        anexoC: z.string().optional(),
        oi: z.string().optional(),
        referencia: z.string().optional(),
        distribuicao: z.array(z.number()).optional(),
        ativo: z.boolean().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!["gerente", "administrador"].includes(ctx.user?.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const updateData: any = {};
      if (input.anexoC) updateData.anexoC = input.anexoC;
      if (input.oi) updateData.oi = input.oi;
      if (input.referencia !== undefined) updateData.referencia = input.referencia;
      if (input.distribuicao) updateData.distribuicao = JSON.stringify(input.distribuicao);
      if (input.ativo !== undefined) updateData.ativo = input.ativo ? 1 : 0;

      await db.update(itensAvaliacaoPadrao).set(updateData).where(eq(itensAvaliacaoPadrao.id, input.id));

      return { success: true };
    }),

  /**
   * Deletar item de avaliação
   */
  delete: protectedProcedure
    .input(z.number())
    .mutation(async ({ input, ctx }) => {
      if (!["gerente", "administrador"].includes(ctx.user?.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      await db.delete(itensAvaliacaoPadrao).where(eq(itensAvaliacaoPadrao.id, input));

      return { success: true };
    }),

  /**
   * Importar itens em lote
   */
  importBatch: protectedProcedure
    .input(
      z.object({
        items: z.array(
          z.object({
            anexoC: z.string(),
            oi: z.string(),
            referencia: z.string().optional(),
            distribuicao: z.array(z.number()).optional(),
          })
        ),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!["gerente", "administrador"].includes(ctx.user?.role || "")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Unauthorized" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

      const insertData = input.items.map(item => ({
        anexoC: item.anexoC,
        oi: item.oi,
        referencia: item.referencia,
        distribuicao: item.distribuicao ? JSON.stringify(item.distribuicao) : JSON.stringify([]),
        ativo: 1,
      }));

      await db.insert(itensAvaliacaoPadrao).values(insertData);

      return { success: true, count: insertData.length };
    }),

  /**
   * Obter categorias únicas (Anexo C)
   */
  getCategorias: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Database not available" });

    const items = await db.select({ anexoC: itensAvaliacaoPadrao.anexoC }).from(itensAvaliacaoPadrao).where(eq(itensAvaliacaoPadrao.ativo, 1));
    
    const categoriasSet = new Set(items.map(item => item.anexoC));
    const categorias = Array.from(categoriasSet);
    return categorias.sort();
  }),
});
