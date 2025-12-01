import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createMockContext(role: "aluno" | "instrutor" | "coordenador" | "gerente" | "administrador"): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role,
    unidade: "Test Unit",
    orgaoAtc: "TEST-ATC",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("Users Router", () => {
  describe("users.list", () => {
    it("should allow gerente to list users", async () => {
      const ctx = createMockContext("gerente");
      const caller = appRouter.createCaller(ctx);

      // Should not throw
      await expect(caller.users.list()).resolves.toBeDefined();
    });

    it("should allow administrador to list users", async () => {
      const ctx = createMockContext("administrador");
      const caller = appRouter.createCaller(ctx);

      // Should not throw
      await expect(caller.users.list()).resolves.toBeDefined();
    });

    it("should deny aluno from listing users", async () => {
      const ctx = createMockContext("aluno");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.users.list()).rejects.toThrow("Acesso restrito a gerentes e administradores");
    });

    it("should deny instrutor from listing users", async () => {
      const ctx = createMockContext("instrutor");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.users.list()).rejects.toThrow("Acesso restrito a gerentes e administradores");
    });
  });

  describe("users.create", () => {
    it("should allow gerente to create user", async () => {
      const ctx = createMockContext("gerente");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.users.create({
        name: "New User",
        email: "newuser@example.com",
        role: "aluno",
      });

      expect(result.success).toBe(true);
      expect(result.message).toBe("Usuário criado com sucesso");
    });

    it("should validate required name field", async () => {
      const ctx = createMockContext("gerente");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          name: "",
          role: "aluno",
        })
      ).rejects.toThrow();
    });
  });
});

describe("Fichas Router", () => {
  describe("fichas.list", () => {
    it("should allow aluno to list their own fichas", async () => {
      const ctx = createMockContext("aluno");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.fichas.list()).resolves.toBeDefined();
    });

    it("should allow instrutor to list fichas", async () => {
      const ctx = createMockContext("instrutor");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.fichas.list()).resolves.toBeDefined();
    });

    it("should allow coordenador to list all fichas", async () => {
      const ctx = createMockContext("coordenador");
      const caller = appRouter.createCaller(ctx);

      await expect(caller.fichas.list()).resolves.toBeDefined();
    });
  });

  describe("fichas.create", () => {
    it("should allow instrutor to create ficha", async () => {
      const ctx = createMockContext("instrutor");
      const caller = appRouter.createCaller(ctx);

      // Criar um usuário avaliado primeiro
      const adminCtx = createMockContext("administrador");
      const adminCaller = appRouter.createCaller(adminCtx);
      await adminCaller.users.create({
        name: "Student Name",
        email: "student@example.com",
        role: "aluno",
      });

      // Obter o ID do usuário recém-criado
      const users = await adminCaller.users.list();
      const student = users.find(u => u.email === "student@example.com");

      if (!student) {
        throw new Error("Student user not found");
      }

      const result = await caller.fichas.create({
        avaliadoId: student.id,
        avaliadoNome: "Student Name",
        orgaoAtc: "ACC-BS",
        localAvaliacao: "Sala de Controle",
        dataAvaliacao: new Date(),
        finalidade: "Estágio",
      });

      expect(result.success).toBe(true);
      expect(result.fichaId).toBeGreaterThan(0);
    });

    it("should deny aluno from creating ficha", async () => {
      const ctx = createMockContext("aluno");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.fichas.create({
          avaliadoId: 2,
          avaliadoNome: "Student Name",
          orgaoAtc: "ACC-BS",
          localAvaliacao: "Sala de Controle",
          dataAvaliacao: new Date(),
          finalidade: "Estágio",
        })
      ).rejects.toThrow("Acesso restrito a instrutores e superiores");
    });
  });
});

describe("Auth Router", () => {
  describe("auth.me", () => {
    it("should return user info when authenticated", async () => {
      const ctx = createMockContext("aluno");
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeDefined();
      expect(result?.name).toBe("Test User");
      expect(result?.role).toBe("aluno");
    });

    it("should return undefined when not authenticated", async () => {
      const ctx: TrpcContext = {
        user: undefined,
        req: {
          protocol: "https",
          headers: {},
        } as TrpcContext["req"],
        res: {} as TrpcContext["res"],
      };
      const caller = appRouter.createCaller(ctx);

      const result = await caller.auth.me();

      expect(result).toBeUndefined();
    });
  });
});
