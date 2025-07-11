import express from 'express';
import schoolController, { upload } from '../controllers/schoolController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// School routes
router.post('/', upload.single('photo'), schoolController.createSchool.bind(schoolController));
router.get('/my-school', schoolController.getMySchool.bind(schoolController));
router.get('/stats', schoolController.getSchoolStats.bind(schoolController));
router.get('/:id', schoolController.getSchoolById.bind(schoolController));
router.put('/', upload.single('photo'), schoolController.updateSchool.bind(schoolController));
router.delete('/', schoolController.deleteSchool.bind(schoolController));
router.get('/', schoolController.getAllSchools.bind(schoolController));

export default router;
