import {Router} from 'express';
import {changePasswordHandler, loginHandler, logoutHandler, registerHandler} from '../controllers/auth';

// prefix /
const router = Router();

router.post('/register', [], registerHandler);

router.post('/login', [], loginHandler);

router.post('/logout', [], logoutHandler);

router.put('/changePassword', [], changePasswordHandler);

export default router;
