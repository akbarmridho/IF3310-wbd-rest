import * as schema from './database/schema';
import {anime, episodes, users} from './database/schema';
import bcrypt from 'bcryptjs';
import postgres from 'postgres';
import {drizzle} from 'drizzle-orm/postgres-js';

async function main() {
  // hard code the credentials and run seeder on host machine instead
  // because for some reason if this script is run on the container
  // the script will have segmentation fault
  const databaseUrl = 'postgres://postgres:pgpassword@localhost:5433/postgres';
  const postgresClient = postgres(databaseUrl);
  const db = drizzle(postgresClient, {schema});

  console.log('start seeding');

  // seed user
  await db.insert(users).values({
    username: 'akbar',
    name: 'Akbar',
    password: await bcrypt.hash('password', 10),
  });

  await db.insert(users).values({
    username: 'eugene',
    name: 'Eugene',
    password: await bcrypt.hash('password', 10),
  });

  const createdAnime = (
    await db
      .insert(anime)
      .values({
        title: 'Sousou no Frieren',
        id: 'frieren-s1',
        status: 'airing',
        totalEpisodes: 28,
        airedEpisodes: 1,
        broadcastInformation: 'Lorem ipsum dos color sit amet',
      })
      .returning()
  )[0];

  await db.insert(episodes).values({
    animeId: createdAnime.id,
    title: 'Episode 1',
    episodeNumber: 1,
    filename: 'frieren-trailer.mp4',
  });

  console.log('Seeding success');

  // eslint-disable-next-line no-process-exit
  process.exit();
}

main().catch(e => {
  console.log(e);
});
