interface AuthUser {
  id: string;
  role: string;
  email: string;
  name: string;
}

declare module "elysia" {
  interface ContextSet {
    user?: AuthUser;
  }
}

export type { AuthUser };