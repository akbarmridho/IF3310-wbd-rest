DO $$ BEGIN
 CREATE TYPE "AnimeStatus" AS ENUM('upcoming', 'airing', 'aired');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anime" (
	"id" serial NOT NULL,
	"title" varchar(255) NOT NULL,
	"global_identifier" varchar(255) NOT NULL,
	"status" "AnimeStatus",
	"totalEpisodes" smallint,
	"airedEpisodes" smallint,
	"broadcast_information" text,
	CONSTRAINT "global_identifier_idx" UNIQUE("global_identifier")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "episodes" (
	"id" serial NOT NULL,
	"anime_id" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"episodeNumber" smallint NOT NULL,
	"filename" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial NOT NULL,
	"username" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	CONSTRAINT "username_unique_idx" UNIQUE("username")
);
