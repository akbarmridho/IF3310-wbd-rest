import {cacheService} from '../database/cache';
import {users} from '../database/schema';
import {db} from '../database/db';
import {eq} from 'drizzle-orm';

class EpisodeNotFoundException extends Error {}

interface User {
  id: number;
  username: string;
  name: string;
}

class UserService {
  private readonly USER_NAMESPACE = 'user:';

  public async getCachedUser(id: number) {
    const key = `${this.USER_NAMESPACE}${id}`;

    const cached = cacheService.get<User>(key);

    if (cached) {
      return cached;
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      columns: {
        id: true,
        username: true,
        name: true,
      },
    });

    if (!user) {
      return undefined;
    }

    cacheService.set<User>(key, user);

    return user;
  }

  public removeCachedEpisode(id: number) {
    const key = `${this.USER_NAMESPACE}${id}`;
    cacheService.del(key);
  }
}

export const userService = new UserService();
