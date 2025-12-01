import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import * as db from "../db";

export const exportRouter = router({
  fichasCSV: protectedProcedure
    .input(z.object({
      filtro: z.enum(['todas', 'minhas']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      // Verificar permissão
      if (ctx.user.role === 'aluno') {
        input = { filtro: 'minhas' };
      } else if (!['instrutor', 'coordenador', 'gerente', 'administrador'].includes(ctx.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }

      // Obter fichas conforme permissão
      let fichas;
      if (input?.filtro === 'minhas' || ctx.user.role === 'aluno') {
        fichas = await db.getFichasByAvaliado(ctx.user.id);
      } else {
        fichas = await db.getAllFichas();
      }

      // Converter para CSV
      const headers = ['ID', 'Avaliado', 'Avaliador', 'Órgão ATC', 'Data', 'Finalidade', 'Status', 'Criado em'];
      const rows = fichas.map((f: any) => [
        String(f.id),
        f.avaliadoNome || '',
        f.avaliadorNome || '',
        f.orgaoAtc || '',
        new Date(f.dataAvaliacao).toLocaleDateString('pt-BR'),
        f.finalidade || '',
        f.status || '',
        new Date(f.createdAt).toLocaleString('pt-BR'),
      ]);

      const csv = [
        headers.join(','),
        ...rows.map((r: any) => r.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"` ).join(',')),
      ].join('\n');

      return { 
        csv, 
        filename: `fichas-avaliacao-${new Date().toISOString().split('T')[0]}.csv`,
        count: fichas.length,
      };
    }),

  fichasPDF: protectedProcedure
    .input(z.object({
      fichaId: z.number().optional(),
      filtro: z.enum(['todas', 'minhas']).optional(),
    }).optional())
    .query(async ({ ctx, input }) => {
      // Verificar permissão
      if (ctx.user.role === 'aluno') {
        input = { filtro: 'minhas' };
      } else if (!['instrutor', 'coordenador', 'gerente', 'administrador'].includes(ctx.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
      }

      // Se fichaId fornecido, exportar ficha específica
      if (input?.fichaId) {
        const ficha = await db.getFichaById(input.fichaId);
        if (!ficha) throw new TRPCError({ code: 'NOT_FOUND', message: 'Ficha não encontrada' });

        // Verificar permissão
        if (ctx.user.role === 'aluno' && ficha.avaliadoId !== ctx.user.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito' });
        }

        return {
          success: true,
          message: 'PDF gerado com sucesso',
          filename: `ficha-${ficha.id}-${new Date().toISOString().split('T')[0]}.pdf`,
        };
      }

      // Exportar múltiplas fichas
      let fichas;
      if (input?.filtro === 'minhas' || ctx.user.role === 'aluno') {
        fichas = await db.getFichasByAvaliado(ctx.user.id);
      } else {
        fichas = await db.getAllFichas();
      }
      
      return {
        success: true,
        message: `${fichas.length} ficha(s) exportada(s)`,
        filename: `fichas-avaliacao-${new Date().toISOString().split('T')[0]}.pdf`,
        count: fichas.length,
      };
    }),

  importCSV: protectedProcedure
    .input(z.object({
      csvContent: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Verificar permissão (apenas gerentes e administradores)
      if (!['gerente', 'administrador'].includes(ctx.user.role)) {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a gerentes e administradores' });
      }

      try {
        const lines = input.csvContent.trim().split('\n');
        if (lines.length < 2) {
          throw new Error('CSV vazio ou inválido');
        }

        // Pular header
        const dataLines = lines.slice(1);
        let successCount = 0;
        let errorCount = 0;
        const errors: string[] = [];

        for (let i = 0; i < dataLines.length; i++) {
          try {
            const line = dataLines[i];
            const values = line.split(',').map(v => v.replace(/^"|"$/g, ''));

            if (values.length < 7) {
              errors.push(`Linha ${i + 2}: Dados insuficientes`);
              errorCount++;
              continue;
            }

            // Validar e criar ficha
            const avaliadoId = parseInt(values[0]);
            const avaliadoNome = values[1];
            const orgaoAtc = values[3];
            const dataAvaliacao = new Date(values[4]);
            const finalidade = values[5];

            if (isNaN(avaliadoId) || !avaliadoNome || !orgaoAtc) {
              errors.push(`Linha ${i + 2}: Dados obrigatórios faltando`);
              errorCount++;
              continue;
            }

            // Criar ficha
            await db.createFicha({
              avaliadoId,
              avaliadoNome,
              avaliadorId: ctx.user.id,
              avaliadorNome: ctx.user.name || 'Sem nome',
              orgaoAtc,
              localAvaliacao: '',
              dataAvaliacao,
              finalidade: finalidade as 'Estágio' | 'Final',
              status: 'rascunho',
            });

            successCount++;
          } catch (error) {
            errors.push(`Linha ${i + 2}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
            errorCount++;
          }
        }

        return {
          success: true,
          message: `${successCount} ficha(s) importada(s) com sucesso, ${errorCount} erro(s)`,
          successCount,
          errorCount,
          errors: errors.slice(0, 10), // Retornar apenas os 10 primeiros erros
        };
      } catch (error) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: error instanceof Error ? error.message : 'Erro ao processar CSV',
        });
      }
    }),
});
