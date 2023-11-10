import {anime, episodes, users} from './schema';
import bcrypt from 'bcrypt';
import {db} from './db';

async function main() {
  console.log('start seeding');

  // seed user
  await db.insert(users).values({
    username: 'akbar',
    name: 'Akbar',
    password: await bcrypt.hash('password', 10),
  });

  console.log('what the fc');

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
        globalIdentifier: 'frieren-s1',
        status: 'airing',
        totalEpisodes: 28,
        airedEpisodes: 2,
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
}

main().catch(e => {
  console.log(e);
});
