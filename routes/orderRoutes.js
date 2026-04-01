import express from 'express';
import {
    createOrder, getMyOrders, getOrderById,
    updateOrderStatus, getAllOrders, getAnalytics,
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createOrder);
router.get('/mine', protect, getMyOrders);
router.get('/analytics', protect, adminOnly, getAnalytics);
router.get('/', protect, adminOnly, getAllOrders);
router.get('/:id', protect, getOrderById);
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

export default router;
