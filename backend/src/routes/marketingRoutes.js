import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import { listCampaigns } from '../controllers/marketingController.js';

const router = express.Router();

router.get('/marketing', wrap(listCampaigns));
router.get('/campaigns', wrap(listCampaigns));

export default router;
