import {Request, Response} from 'express';
import {CreateEpisodeRequest, UpdateEpisodeRequest} from '../types/episode';
import {db} from '../database/db';
import {and, asc, eq} from 'drizzle-orm';
import {episodes} from '../database/schema';
import {
  sendBadRequest,
  sendCreated,
  sendOkWithPayload,
} from '../utils/sendResponse';
import {deleteEpisodeFile} from '../utils/file';
import {episodeService} from '../services/EpisodeService';

export async function createEpisodeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const data = CreateEpisodeRequest.parse(request.body);
  const animeId = Number(request.params.id);

  // check for duplicate episode
  const episode = await db.query.episodes.findFirst({
    where: and(
      eq(episodes.animeId, animeId),
      eq(episodes.episodeNumber, data.episodeNumber)
    ),
  });

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
  const animeId = Number(request.params.id);
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

  sendOkWithPayload(result[0], response);
}

export async function getAllEpisodeHandler(
  request: Request<{id: string}>,
  response: Response
) {
  const animeId = Number(request.params.id);

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
  const animeId = Number(request.params.id);
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
  const animeId = Number(request.params.id);
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

  sendOkWithPayload('Deleted', response);
}
