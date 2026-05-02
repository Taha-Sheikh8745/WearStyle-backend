import express from 'express';
import {
    createOrder, getOrderById,
    updateOrderStatus, getAllOrders, getAnalytics,
} from '../controllers/orderController.js';
import { adminAuth } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for screenshots
});

router.post('/', upload.single('paymentScreenshot'), createOrder);                           // Public — no auth
router.get('/analytics', adminAuth, getAnalytics);       // Admin only
router.get('/', adminAuth, getAllOrders);                 // Admin only
router.get('/:id', getOrderById);                        // Public — lookup by orderId
router.put('/:id/status', adminAuth, updateOrderStatus); // Admin only

export default router;
