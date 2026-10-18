-- Deduplicate technology rows by name, keeping the earliest row (by created_at, then id)
-- as the canonical record and repointing project links from the duplicates onto it.
WITH ranked AS (
	SELECT
		"id",
		"name",
		FIRST_VALUE("id") OVER (PARTITION BY "name" ORDER BY "created_at" ASC, "id" ASC) AS keeper_id,
		ROW_NUMBER() OVER (PARTITION BY "name" ORDER BY "created_at" ASC, "id" ASC) AS rn
	FROM "technology"
),
dupes AS (
	SELECT "id" AS dupe_id, keeper_id FROM ranked WHERE rn > 1
),
reassign AS (
	SELECT DISTINCT ON (pt."project_id", d.keeper_id) pt."ctid" AS cid, d.keeper_id
	FROM "project_technology" pt
	JOIN dupes d ON d.dupe_id = pt."technology_id"
	LEFT JOIN "project_technology" existing
		ON existing."project_id" = pt."project_id" AND existing."technology_id" = d.keeper_id
	WHERE existing."technology_id" IS NULL
	ORDER BY pt."project_id", d.keeper_id, pt."technology_id"
)
UPDATE "project_technology" pt
SET "technology_id" = r.keeper_id
FROM reassign r
WHERE pt."ctid" = r.cid;--> statement-breakpoint
-- Remove the duplicate technology rows; cascade clears any leftover links.
WITH ranked AS (
	SELECT
		"id",
		ROW_NUMBER() OVER (PARTITION BY "name" ORDER BY "created_at" ASC, "id" ASC) AS rn
	FROM "technology"
)
DELETE FROM "technology" t
USING ranked r
WHERE t."id" = r."id" AND r.rn > 1;--> statement-breakpoint
ALTER TABLE "clients" ADD CONSTRAINT "clients_name_unique" UNIQUE("name");--> statement-breakpoint
ALTER TABLE "technology" ADD CONSTRAINT "technology_name_unique" UNIQUE("name");
