import {
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  smallint,
  text,
  timestamp,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    username: varchar('username', {length: 255}).notNull(),
    name: varchar('name', {length: 255}).notNull(),
    password: varchar('password', {length: 255}).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
  },
  users => ({
    usernameUniqueIdx: unique('username_unique_idx').on(users.username),
  })
);

export const animeStatusEnum = pgEnum('AnimeStatus', [
  'upcoming',
  'airing',
  'aired',
]);

export const anime = pgTable('anime', {
  id: varchar('id', {length: 255}).primaryKey(),
  title: varchar('title', {length: 255}).notNull(),
  status: animeStatusEnum('status').notNull(),
  totalEpisodes: smallint('totalEpisodes'),
  airedEpisodes: smallint('airedEpisodes'),
  broadcastInformation: text('broadcast_information'),
  createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
});

export const animeRelations = relations(anime, ({many}) => ({
  episodes: many(episodes),
}));

export const episodes = pgTable(
  'episodes',
  {
    animeId: varchar('anime_id', {length: 255})
      .notNull()
      .references(() => anime.id),
    title: varchar('title', {length: 255}).notNull(),
    episodeNumber: smallint('episodeNumber').notNull(),
    filename: varchar('filename', {length: 255}).notNull(),
    createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
    totalViewers: integer('total_viewers').notNull().default(0),
  },
  episodes => ({
    pk: primaryKey({columns: [episodes.animeId, episodes.episodeNumber]}),
  })
);

export const episodesRelations = relations(episodes, ({one}) => ({
  anime: one(anime, {
    fields: [episodes.animeId],
    references: [anime.id],
  }),
}));

export const episodeViewer = pgTable('episode_viewers', {
  id: serial('id').primaryKey(),
  animeId: varchar('anime_id', {length: 255})
    .notNull()
    .references(() => anime.id),
  episodeNumber: smallint('episodeNumber').notNull(),
  userIdentifier: varchar('user_identifier', {length: 255}).notNull(),
  createdAt: timestamp('created_at', {withTimezone: true}).defaultNow(),
});

export type Episode = typeof episodes.$inferSelect;
