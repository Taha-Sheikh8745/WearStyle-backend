import express from 'express';
import {
    createOrder, getOrderById,
    updateOrderStatus, getAllOrders, getAnalytics,
} from '../controllers/orderController.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', createOrder);                           // Public — no auth
router.get('/analytics', adminAuth, getAnalytics);       // Admin only
router.get('/', adminAuth, getAllOrders);                 // Admin only
router.get('/:id', getOrderById);                        // Public — lookup by orderId
router.put('/:id/status', adminAuth, updateOrderStatus); // Admin only

export default router;
