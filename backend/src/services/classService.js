import classRepository from '../repositories/classRepository.js';
import studentRepository from '../repositories/studentRepository.js';

class ClassService {
  /**
   * Create a new class
   */
  async createClass(schoolId, classData) {
    // Check if class already exists
    const exists = await classRepository.classExists(
      schoolId,
      classData.className,
      classData.year
    );

    if (exists) {
      throw {
        status: 409,
        message: 'Class already exists for this year',
        code: 'CLASS_EXISTS'
      };
    }

    return await classRepository.createClass({
      ...classData,
      schoolId
    });
  }

  /**
   * Get all classes for a school
   */
  async getClassesBySchool(schoolId, options = {}) {
    const classes = await classRepository.findClassesBySchoolId(schoolId, {
      ...options,
      includeStudents: true
    });

    // Format the response
    return classes.map(cls => {
      const classData = cls.toJSON();
      return {
        ...classData,
        studentCount: classData.students ? classData.students.length : 0
      };
    });
  }

  /**
   * Get class by ID
   */
  async getClassById(classId, schoolId) {
    const classData = await classRepository.findClassById(classId, true);

    if (!classData) {
      throw {
        status: 404,
        message: 'Class not found',
        code: 'CLASS_NOT_FOUND'
      };
    }

    // Verify the class belongs to the school
    if (classData.schoolId !== schoolId) {
      throw {
        status: 403,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      };
    }

    const classJSON = classData.toJSON();
    return {
      ...classJSON,
      studentCount: classJSON.students ? classJSON.students.length : 0
    };
  }

  /**
   * Update class
   */
  async updateClass(classId, schoolId, updateData) {
    const classData = await classRepository.findClassById(classId);

    if (!classData) {
      throw {
        status: 404,
        message: 'Class not found',
        code: 'CLASS_NOT_FOUND'
      };
    }

    if (classData.schoolId !== schoolId) {
      throw {
        status: 403,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      };
    }

    // Don't allow updating schoolId
    delete updateData.schoolId;

    return await classRepository.updateClass(classId, updateData);
  }

  /**
   * Delete class
   */
  async deleteClass(classId, schoolId) {
    const classData = await classRepository.findClassById(classId);

    if (!classData) {
      throw {
        status: 404,
        message: 'Class not found',
        code: 'CLASS_NOT_FOUND'
      };
    }

    if (classData.schoolId !== schoolId) {
      throw {
        status: 403,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      };
    }

    // Check if class has students
    const studentCount = await studentRepository.countStudentsByClass(classId);
    if (studentCount > 0) {
      throw {
        status: 400,
        message: `Cannot delete class with ${studentCount} students`,
        code: 'CLASS_HAS_STUDENTS'
      };
    }

    return await classRepository.deleteClass(classId);
  }

  /**
   * Get class statistics
   */
  async getClassStatistics(schoolId) {
    const classes = await classRepository.findClassesBySchoolId(schoolId, {
      includeStudents: true
    });

    const stats = {
      totalClasses: classes.length,
      totalStudents: 0,
      classesByYear: {},
      studentsPerClass: []
    };

    classes.forEach(cls => {
      const classData = cls.toJSON();
      const studentCount = classData.students ? classData.students.length : 0;
      
      stats.totalStudents += studentCount;
      
      if (!stats.classesByYear[classData.year]) {
        stats.classesByYear[classData.year] = 0;
      }
      stats.classesByYear[classData.year]++;

      stats.studentsPerClass.push({
        className: classData.className,
        year: classData.year,
        count: studentCount
      });
    });

    return stats;
  }

  /**
   * Validate class data
   */
  validateClassData(classData) {
    const errors = {};

    if (!classData.className || classData.className.trim().length < 2) {
      errors.className = 'Class name must be at least 2 characters long';
    }

    if (!classData.year || !/^\d{4}$/.test(classData.year)) {
      errors.year = 'Please enter a valid year (e.g., 2024)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new ClassService();
