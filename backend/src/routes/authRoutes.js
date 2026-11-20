import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { login, me } from '../controllers/authController.js';

const router = express.Router();

router.post('/auth/login', wrap(login));
router.get('/auth/me', requireAdmin, wrap(me));

export default router;
