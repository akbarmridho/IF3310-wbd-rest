import {Request, Response} from 'express';
import {
  sendBadRequest,
  sendOkWithPayload,
  sendServerError,
} from '../utils/sendResponse';
import fs from 'fs';
import {mergeChunks} from '../utils/file';

export const handleUpload = async (request: Request, response: Response) => {
  const chunk = request.file;

  if (!chunk) {
    sendBadRequest('Missing file', response);
    return;
  }

  const chunkNumber = Number(request.body.chunkNumber);
  const totalChunks = Number(request.body.totalChunks);

  if (isNaN(chunkNumber) || isNaN(totalChunks)) {
    sendBadRequest('Chunk number or total chunks is invalid', response);
    return;
  }

  const filename = chunk.filename;

  const chunkDir = 'storage/chunks';

  if (!fs.existsSync(chunkDir)) {
    fs.mkdirSync(chunkDir);
  }

  const chunkFilePath = `${chunkDir}/${filename}.part_${chunkNumber}`;

  try {
    await fs.promises.writeFile(chunkFilePath, chunk.buffer);
    console.log(`Chunk ${chunkNumber} out of ${totalChunks} saved`);

    if (chunkNumber === totalChunks - 1) {
      // last chunk
      const uploadedFilename = await mergeChunks(filename, totalChunks);

      sendOkWithPayload(
        {
          message: 'File uploaded successfully',
          filename: uploadedFilename,
        },
        response
      );
    } else {
      sendOkWithPayload(
        {
          message: 'Chunk uploaded successfully',
        },
        response
      );
    }
  } catch (e) {
    console.log('Error saving chunk: ', e);
    sendServerError('Error saving file', response);
  }
};
