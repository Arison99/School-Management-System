import express from 'express';
import classController, { classUpload } from '../controllers/classController.js';
import { authenticateToken, requireSchool } from '../middlewares/authMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Apply rate limiting to all routes in this router
const classLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
router.use(classLimiter);

// All routes require authentication and school
router.use(authenticateToken);
router.use(requireSchool);

// Class routes
router.get('/', classController.getAllClasses.bind(classController));
router.post('/', classUpload.single('photo'), classController.createClass.bind(classController));
router.get('/:classId', classController.getClassById.bind(classController));
router.put('/:classId', classUpload.single('photo'), classController.updateClass.bind(classController));
router.delete('/:classId', classController.deleteClass.bind(classController));

// Student routes within class
router.post('/:classId/students', classUpload.single('photo'), classController.addStudentToClass.bind(classController));
router.put('/:classId/students/:studentId', classUpload.single('photo'), classController.updateStudent.bind(classController));
router.delete('/:classId/students/:studentId', classController.deleteStudent.bind(classController));

export default router;
