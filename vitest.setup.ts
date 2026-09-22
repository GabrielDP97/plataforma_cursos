import { vi } from "vitest";

// Provide a mock database URL so db.ts proxy doesn't throw at import time
process.env.NEON_DATABASE_URL =
  "postgresql://mock:mock@localhost:5432/mock?sslmode=require";

// Mock @neondatabase/serverless so neon() returns a callable mock SQL function
vi.mock("@neondatabase/serverless", () => {
  const mockSql = Object.assign(
    (...args: unknown[]) => Promise.resolve([{ result: 1 }]),
    {
      query: vi.fn().mockResolvedValue({ rows: [] }),
    }
  );
  return {
    neon: vi.fn(() => mockSql),
  };
});

// Mock drizzle-orm/neon-http so drizzle() returns a chainable mock db
vi.mock("drizzle-orm/neon-http", () => {
  const createChainableMock = (): Record<string, unknown> => {
    const mock: Record<string, unknown> = {};

    // Terminal operations
    mock.returning = vi.fn().mockResolvedValue([]);
    mock.limit = vi.fn().mockReturnValue(mock);
    mock.offset = vi.fn().mockReturnValue(mock);
    mock.execute = vi.fn().mockResolvedValue([]);
    mock.findMany = vi.fn().mockResolvedValue([]);
    mock.findFirst = vi.fn().mockResolvedValue(undefined);
    mock.create = vi.fn().mockResolvedValue({});
    mock.updateMany = vi.fn().mockResolvedValue([]);
    mock.deleteMany = vi.fn().mockResolvedValue([]);
    mock.$with = vi.fn().mockReturnValue(mock);

    // Query builder chain
    mock.select = vi.fn().mockReturnValue(mock);
    mock.from = vi.fn().mockReturnValue(mock);
    mock.where = vi.fn().mockReturnValue(mock);
    mock.insert = vi.fn().mockReturnValue(mock);
    mock.update = vi.fn().mockReturnValue(mock);
    mock.delete = vi.fn().mockReturnValue(mock);
    mock.values = vi.fn().mockReturnValue(mock);
    mock.set = vi.fn().mockReturnValue(mock);
    mock.orderBy = vi.fn().mockReturnValue(mock);
    mock.onConflictDoNothing = vi.fn().mockReturnValue(mock);
    mock.onConflictDoUpdate = vi.fn().mockReturnValue(mock);
    mock.leftJoin = vi.fn().mockReturnValue(mock);
    mock.innerJoin = vi.fn().mockReturnValue(mock);
    mock.fullJoin = vi.fn().mockReturnValue(mock);
    mock.groupBy = vi.fn().mockReturnValue(mock);
    mock.having = vi.fn().mockReturnValue(mock);
    mock.transaction = vi.fn().mockImplementation((cb: Function) => cb(mock));

    return mock;
  };

  const mockDb = createChainableMock();

  return {
    drizzle: vi.fn(() => mockDb),
  };
});

// Mock drizzle-orm for sql template tag used in health endpoint
vi.mock("drizzle-orm", async (importOriginal) => {
  const original = await importOriginal<typeof import("drizzle-orm")>();
  return {
    ...original,
    sql: Object.assign(
      (strings: TemplateStringsArray, ...values: unknown[]) => ({
        execute: vi.fn().mockResolvedValue([{ ok: 1 }]),
      }),
      { raw: vi.fn(() => ({})) }
    ),
  };
});
