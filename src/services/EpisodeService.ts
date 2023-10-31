import {cacheService} from '../database/cache';
import {Episode, episodes} from '../database/schema';
import {db} from '../database/db';
import {and, eq} from 'drizzle-orm';

class EpisodeNotFoundException extends Error {}

class EpisodeService {
  private readonly EPISODE_NAMESPACE = 'episodes:';

  public async getCachedEpisode(animeId: number, episodeNumber: number) {
    const key = `${this.EPISODE_NAMESPACE}${animeId}-${episodeNumber}`;

    const cached = cacheService.get<Episode>(key);

    if (cached) {
      return cached;
    }

    const episode = await db.query.episodes.findFirst({
      where: and(
        eq(episodes.animeId, animeId),
        eq(episodes.episodeNumber, episodeNumber)
      ),
    });

    if (!episode) {
      throw new EpisodeNotFoundException();
    }

    cacheService.set<Episode>(key, episode);

    return episode;
  }

  public removeCachedEpisode(animeId: number, episodeNumber: number) {
    const key = `${this.EPISODE_NAMESPACE}${animeId}-${episodeNumber}`;
    cacheService.del(key);
  }
}

export const episodeService = new EpisodeService();
