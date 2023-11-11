import {Router} from 'express';
import {sayHello} from '../controllers/hello';
import {requireAuthenticated} from '../middlewares/auth';
import {injectUser} from '../middlewares/injectUser';
import {allowApiKey} from '../middlewares/apiKey';
import {getAnimeHandler} from '../controllers/anime';

// route prefix
// /anime
const router = Router();

// get all anime
router.get('/', [requireAuthenticated, injectUser], sayHello);

// new anime
router.post('/', [requireAuthenticated, injectUser], sayHello);

// get specific anime
router.get(
  '/:id',
  [allowApiKey, requireAuthenticated, injectUser],
  getAnimeHandler
);

// update anime
router.put('/:id', [requireAuthenticated, injectUser], sayHello);

// delete anime
router.delete('/:id', [requireAuthenticated, injectUser], sayHello);

export default router;
