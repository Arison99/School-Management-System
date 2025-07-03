import signupRepository from '../repositories/signupRepository.js';
import jwt from 'jsonwebtoken';

class SignupService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} Registration result
   */
  async registerUser(userData) {
    try {
      // Check if user already exists
      const existingUser = await signupRepository.userExists(userData.email);
      if (existingUser) {
        throw {
          status: 409,
          message: 'Email already in use',
          code: 'USER_EXISTS'
        };
      }

      // Create user
      const user = await signupRepository.createUser(userData);

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Return user data without password
      const userJSON = user.toJSON();
      delete userJSON.password;

      return {
        success: true,
        user: userJSON,
        token
      };
    } catch (error) {
      // Handle Sequelize unique constraint error
      if (error.name === 'SequelizeUniqueConstraintError') {
        throw {
          status: 409,
          message: 'Email already in use',
          code: 'DUPLICATE_EMAIL'
        };
      }
      // Handle Sequelize validation errors
      if (error.name === 'SequelizeValidationError') {
        const errors = {};
        error.errors.forEach(err => {
          errors[err.path] = err.message;
        });
        throw {
          status: 400,
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          errors
        };
      }
      throw error;
    }
  }

  /**
   * Generate JWT token
   * @param {string} userId - User ID
   * @returns {string} JWT token
   */
  generateToken(userId) {
    return jwt.sign(
      { userId },
      process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTE1MjM2NzgsImV4cCI6MTc1MTUyNzI3OH0.W7mD_cco3T55lnNQ59ND1GiwTQwV6hfNVKxihJjb4Mk',
      { expiresIn: '7d' }
    );
  }

  /**
   * Validate user data
   * @param {Object} userData - User data
   * @returns {Object} Validation result
   */
  validateUserData(userData) {
    const errors = {};

    if (!userData.name || userData.name.trim().length < 2) {
      errors.name = 'Name must be at least 2 characters long';
    }

    if (!userData.school || userData.school.trim().length < 2) {
      errors.school = 'School name is required';
    }

    if (!userData.institute) {
      errors.institute = 'Please select an institute type';
    }

    if (!userData.email || !/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!userData.password || userData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new SignupService();
