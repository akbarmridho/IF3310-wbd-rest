import {Router} from 'express';
import multer from 'multer';
import {handleUpload} from '../controllers/uploader';

const storage = multer.memoryStorage();
const upload = multer({storage: storage});

const router = Router();

router.post('file', upload.single('file'), handleUpload);

export default router;
