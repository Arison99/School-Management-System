import express from 'express';
import loginController from '../controllers/loginController.js';

const router = express.Router();

// POST /api/login
router.post('/', loginController.login.bind(loginController));

export default router;
