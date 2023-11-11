import {db} from '../database/db';
import {episodes, episodeViewer} from '../database/schema';
import {and, eq, sql} from 'drizzle-orm';

export class ViewerService {
  private tempViewer: Map<string, Date>;
  private tempCounter: Map<string, number>;

  public constructor() {
    this.tempViewer = new Map<string, Date>();
    this.tempCounter = new Map<string, number>();

    // not the best way to count viewers but it works!
    setInterval(
      () => {
        try {
          const copy = new Map(this.tempViewer);
          this.tempViewer.clear();
          void this.handleViewerSave(copy);
          const counterCopy = new Map(this.tempCounter);
          this.tempCounter.clear();
          void this.handleCounterSave(counterCopy);
        } catch (e) {
          if (e instanceof Error) {
            console.log(e.stack);
          }
        }
      },
      5 * 30 * 1000
    ); // 5 minute
  }

  private async handleViewerSave(data: Map<string, Date>) {
    if (data.size === 0) {
      return;
    }

    const toInsert: Array<{
      animeId: string;
      episodeNumber: number;
      userIdentifier: string;
      createdAt: Date;
    }> = [];

    data.forEach((val, key) => {
      const [animeId, episodeNumber, userIdentifier] = key.split(':');

      toInsert.push({
        animeId: animeId,
        episodeNumber: Number(episodeNumber),
        userIdentifier,
        createdAt: val,
      });
    });

    await db.insert(episodeViewer).values(toInsert);
  }

  private async handleCounterSave(data: Map<string, number>) {
    for (const [key, val] of data.entries()) {
      const [animeId, episodeNumber] = key.split(':');

      await db
        .update(episodes)
        .set({
          totalViewers: sql`${episodes.totalViewers}
          +
          ${val}`,
        })
        .where(
          and(
            eq(episodes.animeId, animeId),
            eq(episodes.episodeNumber, Number(episodeNumber))
          )
        );
    }
  }

  public addViewer(
    animeId: string,
    episodeNumber: number,
    userIdentifier: string
  ) {
    const value = `${animeId}:${episodeNumber}:${userIdentifier}`;

    if (!this.tempViewer.has(value)) {
      this.tempViewer.set(value, new Date());

      const counterKey = `${animeId}:${episodeNumber}`;
      const initialCount = this.tempCounter.get(counterKey) ?? 0;

      this.tempCounter.set(counterKey, initialCount + 1);
    }
  }
}

export const viewerService = new ViewerService();
