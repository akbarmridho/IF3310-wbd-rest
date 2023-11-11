import {z} from 'zod';

export const CreateEpisodeRequest = z.object({
  animeId: z.string().max(255),
  title: z.string().max(255),
  episodeNumber: z.number().int().gt(0),
  filename: z.string().max(255),
});

export const UpdateEpisodeRequest = z.object({
  title: z.string().max(255).optional(),
  episodeNumber: z.number().int().gt(0).optional(),
  filename: z.string().max(255).optional(),
});
