import express from 'express';
import { verifyContract } from '../controllers/verify.controller.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('pdf'), verifyContract);

export default router;
