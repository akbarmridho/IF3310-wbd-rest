import {Router} from 'express';
import {requireAuthenticated} from '../middlewares/auth';
import {injectUser} from '../middlewares/injectUser';
import {allowApiKey} from '../middlewares/apiKey';
import {
  createAnimeHandler,
  deleteAnimeHandler,
  getAllAnimeHandler,
  getAnimeHandler,
  updateAnimeHandler,
} from '../controllers/anime';

// route prefix
// /anime
const router = Router();

// get all anime
router.get('/', [requireAuthenticated, injectUser], getAllAnimeHandler);

// new anime
router.post('/', [requireAuthenticated, injectUser], createAnimeHandler);

// get specific anime
router.get(
  '/:id',
  [allowApiKey, requireAuthenticated, injectUser],
  getAnimeHandler
);

// update anime
router.put('/:id', [requireAuthenticated, injectUser], updateAnimeHandler);

// delete anime
router.delete('/:id', [requireAuthenticated, injectUser], deleteAnimeHandler);

export default router;
