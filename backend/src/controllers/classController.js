import classService from '../services/classService.js';
import studentService from '../services/studentService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Ensure uploads directories exist
const classesDir = path.join(__dirname, '../../../uploads/classes');
const studentsDir = path.join(__dirname, '../../../uploads/students');

[classesDir, studentsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Configure multer for class photos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine destination based on the route
    const isStudentRoute = req.originalUrl.includes('/students');
    cb(null, isStudentRoute ? studentsDir : classesDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const prefix = req.originalUrl.includes('/students') ? 'student' : 'class';
    cb(null, prefix + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const classUpload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

class ClassController {
  /**
   * Create a new class
   */
  async createClass(req, res) {
    try {
      const schoolId = req.school.id;
      const classData = { ...req.body };

      // Validate data
      const validation = classService.validateClassData(classData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (req.file) {
        classData.photo = `/uploads/classes/${req.file.filename}`;
      }

      const newClass = await classService.createClass(schoolId, classData);

      res.status(201).json({
        success: true,
        message: 'Class created successfully',
        data: newClass
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get all classes
   */
  async getAllClasses(req, res) {
    try {
      const schoolId = req.school.id;
      const { status, limit, offset } = req.query;

      const classes = await classService.getClassesBySchool(schoolId, {
        status,
        limit: limit ? parseInt(limit) : null,
        offset: offset ? parseInt(offset) : null
      });

      res.json({
        success: true,
        data: classes
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get class by ID
   */
  async getClassById(req, res) {
    try {
      const schoolId = req.school.id;
      const classId = parseInt(req.params.classId);

      const classData = await classService.getClassById(classId, schoolId);

      res.json({
        success: true,
        data: classData
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Update class
   */
  async updateClass(req, res) {
    try {
      const schoolId = req.school.id;
      const classId = parseInt(req.params.classId);
      const updateData = { ...req.body };

      // Remove any fields that shouldn't be updated
      delete updateData.id;
      delete updateData.schoolId;
      delete updateData.createdAt;
      delete updateData.updatedAt;
      
      // Parse students if provided as string
      if (typeof updateData.students === 'string') {
        try {
          updateData.students = JSON.parse(updateData.students);
          // Don't include students in the update - they should be managed separately
          delete updateData.students;
        } catch (e) {
          delete updateData.students;
        }
      } else {
        delete updateData.students;
      }

      if (req.file) {
        updateData.photo = `/uploads/classes/${req.file.filename}`;
      }

      const updatedClass = await classService.updateClass(classId, schoolId, updateData);

      res.json({
        success: true,
        message: 'Class updated successfully',
        data: updatedClass
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Delete class
   */
  async deleteClass(req, res) {
    try {
      const schoolId = req.school.id;
      const classId = parseInt(req.params.classId);

      await classService.deleteClass(classId, schoolId);

      res.json({
        success: true,
        message: 'Class deleted successfully'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Add student to class
   */
  async addStudentToClass(req, res) {
    try {
      const schoolId = req.school.id;
      const classId = parseInt(req.params.classId);
      const studentData = { ...req.body };

      // Validate student data
      const validation = studentService.validateStudentData(studentData);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      if (req.file) {
        studentData.photo = `/uploads/students/${req.file.filename}`;
      }

      const student = await studentService.addStudentToClass(classId, schoolId, studentData);

      res.status(201).json({
        success: true,
        message: 'Student added successfully',
        data: student
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Update student
   */
  async updateStudent(req, res) {
    try {
      const schoolId = req.school.id;
      const classId = parseInt(req.params.classId);
      const studentId = parseInt(req.params.studentId);
      const updateData = { ...req.body };

      if (req.file) {
        updateData.photo = `/uploads/students/${req.file.filename}`;
      }

      const updatedStudent = await studentService.updateStudent(
        studentId,
        classId,
        schoolId,
        updateData
      );

      res.json({
        success: true,
        message: 'Student updated successfully',
        data: updatedStudent
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Delete student
   */
  async deleteStudent(req, res) {
    try {
      const schoolId = req.school.id;
      const classId = parseInt(req.params.classId);
      const studentId = parseInt(req.params.studentId);

      await studentService.deleteStudent(studentId, classId, schoolId);

      res.json({
        success: true,
        message: 'Student deleted successfully'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors
   */
  handleError(error, res) {
    console.error('Class controller error:', error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default new ClassController();