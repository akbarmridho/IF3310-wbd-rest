DO $$ BEGIN
 CREATE TYPE "AnimeStatus" AS ENUM('upcoming', 'airing', 'aired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anime" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"status" "AnimeStatus",
	"totalEpisodes" smallint,
	"airedEpisodes" smallint,
	"broadcast_information" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "episode_viewers" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" varchar(255) NOT NULL,
	"episodeNumber" smallint NOT NULL,
	"user_identifier" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "episodes" (
	"anime_id" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"episodeNumber" smallint NOT NULL,
	"filename" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"total_viewers" integer DEFAULT 0 NOT NULL,
	CONSTRAINT episodes_anime_id_episodeNumber PRIMARY KEY("anime_id","episodeNumber")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "username_unique_idx" UNIQUE("username")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episode_viewers" ADD CONSTRAINT "episode_viewers_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episodes" ADD CONSTRAINT "episodes_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
