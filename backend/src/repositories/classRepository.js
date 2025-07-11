import Class from '../models/classModel.js';
import Student from '../models/studentModel.js';

class ClassRepository {
  /**
   * Create a new class
   */
  async createClass(classData) {
    return await Class.create(classData);
  }

  /**
   * Find all classes for a school
   */
  async findClassesBySchoolId(schoolId, options = {}) {
    const { 
      includeStudents = false, 
      status = null,
      limit = null,
      offset = null
    } = options;

    const query = {
      where: { schoolId },
      order: [['year', 'DESC'], ['className', 'ASC']]
    };

    if (status) {
      query.where.status = status;
    }

    if (includeStudents) {
      query.include = [{
        model: Student,
        as: 'students',
        required: false
      }];
    }

    if (limit) {
      query.limit = limit;
      query.offset = offset || 0;
    }

    return await Class.findAll(query);
  }

  /**
   * Find class by ID
   */
  async findClassById(id, includeStudents = false) {
    const query = {
      where: { id }
    };

    if (includeStudents) {
      query.include = [{
        model: Student,
        as: 'students',
        required: false
      }];
    }

    return await Class.findOne(query);
  }

  /**
   * Update class
   */
  async updateClass(id, updateData) {
    await Class.update(updateData, {
      where: { id }
    });
    
    // Fetch and return the updated class
    return await this.findClassById(id);
  }

  /**
   * Delete class
   */
  async deleteClass(id) {
    return await Class.destroy({ where: { id } });
  }

  /**
   * Count classes by school
   */
  async countClassesBySchool(schoolId) {
    return await Class.count({ where: { schoolId } });
  }

  /**
   * Check if class exists
   */
  async classExists(schoolId, className, year) {
    const count = await Class.count({
      where: { schoolId, className, year }
    });
    return count > 0;
  }
}

export default new ClassRepository();
