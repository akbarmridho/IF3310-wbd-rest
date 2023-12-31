import {Request, Response} from 'express';
import {db} from '../database/db';
import {anime, episodes} from '../database/schema';
import {
  sendBadRequest,
  sendCreated,
  sendNotFound,
  sendOkWithPayload,
} from '../utils/sendResponse';
import {CreateAnimeRequest, UpdateAnimeRequest} from '../types/anime';
import {and, asc, eq, sql} from 'drizzle-orm';

export async function getAnimeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const animeId = request.params.id;

  const result = await db.query.anime.findFirst({
    where: eq(anime.id, animeId),
  });

  if (!result) {
    sendNotFound(response);
    return;
  }

  sendOkWithPayload(result, response);
}

export async function getAllAnimeHandler(request: Request, response: Response) {
  const result = await db.query.anime.findMany();

  if (!result) {
    sendNotFound(response);
    return;
  }

  sendOkWithPayload(result, response);
}

export async function createAnimeHandler(request: Request, response: Response) {
  const data = CreateAnimeRequest.parse(request.body);

  // check existing anime id
  const existingAnime = await db.query.anime.findFirst({
    where: eq(anime.id, data.id),
  });

  if (existingAnime) {
    sendBadRequest('Anime id taken, anime already exists', response);
    return;
  }

  // insert
  const result = await db.insert(anime).values(data).returning();

  sendCreated(result[0], response);
}

export async function updateAnimeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const data = UpdateAnimeRequest.parse(request.body);
  const animeId = request.params.id;

  // update
  const result = await db.update(anime).set(data).where(eq(anime.id, animeId));

  sendOkWithPayload(result[0], response);
}

export async function deleteAnimeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const animeId = request.params.id;

  // check remaining episodes
  const episodeCount = await db
    .select({
      episodeCount: sql<number>`count(
      ${episodes.episodeNumber}
      )`,
    })
    .from(episodes)
    .where(eq(episodes.animeId, animeId))
    .limit(1);

  if (Number(episodeCount[0].episodeCount) !== 0) {
    sendBadRequest('Please delete remaining episodes first', response);
    return;
  }

  // delete
  const deletedRow = await db
    .delete(anime)
    .where(eq(anime.id, animeId))
    .returning();

  sendOkWithPayload(deletedRow[0], response);
}
