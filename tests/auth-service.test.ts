import { describe, expect, it, mock } from "bun:test";

// The service imports "../../db/index.js" which resolves to an absolute path.
// Use the resolved path for mock.module so it intercepts the real import.
const DB_MODULE = "/home/hanep/Documents/Programming/Projects/ppms-backend-api/src/db/index.js";

mock.module(DB_MODULE, () => ({
  db: {
    query: {
      user: {
        findFirst: mock(),
      },
    },
  },
}));

const { getUserByEmail, userExists } = await import(
  "../src/modules/auth/service.js"
);

describe("Auth Service", () => {
  describe("getUserByEmail", () => {
    it("returns the user when found", async () => {
      const fakeUser = { id: "u1", name: "Alice", email: "a@b.com" };
      const findFirst = mock().mockResolvedValue(fakeUser);

      const mod = await import(DB_MODULE);
      (mod.db as any).query.user.findFirst = findFirst;

      const result = await getUserByEmail("a@b.com");
      expect(result).toEqual(fakeUser);
      expect(findFirst).toHaveBeenCalledTimes(1);
    });

    it("returns undefined when no user matches", async () => {
      const findFirst = mock().mockResolvedValue(undefined);
      const mod = await import(DB_MODULE);
      (mod.db as any).query.user.findFirst = findFirst;

      const result = await getUserByEmail("nobody@x.com");
      expect(result).toBeUndefined();
    });
  });

  describe("userExists", () => {
    it("returns true when user is found", async () => {
      const findFirst = mock().mockResolvedValue({
        id: "u1", name: "B", email: "b@c.com",
      });
      const mod = await import(DB_MODULE);
      (mod.db as any).query.user.findFirst = findFirst;

      const exists = await userExists("b@c.com");
      expect(exists).toBe(true);
    });

    it("returns false when user is not found", async () => {
      const findFirst = mock().mockResolvedValue(undefined);
      const mod = await import(DB_MODULE);
      (mod.db as any).query.user.findFirst = findFirst;

      const exists = await userExists("nobody@x.com");
      expect(exists).toBe(false);
    });
  });
});
