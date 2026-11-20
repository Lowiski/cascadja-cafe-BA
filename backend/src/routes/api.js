// Active API: Cascadja Foods and Drinks.
// Legacy customer / transaction / marketing routers are kept as reference
// files but are intentionally not mounted.
import express from 'express';
import authRoutes from './authRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import productRoutes from './productRoutes.js';
import orderRoutes from './orderRoutes.js';

const router = express.Router();

router.use(authRoutes);
router.use(analyticsRoutes);
router.use(productRoutes);
router.use(orderRoutes);

export default router;
