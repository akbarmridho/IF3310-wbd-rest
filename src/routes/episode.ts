import {Router} from 'express';
import {stream, streamThumbnail} from '../controllers/streamer';
import {
  createEpisodeHandler,
  deleteEpisodeHandler,
  getAllEpisodeHandler,
  getEpisodeHandler,
  updateEpisodeHandler,
} from '../controllers/episode';

// route prefix
// anime/:id/episodes
const router = Router();

// get all episodes for particular anime
router.get('', getAllEpisodeHandler);

// new episode
router.post('', createEpisodeHandler);

// get specific episode
router.get(':episode_number', getEpisodeHandler);

// update episode
router.put(':episode_number', updateEpisodeHandler);

// delete episode
router.delete(':episode_number', deleteEpisodeHandler);

// stream episode
router.get(':episode_number/stream', stream);

// stream thumbnail episode
router.get(':episode_number/thumbnail', streamThumbnail);

export default router;
