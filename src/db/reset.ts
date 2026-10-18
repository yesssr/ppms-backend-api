import { sql } from "drizzle-orm";
import { db } from "./index.js";
import { seed } from "./seed.js";

// Wipes every table in the public schema (data only, structure kept) and then
// re-runs the seed. Destructive: all existing rows are permanently removed.
const wipe = async () => {
  const result = await db.execute(sql`
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'public'
  `);
  const rows = result.rows ?? (result as unknown as { tablename: string }[]);
  const tables = rows.map((r: { tablename: string }) => r.tablename);

  if (tables.length === 0) {
    console.log("[reset] no tables found");
    return;
  }

  const list = tables.map((t) => `"${t}"`).join(", ");
  await db.execute(sql.raw(`TRUNCATE TABLE ${list} RESTART IDENTITY CASCADE`));
  console.log(`[reset] truncated ${tables.length} tables: ${tables.join(", ")}`);
};

const reset = async () => {
  await wipe();
  await seed();
  console.log("[reset] done");
};

if (import.meta.main) {
  reset()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[reset] failed", err);
      process.exit(1);
    });
}
