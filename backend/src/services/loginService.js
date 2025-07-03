import signupRepository from '../repositories/signupRepository.js';
import jwt from 'jsonwebtoken';

class LoginService {
  /**
   * Authenticate user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication result
   */
  async authenticateUser(email, password) {
    try {
      // Find user by email
      const user = await signupRepository.findUserByEmail(email);

      if (!user) {
        throw {
          status: 404,
          message: 'User not found',
          code: 'USER_NOT_FOUND'
        };
      }

      // Verify password
      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Generate JWT token
      const token = this.generateToken(user.id);

      // Return user data without password
      const userJSON = user.toJSON();
      delete userJSON.password;

      return {
        user: userJSON,
        token
      };
    } catch (error) {
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
   * Verify JWT token
   * @param {string} token - JWT token
   * @returns {Object} Decoded token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || 'cret-key');
    } catch (error) {
      throw {
        status: 401,
        message: 'Invalid or expired token',
        code: 'INVALID_TOKEN'
      };
    }
  }
}

export default new LoginService();
