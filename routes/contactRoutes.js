import express from 'express';
import { submitContactForm, getContacts } from '../controllers/contactController.js';
import { adminAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', submitContactForm);
router.get('/', adminAuth, getContacts);

export default router;
