import {Router} from 'express';
import {sayHello} from '../controllers/hello';

const router = Router();

router.get('/hello', sayHello);

export default router;
