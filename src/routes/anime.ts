import {Router} from 'express';
import {sayHello} from '../controllers/hello';

// route prefix
// /anime
const router = Router();

// todo add require authenticated middleware and inject user middlware

// get all anime
router.get('', sayHello);

// new anime
router.post('', sayHello);

// get specific anime
router.get(':id', sayHello);

// update anime
router.put(':id', sayHello);

// delete anime
router.delete(':id', sayHello);

export default router;
