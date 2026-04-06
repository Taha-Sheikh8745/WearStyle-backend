import express from 'express';
import { submitContactForm, getContacts } from '../controllers/contactController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContactForm);
router.get('/', protect, adminOnly, getContacts);

export default router;
