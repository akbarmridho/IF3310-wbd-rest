import {Request, Response} from 'express';
import {db} from '../database/db';
import {eq} from 'drizzle-orm';
import {anime} from '../database/schema';
import {sendNotFound, sendOkWithPayload} from '../utils/sendResponse';

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
