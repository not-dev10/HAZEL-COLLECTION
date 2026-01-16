import express from 'express';
import { getCsrfToken } from '../middleware/csrfProtection.js';

const router = express.Router();

// Get CSRF token
router.get('/token', getCsrfToken);

export default router;
