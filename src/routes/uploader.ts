import {Router} from 'express';
import multer from 'multer';
import {handleUpload} from '../controllers/uploader';
import {requireAuthenticated} from '../middlewares/auth';
import {injectUser} from '../middlewares/injectUser';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const router = Router();

router.post(
  'file',
  [requireAuthenticated, injectUser, upload.single('file')],
  handleUpload
);

export default router;
