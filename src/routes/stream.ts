import {Router} from 'express';
import {stream} from '../controllers/streamer';

const router = Router();

router.get('stream', stream);

export default router;
