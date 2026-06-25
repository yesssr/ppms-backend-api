import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

const connectionString = process.env.DATABASE_URL;

export const db = connectionString
  ? drizzle({
      connection: {
        connectionString: connectionString,
      },
    })
  : new Error("DATABASE_URL is not defined in the environment variables.");
