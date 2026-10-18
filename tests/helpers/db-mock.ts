import { mock } from "bun:test";

// Single shared Drizzle chain mock. Add a method here once instead of
// copying createChain into every service.test.ts (the missing leftJoin in
// projects/service.test.ts caused 10 failures).
// Supports all chain methods used in src/modules/*/service.ts.
export function createChain(result: unknown[] = []) {
  const makeChain = (r: unknown[]) => {
    const c: Record<string, unknown> = {};
    c.select = () => makeChain(r);
    c.from = () => makeChain(r);
    c.where = () => makeChain(r);
    c.limit = () => makeChain(r);
    c.offset = () => makeChain(r);
    c.orderBy = () => makeChain(r);
    c.groupBy = () => makeChain(r);
    c.innerJoin = () => makeChain(r);
    c.leftJoin = () => makeChain(r);
    c.rightJoin = () => makeChain(r);
    c.fullJoin = () => makeChain(r);
    c.set = () => makeChain(r);
    c.values = () => makeChain(r);
    c.returning = () => makeChain(r);
    c.onConflictDoNothing = () => makeChain(r);
    c.onConflictDoUpdate = () => makeChain(r);
    c.then = (resolve: (v: unknown) => void) => {
      resolve(r);
    };
    return c;
  };
  return makeChain(result);
}

export function createMockDb() {
  return {
    select: mock(() => createChain([])),
    insert: mock(() => createChain([])),
    update: mock(() => createChain([])),
    delete: mock(() => createChain([])),
  };
}

export type MockDb = ReturnType<typeof createMockDb>;

export function clearMockDb(mockDb: MockDb) {
  mockDb.select.mockClear();
  mockDb.insert.mockClear();
  mockDb.update.mockClear();
  mockDb.delete.mockClear();
}

// Shared singleton so bare `bun test` (no --isolate, shared module registry)
// doesn't break: every service.test.ts mocks the same "../../../src/db/index.js"
// path, and without isolation the last mock.module registration wins. Returning
// the same object from every factory keeps all services wired to one mockDb.
export function getSharedMockDb(): MockDb {
  const g = globalThis as unknown as Record<string, MockDb | undefined>;
  if (!g.__sharedMockDb) {
    g.__sharedMockDb = createMockDb();
  }
  return g.__sharedMockDb as MockDb;
}
