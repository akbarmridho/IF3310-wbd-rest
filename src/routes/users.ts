import {Router} from 'express';
import {
  changePasswordHandler,
  loginHandler,
  logoutHandler,
  profileHandler,
  registerHandler,
} from '../controllers/auth';
import {injectUser} from '../middlewares/injectUser';
import {requireAuthenticated} from '../middlewares/auth';

// prefix /
const router = Router();

router.post('/register', registerHandler);

router.post('/login', loginHandler);

router.post('/logout', [requireAuthenticated, injectUser], logoutHandler);

router.get('/profile', [requireAuthenticated, injectUser], profileHandler);

router.put(
  '/profile/password',
  [requireAuthenticated, injectUser],
  changePasswordHandler
);

export default router;
