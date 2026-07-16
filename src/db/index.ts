import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config/conf.js";

const connectionString = config.database.url;

export const db = drizzle({
  connection: {
    connectionString: connectionString,
  },
});
