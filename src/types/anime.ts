import {z} from 'zod';

export const CreateAnimeRequest = z.object({
  id: z
    .string()
    .max(255)
    .regex(
      new RegExp(/^[a-z0-9-]+$/),
      'Id only could have lowercase and hypens'
    ),
  title: z.string().max(255),
  status: z.enum(['upcoming', 'airing', 'aired']),
  totalEpisodes: z.number().int().gt(0).optional(),
  broadcastInformation: z.string().max(255).optional(),
});

export const UpdateAnimeRequest = z.object({
  title: z.string().max(255).optional(),
  status: z.enum(['upcoming', 'airing', 'aired']),
  totalEpisodes: z.number().int().gt(0).optional(),
  broadcastInformation: z.string().max(255).optional(),
});
