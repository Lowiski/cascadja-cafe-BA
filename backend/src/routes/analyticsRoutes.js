import express from 'express';
import { wrap } from '../middleware/errorHandler.js';
import {
  health, meta, descriptive, predictive, prescriptiveGet, prescriptivePost, menu,
} from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/health', wrap(health));
router.get('/meta', wrap(meta));
router.get('/descriptive', wrap(descriptive));
router.get('/predictive', wrap(predictive));
router.get('/prescriptive', wrap(prescriptiveGet));
router.post('/prescriptive', wrap(prescriptivePost));
router.get('/menu', wrap(menu));

export default router;
