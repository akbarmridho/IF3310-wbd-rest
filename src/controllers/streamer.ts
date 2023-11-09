import {Request, Response} from 'express';
import fs from 'fs';
import {viewerService} from '../services/ViewerService';
import {Episode} from '../database/schema';
import {episodeService} from '../services/EpisodeService';
import {StatusCodes} from 'http-status-codes';
import path from 'path';

export async function stream(
  request: Request<{id: string; episode_number: string}>,
  response: Response
) {
  const range = request.headers.range;

  if (!range) {
    response.status(400).send('Requires Range header');
    return;
  }

  const animeId = Number(request.params.id);
  const episodeNumber = Number(request.params.episode_number);

  let episode: Episode | null = null;

  try {
    episode = await episodeService.getCachedEpisode(animeId, episodeNumber);
  } catch (e) {
    // not found
  }

  if (episode === null) {
    response.status(StatusCodes.NOT_FOUND).send();
    return;
  }

  const videoPath = `storage/${episode.filename}`;
  const videoSize = fs.statSync(videoPath).size;
  const CHUNK_SIZE = 10 ** 6;
  const start = Number(range.replace(/\D/g, ''));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);
  const contentLength = end - start + 1;
  const headers = {
    'Content-Range': `bytes ${start}-${end}/${videoSize}`,
    'Accept-Ranges': 'bytes',
    'Content-Length': contentLength,
    'Content-Type': 'video/mp4',
  };

  // add viewer
  if (start >= videoSize / 2) {
    const apiUserId = request.apiUserId;
    if (apiUserId === undefined) {
      throw new Error('Invalid streamer user id');
    }

    viewerService.addViewer(animeId, episodeNumber, apiUserId.toString());
  }

  response.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, {start, end});
  videoStream.pipe(response);
}

export async function streamThumbnail(
  request: Request<{id: string; episode_number: string}>,
  response: Response
) {
  const animeId = Number(request.params.id);
  const episodeNumber = Number(request.params.episode_number);

  let episode: Episode | null = null;

  try {
    episode = await episodeService.getCachedEpisode(animeId, episodeNumber);
  } catch (e) {
    // not found
  }

  if (episode === null) {
    response.status(StatusCodes.NOT_FOUND).send();
    return;
  }

  const filename = `${path.basename(episode.filename)}.jpg`;

  const stream = fs.createReadStream(`storage/thumbnails/${filename}`);

  stream.on('open', () => {
    response.set('Content-Type', 'image/jpeg');
    response.set('Cache-Control', 'max-age=43200');
    stream.pipe(response);
  });
  stream.on('error', () => {
    response.status(StatusCodes.NOT_FOUND).send();
  });
}
