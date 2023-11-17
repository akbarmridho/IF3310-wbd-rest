import {Router} from 'express';
import {stream} from '../controllers/streamer';
import {
  createEpisodeHandler,
  deleteEpisodeHandler,
  getAllEpisodeHandler,
  getEpisodeHandler,
  updateEpisodeHandler,
} from '../controllers/episode';
import {allowApiKey} from '../middlewares/apiKey';
import {requireAuthenticated} from '../middlewares/auth';
import {injectUser} from '../middlewares/injectUser';

// route prefix
// anime/:id/episodes
const router = Router();

// get all episodes for particular anime
router.get(
  '/:id/episodes',
  [allowApiKey, requireAuthenticated, injectUser],
  getAllEpisodeHandler
);

// new episode
router.post(
  '/:id/episodes',
  [requireAuthenticated, injectUser],
  createEpisodeHandler
);

// get specific episode
router.get(
  '/:id/episodes/:episode_number',
  [allowApiKey, requireAuthenticated, injectUser],
  getEpisodeHandler
);

// update episode
router.put(
  '/:id/episodes/:episode_number',
  [requireAuthenticated, injectUser],
  updateEpisodeHandler
);

// delete episode
router.delete(
  '/:id/episodes/:episode_number',
  [requireAuthenticated, injectUser],
  deleteEpisodeHandler
);

// stream episode
router.get(
  '/:id/episodes/:episode_number/stream',
  [allowApiKey, requireAuthenticated, injectUser],
  stream
);

export default router;
