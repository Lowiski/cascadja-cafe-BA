import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listSalesData, addSale } from '../controllers/orderController.js';

const router = express.Router();

router.get('/sales-data', wrap(listSalesData));
router.get('/data/sales', wrap(listSalesData));
router.post('/sales', requireAdmin, wrap(addSale));

export default router;
