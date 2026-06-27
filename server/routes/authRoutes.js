import express from 'express';
import { verifyWallet, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/verify-wallet', verifyWallet);
router.post('/signup', signup);

export default router;
