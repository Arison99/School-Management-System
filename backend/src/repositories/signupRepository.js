import User from '../models/signupModel.js';

class SignupRepository {
  /**
   * Create a new user
   * @param {Object} userData - User data
   * @returns {Promise<Object>} Created user
   */
  async createUser(userData) {
    return await User.create(userData);
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User or null
   */
  async findUserByEmail(email) {
    return await User.findOne({ 
      where: { 
        email: email.toLowerCase() 
      } 
    });
  }

  /**
   * Check if user exists
   * @param {string} email - User email
   * @returns {Promise<boolean>} True if exists
   */
  async userExists(email) {
    const count = await User.count({ 
      where: { 
        email: email.toLowerCase() 
      } 
    });
    return count > 0;
  }
}

export default new SignupRepository();
