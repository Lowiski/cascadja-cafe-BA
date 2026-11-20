import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import { listCustomers, createCustomer } from '../controllers/customerController.js';

const router = express.Router();

router.get('/customers', wrap(listCustomers));
router.post('/customers', wrap(createCustomer));

export default router;
