import School from '../models/schoolModel.js';

class SchoolRepository {
  /**
   * Create a new school
   * @param {Object} schoolData - School data
   * @returns {Promise<Object>} Created school
   */
  async createSchool(schoolData) {
    return await School.create(schoolData);
  }

  /**
   * Find school by ID
   * @param {number} id - School ID
   * @returns {Promise<Object|null>} School or null
   */
  async findById(id) {
    return await School.findByPk(id);
  }

  /**
   * Find school by user ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} School or null
   */
  async findByUserId(userId) {
    return await School.findOne({ 
      where: { userId }
    });
  }

  /**
   * Find school by registration number
   * @param {string} registrationNumber - Registration number
   * @returns {Promise<Object|null>} School or null
   */
  async findByRegistrationNumber(registrationNumber) {
    return await School.findOne({ 
      where: { registrationNumber } 
    });
  }

  /**
   * Update school
   * @param {number} id - School ID
   * @param {Object} updateData - Update data
   * @returns {Promise<Object>} Updated school
   */
  async updateSchool(id, updateData) {
    await School.update(updateData, { where: { id } });
    return await this.findById(id);
  }

  /**
   * Get all schools with pagination
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Schools and count
   */
  async findAll(options = {}) {
    const { page = 1, limit = 10, status, type } = options;
    const offset = (page - 1) * limit;
    
    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const { count, rows } = await School.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      schools: rows,
      total: count,
      page,
      totalPages: Math.ceil(count / limit)
    };
  }

  /**
   * Delete school
   * @param {number} id - School ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteSchool(id) {
    const result = await School.destroy({ where: { id } });
    return result > 0;
  }

  /**
   * Check if school exists
   * @param {Object} criteria - Search criteria
   * @returns {Promise<boolean>} True if exists
   */
  async exists(criteria) {
    const count = await School.count({ where: criteria });
    return count > 0;
  }
}

export default new SchoolRepository();
