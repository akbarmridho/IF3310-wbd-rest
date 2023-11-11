import {Request, Response} from 'express';
import {CreateEpisodeRequest, UpdateEpisodeRequest} from '../types/episode';
import {db} from '../database/db';
import {and, asc, eq, sql} from 'drizzle-orm';
import {anime, episodes} from '../database/schema';
import {
  sendBadRequest,
  sendCreated,
  sendOkWithPayload,
} from '../utils/sendResponse';
import {deleteEpisodeFile} from '../utils/file';
import {episodeService} from '../services/EpisodeService';

async function getLargestEpisodeNumber(
  animeId: string
): Promise<number | null> {
  const maxNumber = await db
    .select({
      episodeNumber: sql<number>`max(
      ${episodes.episodeNumber}
      )`,
    })
    .from(episodes)
    .where(and(eq(episodes.animeId, animeId)))
    .limit(1);

  if (maxNumber.length === 0) {
    return null;
  }

  return maxNumber[0].episodeNumber;
}

async function refreshAiredEpisodes(animeId: string) {
  // update aired episodes
  const largestEpisodeNumber = await getLargestEpisodeNumber(animeId);

  await db
    .update(anime)
    .set({
      airedEpisodes: largestEpisodeNumber,
    })
    .where(eq(anime.id, animeId));
}

export async function createEpisodeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const data = CreateEpisodeRequest.parse(request.body);
  const animeId = request.params.id;

  // check for duplicate episode
  const episode = await db.query.episodes.findFirst({
    where: and(
      eq(episodes.animeId, animeId),
      eq(episodes.episodeNumber, data.episodeNumber)
    ),
  });

  // update aired episodes
  await refreshAiredEpisodes(animeId);

  if (episode) {
    sendBadRequest('Episode with given number is already exist', response);
    return;
  }

  const result = await db.insert(episodes).values(data).returning();

  sendCreated(result[0], response);
}

export async function updateEpisodeHandler(
  request: Request<{id: string; episode_number: string}>,
  response: Response
) {
  const data = UpdateEpisodeRequest.parse(request.body);
  const animeId = request.params.id;
  const episodeNumber = Number(request.params.episode_number);

  // check for episode existence
  const oldEpisode = await db.query.episodes.findFirst({
    where: and(
      eq(episodes.animeId, animeId),
      eq(episodes.episodeNumber, episodeNumber)
    ),
  });

  if (!oldEpisode) {
    sendBadRequest('Episode is not exist', response);
    return;
  }

  if (data.episodeNumber && episodeNumber !== data.episodeNumber) {
    // check for new episode
    const newEpisode = await db.query.episodes.findFirst({
      where: and(
        eq(episodes.animeId, animeId),
        eq(episodes.episodeNumber, data.episodeNumber)
      ),
    });

    if (newEpisode) {
      sendBadRequest(
        'Episode with given episode number is already exist',
        response
      );
      return;
    }
  }

  // remove cache
  episodeService.removeCachedEpisode(animeId, episodeNumber);

  const result = await db
    .update(episodes)
    .set(data)
    .where(
      and(
        eq(episodes.animeId, animeId),
        eq(episodes.episodeNumber, episodeNumber)
      )
    )
    .returning();

  if (!data.filename && oldEpisode.filename !== data.filename) {
    await deleteEpisodeFile(oldEpisode.filename);
  }

  // update aired episodes
  await refreshAiredEpisodes(animeId);

  sendOkWithPayload(result[0], response);
}

export async function getAllEpisodeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const animeId = request.params.id;

  const result = await db.query.episodes.findMany({
    where: eq(episodes.animeId, animeId),
    orderBy: asc(episodes.episodeNumber),
  });

  sendOkWithPayload(result, response);
}

export async function getEpisodeHandler(
  request: Request<{id: string; episode_number: string}>,
  response: Response
) {
  const animeId = request.params.id;
  const episodeNumber = Number(request.params.episode_number);

  const result = await db.query.episodes.findFirst({
    where: and(
      eq(episodes.animeId, animeId),
      eq(episodes.episodeNumber, episodeNumber)
    ),
  });

  sendOkWithPayload(result, response);
}

export async function deleteEpisodeHandler(
  request: Request<{id: string; episode_number: string}>,
  response: Response
) {
  const animeId = request.params.id;
  const episodeNumber = Number(request.params.episode_number);

  const old = await db
    .delete(episodes)
    .where(
      and(
        eq(episodes.animeId, animeId),
        eq(episodes.episodeNumber, episodeNumber)
      )
    )
    .returning();

  if (old.length !== 0) {
    // length of old should be 1 but whatever
    for (const each of old) {
      await deleteEpisodeFile(each.filename);
      // remove from cache if exist
      episodeService.removeCachedEpisode(each.animeId, each.episodeNumber);
    }
  }

  // update aired episodes
  await refreshAiredEpisodes(animeId);

  sendOkWithPayload('Deleted', response);
}
