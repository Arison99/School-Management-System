import express from 'express';
import classController, { classUpload } from '../controllers/classController.js';
import { authenticateToken, requireSchool } from '../middlewares/authMiddleware.js';

const router = express.Router();

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
