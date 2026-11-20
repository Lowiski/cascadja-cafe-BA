import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listMenuTable, addMenuItem } from '../controllers/productController.js';

const router = express.Router();

router.get('/data/menu', wrap(listMenuTable));
router.post('/menu', requireAdmin, wrap(addMenuItem));

export default router;
