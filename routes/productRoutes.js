import express from 'express';
import multer from 'multer';
import path from 'path';
import {
    getProducts, getProductById, createProduct,
    updateProduct, deleteProduct, addReview,
} from '../controllers/productController.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', adminAuth, upload.array('images', 10), createProduct);
router.put('/:id', adminAuth, upload.array('images', 10), updateProduct);
router.delete('/:id', adminAuth, deleteProduct);
router.post('/:id/reviews', addReview); // Public — no user auth

export default router;
