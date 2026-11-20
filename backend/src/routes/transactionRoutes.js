import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import { listTransactions, listTable } from '../controllers/transactionController.js';

const router = express.Router();

router.get('/transactions', wrap(listTransactions));
router.get('/data/:table', wrap(listTable));

export default router;
