import {Router} from 'express';
import {stream, streamThumbnail} from '../controllers/streamer';
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
  '/',
  [allowApiKey, requireAuthenticated, injectUser],
  getAllEpisodeHandler
);

// new episode
router.post('/', [requireAuthenticated, injectUser], createEpisodeHandler);

// get specific episode
router.get(
  '/:episode_number',
  [allowApiKey, requireAuthenticated, injectUser],
  getEpisodeHandler
);

// update episode
router.put(
  '/:episode_number',
  [requireAuthenticated, injectUser],
  updateEpisodeHandler
);

// delete episode
router.delete(
  '/:episode_number',
  [requireAuthenticated, injectUser],
  deleteEpisodeHandler
);

// stream episode
router.get(
  '/:episode_number/stream',
  [allowApiKey, requireAuthenticated, injectUser],
  stream
);

// stream thumbnail episode
router.get(
  '/:episode_number/thumbnail',
  [allowApiKey, requireAuthenticated, injectUser],
  streamThumbnail
);

export default router;
