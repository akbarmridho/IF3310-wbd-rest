import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const mergeChunks = async (filename: string, totalChunks: number) => {
  const chunkDir = 'storage/chunks';
  const mergedFilePath = 'storage';

  if (!fs.existsSync(mergedFilePath)) {
    fs.mkdirSync(mergedFilePath);
  }

  const extension = path.extname(filename);
  const randomizedFilename =
    crypto.randomBytes(16).toString('hex') + `.${extension}`;

  const writeStream = fs.createWriteStream(
    `${mergedFilePath}/${randomizedFilename}`
  );

  for (let i = 0; i < totalChunks; i++) {
    const chunkFilePath = `${chunkDir}/${filename}.part_${i}`;
    const chunkBuffer = await fs.promises.readFile(chunkFilePath);
    writeStream.write(chunkBuffer);
    fs.unlinkSync(chunkFilePath);
  }

  writeStream.end();
  console.log('Chunks merged successfully');

  return randomizedFilename;
};
