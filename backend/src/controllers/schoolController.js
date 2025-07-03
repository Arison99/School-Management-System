import schoolService from '../services/schoolService.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/schools/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'school-' + uniqueSuffix + path.extname(file.originalname));
  }
});

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
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

class SchoolController {
  /**
   * Create a new school
   */
  async createSchool(req, res) {
    try {
      const validation = schoolService.validateSchoolData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      const schoolData = { ...req.body };
      
      // Parse headMaster data if it's a string
      if (typeof schoolData.headMaster === 'string') {
        try {
          schoolData.headMaster = JSON.parse(schoolData.headMaster);
        } catch (e) {
          schoolData.headMaster = {};
        }
      }

      // Parse studentsPerClass if it's a string
      if (typeof schoolData.studentsPerClass === 'string') {
        try {
          schoolData.studentsPerClass = JSON.parse(schoolData.studentsPerClass);
        } catch (e) {
          schoolData.studentsPerClass = [];
        }
      }

      if (req.file) {
        schoolData.photo = `/uploads/schools/${req.file.filename}`;
      }

      const school = await schoolService.createSchool(req.user.id, schoolData);

      res.status(201).json({
        success: true,
        message: 'School created successfully',
        data: school
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get current user's school
   */
  async getMySchool(req, res) {
    try {
      const school = await schoolService.getSchoolByUserId(req.user.id);
      
      res.json({
        success: true,
        data: school
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get school by ID
   */
  async getSchoolById(req, res) {
    try {
      const school = await schoolService.getSchoolById(req.params.id);
      
      res.json({
        success: true,
        data: school
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Update school
   */
  async updateSchool(req, res) {
    try {
      const updateData = { ...req.body };
      
      // Parse headMaster data if it's a string
      if (typeof updateData.headMaster === 'string') {
        try {
          updateData.headMaster = JSON.parse(updateData.headMaster);
        } catch (e) {
          updateData.headMaster = {};
        }
      }

      // Parse studentsPerClass if it's a string
      if (typeof updateData.studentsPerClass === 'string') {
        try {
          updateData.studentsPerClass = JSON.parse(updateData.studentsPerClass);
        } catch (e) {
          updateData.studentsPerClass = [];
        }
      }

      if (req.file) {
        updateData.photo = `/uploads/schools/${req.file.filename}`;
      }

      const school = await schoolService.updateSchool(req.user.id, updateData);

      res.json({
        success: true,
        message: 'School updated successfully',
        data: school
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get all schools
   */
  async getAllSchools(req, res) {
    try {
      const { page = 1, limit = 10, status, type } = req.query;
      
      const result = await schoolService.getAllSchools({
        page: parseInt(page),
        limit: parseInt(limit),
        status,
        type
      });

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Delete school
   */
  async deleteSchool(req, res) {
    try {
      await schoolService.deleteSchool(req.user.id);
      
      res.json({
        success: true,
        message: 'School deleted successfully'
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Get school statistics
   */
  async getSchoolStats(req, res) {
    try {
      const stats = await schoolService.getSchoolStats(req.user.id);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors
   */
  handleError(error, res) {
    console.error('School controller error:', error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
}

export default new SchoolController();
