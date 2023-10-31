CREATE TABLE IF NOT EXISTS "episode_viewers" (
	"id" serial PRIMARY KEY NOT NULL,
	"anime_id" integer NOT NULL,
	"episodeNumber" smallint NOT NULL,
	"user_identifier" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "anime" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "users" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "episodes" ADD COLUMN "total_viewers" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episodes" ADD CONSTRAINT "episodes_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "episode_viewers" ADD CONSTRAINT "episode_viewers_anime_id_anime_id_fk" FOREIGN KEY ("anime_id") REFERENCES "anime"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
