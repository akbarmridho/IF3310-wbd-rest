import {Router} from 'express';
import {changePasswordHandler, loginHandler, logoutHandler, registerHandler} from '../controllers/auth';
import {injectUser} from '../middlewares/injectUser';
import {requireAuthenticated} from '../middlewares/auth';

// prefix /
const router = Router();

// TODO: add middlewares
router.post('/register', [], registerHandler);

router.post('/login', [], loginHandler);

router.post('/logout', [requireAuthenticated, injectUser], logoutHandler);

router.put('/changePassword', [requireAuthenticated, injectUser], changePasswordHandler);

export default router;
