import {
  integer,
  pgEnum,
  pgTable,
  serial,
  smallint,
  text,
  unique,
  varchar,
} from 'drizzle-orm/pg-core';
import {relations} from 'drizzle-orm';

export const users = pgTable(
  'users',
  {
    id: serial('id'),
    username: varchar('username', {length: 255}).notNull(),
    name: varchar('name', {length: 255}).notNull(),
    password: varchar('password', {length: 255}).notNull(),
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

export const anime = pgTable(
  'anime',
  {
    id: serial('id'),
    title: varchar('title', {length: 255}).notNull(),
    globalIdentifier: varchar('global_identifier', {length: 255}).notNull(),
    status: animeStatusEnum('status'),
    totalEpisodes: smallint('totalEpisodes'),
    airedEpisodes: smallint('airedEpisodes'),
    broadcastInformation: text('broadcast_information'),
  },
  anime => ({
    globalIdentifierIdx: unique('global_identifier_idx').on(
      anime.globalIdentifier
    ),
  })
);

const animeRelations = relations(anime, ({many}) => ({
  episodes: many(episodes),
}));

export const episodes = pgTable('episodes', {
  id: serial('id'),
  animeId: integer('anime_id').notNull(),
  title: varchar('title', {length: 255}).notNull(),
  episodeNumber: smallint('episodeNumber').notNull(),
  filename: varchar('filename', {length: 255}).notNull(),
});

export const episodesRelations = relations(episodes, ({one}) => ({
  anime: one(anime, {
    fields: [episodes.animeId],
    references: [anime.id],
  }),
}));
