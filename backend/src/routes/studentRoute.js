import express from 'express';
import studentController from '../controllers/studentController.js';
import { authenticateToken, requireSchool } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication and school
router.use(authenticateToken);
router.use(requireSchool);

// Student routes
router.get('/', studentController.getAllStudents.bind(studentController));
router.get('/search', studentController.searchStudents.bind(studentController));

export default router;
