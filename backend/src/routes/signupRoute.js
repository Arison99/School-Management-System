import express from 'express';
import signupController from '../controllers/signupController.js';

const router = express.Router();

// POST /api/signup
router.post('/', signupController.signup.bind(signupController));

export default router;
