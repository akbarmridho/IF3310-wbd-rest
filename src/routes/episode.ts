import {Router} from 'express';
import {sayHello} from '../controllers/hello';
import {stream} from '../controllers/streamer';

// route prefix
// anime/:id/episodes
const router = Router();

// get all episodes for particular anime
router.get('', sayHello);

// new episode
router.post('', sayHello);

// get specific episode
router.get(':episode_number', sayHello);

// update episode
router.put(':episode_number', sayHello);

// delete episode
router.delete(':episode_number', sayHello);

// stream episode
router.get(':episode_number/stream', stream);

export default router;
