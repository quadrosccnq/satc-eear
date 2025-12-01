import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, fichasAvaliacao, itensAvaliacao, historicoAlteracoes, relatorios, itensAvaliacaoPadrao } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "unidade", "orgaoAtc"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'administrador';
      updateSet.role = 'administrador';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateLastSignedIn(openId: string, signedInAt: Date): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update lastSignedIn: database not available");
    return;
  }

  try {
    await db.update(users)
      .set({ lastSignedIn: signedInAt })
      .where(eq(users.openId, openId));
  } catch (error) {
    console.error("[Database] Failed to update lastSignedIn:", error);
  }
}

// ========== Gerenciamento de Usuários ==========

export async function getAllUsers() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(users);
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(users).values(user);
  return result;
}

export async function updateUser(id: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(users).set(updates).where(eq(users.id, id));
  return await getUserById(id);
}

export async function deleteUser(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(users).where(eq(users.id, id));
}

// ========== Fichas de Avaliação ==========

export async function getAllFichas() {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(fichasAvaliacao);
}

export async function getFichaById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  
  const result = await db.select().from(fichasAvaliacao).where(eq(fichasAvaliacao.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getFichasByAvaliado(avaliadoId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(fichasAvaliacao).where(eq(fichasAvaliacao.avaliadoId, avaliadoId));
}

export async function getFichasByAvaliador(avaliadorId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(fichasAvaliacao).where(eq(fichasAvaliacao.avaliadorId, avaliadorId));
}

export async function createFicha(ficha: typeof fichasAvaliacao.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(fichasAvaliacao).values(ficha);
  return result;
}

export async function updateFicha(id: number, updates: Partial<typeof fichasAvaliacao.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(fichasAvaliacao).set(updates).where(eq(fichasAvaliacao.id, id));
  return await getFichaById(id);
}

export async function deleteFicha(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(fichasAvaliacao).where(eq(fichasAvaliacao.id, id));
}

// ========== Itens de Avaliação ==========

export async function getItensByFichaId(fichaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(itensAvaliacao).where(eq(itensAvaliacao.fichaId, fichaId));
}

export async function createItemAvaliacao(item: typeof itensAvaliacao.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(itensAvaliacao).values(item);
  return result;
}

export async function updateItemAvaliacao(id: number, updates: Partial<typeof itensAvaliacao.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(itensAvaliacao).set(updates).where(eq(itensAvaliacao.id, id));
}

export async function deleteItemAvaliacao(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.delete(itensAvaliacao).where(eq(itensAvaliacao.id, id));
}

export async function copiarItensPadraoParaFicha(fichaId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Buscar todos os itens padrão ativos
  const itensPadrao = await db.select().from(itensAvaliacaoPadrao).where(eq(itensAvaliacaoPadrao.ativo, 1));
  
  // Mapear áreas de avaliação (A-K)
  const areaMap: Record<string, string> = {
    "LEGISLAÇÃO DE TRÁFEGO AÉREO": "A",
    "DOMÍNIO ESPACIAL E USO DOS MEIOS": "B",
    "ORGANIZAÇÃO": "C",
    "COORDENAÇÃO": "D",
    "COMUNICAÇÃO ORAL": "E",
    "INFORMAÇÕES ATS": "F",
    "PLANEJAMENTO": "G",
    "CONTROLE DO TRÁFEGO": "H",
    "EMERGÊNCIA E DEGRADAÇÃO": "I",
    "VIGILÂNCIA ATS": "J",
    "AVALIAÇÃO COMPORTAMENTAL": "K",
  };
  
  // Criar itens de avaliação a partir dos itens padrão
  const itensParaInserir = itensPadrao.map((itemPadrao, index) => {
    const area = areaMap[itemPadrao.anexoC.toUpperCase()] || "A";
    return {
      fichaId,
      area,
      areaNome: itemPadrao.anexoC,
      subitem: itemPadrao.oi,
      conceito: null,
      observacoes: itemPadrao.referencia || null,
      ordem: index + 1,
    };
  });
  
  if (itensParaInserir.length > 0) {
    await db.insert(itensAvaliacao).values(itensParaInserir);
  }
  
  return itensParaInserir.length;
}

// ========== Histórico de Alterações ==========

export async function createHistorico(historico: typeof historicoAlteracoes.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(historicoAlteracoes).values(historico);
}

export async function getHistoricoByFichaId(fichaId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(historicoAlteracoes).where(eq(historicoAlteracoes.fichaId, fichaId));
}

// ========== Relatórios ==========

export async function createRelatorio(relatorio: typeof relatorios.$inferInsert) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(relatorios).values(relatorio);
  return result;
}

export async function getRelatoriosByUsuario(usuarioId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return await db.select().from(relatorios).where(eq(relatorios.criadoPorId, usuarioId));
}
