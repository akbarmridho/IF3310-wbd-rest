ALTER TABLE "episodes" DROP COLUMN IF EXISTS "id";--> statement-breakpoint
ALTER TABLE "episodes" ADD CONSTRAINT "episodes_anime_id_episodeNumber" PRIMARY KEY("anime_id","episodeNumber");