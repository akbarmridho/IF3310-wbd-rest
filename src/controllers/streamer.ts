import {Request, Response} from 'express';
import fs from 'fs';
import {sendBadRequest} from '../utils/sendResponse';

export const stream = (request: Request, response: Response) => {
  const range = request.headers.range;

  if (!range) {
    response.status(400).send('Requires Range header');
    return;
  }

  const filename = request.query.filename;
  const token = request.query.token;

  if (typeof filename !== 'string') {
    sendBadRequest('Require filename query as string', response);
    return;
  }

  if (typeof token !== 'string') {
    sendBadRequest('Require token query as string', response);
    return;
  }

  // todo
  // call soap and check for token validity

  const videoPath = `storage/${filename}`;
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

  response.writeHead(206, headers);
  const videoStream = fs.createReadStream(videoPath, {start, end});
  videoStream.pipe(response);
};
