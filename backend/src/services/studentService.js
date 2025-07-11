import studentRepository from '../repositories/studentRepository.js';
import classRepository from '../repositories/classRepository.js';

class StudentService {
  /**
   * Add student to class
   */
  async addStudentToClass(classId, schoolId, studentData) {
    // Verify class belongs to school
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

    // Check if student number already exists
    const exists = await studentRepository.studentNumberExists(studentData.studentNumber);
    if (exists) {
      throw {
        status: 409,
        message: 'Student number already exists',
        code: 'STUDENT_NUMBER_EXISTS'
      };
    }

    // Calculate age if not provided
    if (!studentData.age && studentData.dob) {
      studentData.age = this.calculateAge(studentData.dob);
    }

    return await studentRepository.createStudent({
      ...studentData,
      classId
    });
  }

  /**
   * Update student
   */
  async updateStudent(studentId, classId, schoolId, updateData) {
    const student = await studentRepository.findStudentById(studentId);
    
    if (!student) {
      throw {
        status: 404,
        message: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      };
    }

    // Verify student belongs to the class
    if (student.classId !== classId) {
      throw {
        status: 403,
        message: 'Student does not belong to this class',
        code: 'INVALID_CLASS'
      };
    }

    // Verify class belongs to school
    const classData = await classRepository.findClassById(classId);
    if (classData.schoolId !== schoolId) {
      throw {
        status: 403,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      };
    }

    // Don't allow changing classId or studentNumber
    delete updateData.classId;
    delete updateData.studentNumber;

    // Recalculate age if DOB changed
    if (updateData.dob) {
      updateData.age = this.calculateAge(updateData.dob);
    }

    return await studentRepository.updateStudent(studentId, updateData);
  }

  /**
   * Delete student
   */
  async deleteStudent(studentId, classId, schoolId) {
    const student = await studentRepository.findStudentById(studentId);
    
    if (!student) {
      throw {
        status: 404,
        message: 'Student not found',
        code: 'STUDENT_NOT_FOUND'
      };
    }

    if (student.classId !== classId) {
      throw {
        status: 403,
        message: 'Student does not belong to this class',
        code: 'INVALID_CLASS'
      };
    }

    const classData = await classRepository.findClassById(classId);
    if (classData.schoolId !== schoolId) {
      throw {
        status: 403,
        message: 'Access denied',
        code: 'ACCESS_DENIED'
      };
    }

    return await studentRepository.deleteStudent(studentId);
  }

  /**
   * Get all students in school
   */
  async getAllStudentsBySchool(schoolId) {
    return await studentRepository.findStudentsBySchoolId(schoolId);
  }

  /**
   * Search students
   */
  async searchStudents(schoolId, query) {
    if (!query || query.trim().length < 2) {
      throw {
        status: 400,
        message: 'Search query must be at least 2 characters',
        code: 'INVALID_QUERY'
      };
    }

    return await studentRepository.searchStudents(schoolId, query);
  }

  /**
   * Calculate age from DOB
   */
  calculateAge(dob) {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  /**
   * Validate student data
   */
  validateStudentData(studentData) {
    const errors = {};

    if (!studentData.studentNumber || studentData.studentNumber.trim().length === 0) {
      errors.studentNumber = 'Student number is required';
    }

    if (!studentData.studentName || studentData.studentName.trim().length < 2) {
      errors.studentName = 'Student name must be at least 2 characters long';
    }

    if (!studentData.dob) {
      errors.dob = 'Date of birth is required';
    }

    if (!studentData.fatherName || studentData.fatherName.trim().length < 2) {
      errors.fatherName = 'Father name must be at least 2 characters long';
    }

    if (!studentData.motherName || studentData.motherName.trim().length < 2) {
      errors.motherName = 'Mother name must be at least 2 characters long';
    }

    if (studentData.email && !/\S+@\S+\.\S+/.test(studentData.email)) {
      errors.email = 'Invalid email address';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new StudentService();
