import schoolRepository from '../repositories/schoolRepository.js';

class SchoolService {
  /**
   * Create a new school
   * @param {number} userId - User ID
   * @param {Object} schoolData - School data
   * @returns {Promise<Object>} Created school
   */
  async createSchool(userId, schoolData) {
    try {
      // Check if user already has a school
      const existingSchool = await schoolRepository.findByUserId(userId);
      if (existingSchool) {
        throw {
          status: 409,
          message: 'User already has a registered school',
          code: 'SCHOOL_EXISTS'
        };
      }

      // Check for duplicate registration number
      if (await schoolRepository.exists({ registrationNumber: schoolData.registrationNumber })) {
        throw {
          status: 409,
          message: 'Registration number already exists',
          code: 'DUPLICATE_REG_NUMBER'
        };
      }

      // Check for duplicate license number
      if (await schoolRepository.exists({ licenseNumber: schoolData.licenseNumber })) {
        throw {
          status: 409,
          message: 'License number already exists',
          code: 'DUPLICATE_LICENSE'
        };
      }

      // Check for duplicate TIN
      if (await schoolRepository.exists({ tin: schoolData.tin })) {
        throw {
          status: 409,
          message: 'TIN already exists',
          code: 'DUPLICATE_TIN'
        };
      }

      // Create school
      const school = await schoolRepository.createSchool({
        ...schoolData,
        userId
      });

      return school;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get school by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object>} School data
   */
  async getSchoolByUserId(userId) {
    const school = await schoolRepository.findByUserId(userId);
    if (!school) {
      throw {
        status: 404,
        message: 'School not found',
        code: 'SCHOOL_NOT_FOUND'
      };
    }
    return school;
  }

  /**
   * Get school by ID
   * @param {number} id - School ID
   * @returns {Promise<Object>} School data
   */
  async getSchoolById(id) {
    const school = await schoolRepository.findById(id);
    if (!school) {
      throw {
        status: 404,
        message: 'School not found',
        code: 'SCHOOL_NOT_FOUND'
      };
    }
    return school;
  }

  /**
   * Update school
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated school
   */
  async updateSchool(userId, updateData) {
    const school = await schoolRepository.findByUserId(userId);
    if (!school) {
      throw {
        status: 404,
        message: 'School not found',
        code: 'SCHOOL_NOT_FOUND'
      };
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.userId;
    delete updateData.registrationNumber;

    // Update school
    return await schoolRepository.updateSchool(school.id, updateData);
  }

  /**
   * Get all schools
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Schools list
   */
  async getAllSchools(options) {
    return await schoolRepository.findAll(options);
  }

  /**
   * Delete school
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Result
   */
  async deleteSchool(userId) {
    const school = await schoolRepository.findByUserId(userId);
    if (!school) {
      throw {
        status: 404,
        message: 'School not found',
        code: 'SCHOOL_NOT_FOUND'
      };
    }

    await schoolRepository.deleteSchool(school.id);
    return { message: 'School deleted successfully' };
  }

  /**
   * Get school statistics
   * @param {number} userId - User ID
   * @returns {Promise<Object>} Statistics
   */
  async getSchoolStats(userId) {
    const school = await this.getSchoolByUserId(userId);
    
    return {
      totalStudents: school.totalStudents || 0,
      totalTeachers: school.totalTeachers || 0,
      totalStaff: school.totalStaff || 0,
      totalCourses: school.totalCourses || 0,
      studentsPerClass: school.studentsPerClass || [],
      status: school.status
    };
  }

  /**
   * Validate school data
   * @param {Object} schoolData - School data
   * @returns {Object} Validation result
   */
  validateSchoolData(schoolData) {
    const errors = {};

    if (!schoolData.name || schoolData.name.trim().length < 2) {
      errors.name = 'School name must be at least 2 characters long';
    }

    if (!schoolData.type) {
      errors.type = 'School type is required';
    }

    if (!schoolData.registrationNumber) {
      errors.registrationNumber = 'Registration number is required';
    }

    if (!schoolData.licenseNumber) {
      errors.licenseNumber = 'License number is required';
    }

    if (!schoolData.tin) {
      errors.tin = 'TIN is required';
    }

    if (!schoolData.location) {
      errors.location = 'Location is required';
    }

    if (schoolData.email && !/\S+@\S+\.\S+/.test(schoolData.email)) {
      errors.email = 'Invalid email address';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new SchoolService();
