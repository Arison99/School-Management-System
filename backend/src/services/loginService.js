import User from '../models/signupModel.js';
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
      const user = await User.findOne({
        where: { email: email.toLowerCase() }
      });

      if (!user) {
        throw {
          status: 401,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Compare password
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw {
          status: 401,
          message: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS'
        };
      }

      // Generate token
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
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    );
  }
}

export default new LoginService();
