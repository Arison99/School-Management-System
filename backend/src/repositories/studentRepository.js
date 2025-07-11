import Student from '../models/studentModel.js';
import Class from '../models/classModel.js';
import { Op } from 'sequelize';

class StudentRepository {
  /**
   * Create a new student
   */
  async createStudent(studentData) {
    return await Student.create(studentData);
  }

  /**
   * Find all students in a class
   */
  async findStudentsByClassId(classId) {
    return await Student.findAll({
      where: { classId },
      order: [['studentNumber', 'ASC']]
    });
  }

  /**
   * Find student by ID
   */
  async findStudentById(id) {
    return await Student.findOne({
      where: { id },
      include: [{
        model: Class,
        as: 'class'
      }]
    });
  }

  /**
   * Find all students in a school
   */
  async findStudentsBySchoolId(schoolId) {
    return await Student.findAll({
      include: [{
        model: Class,
        as: 'class',
        where: { schoolId },
        required: true
      }],
      order: [['studentNumber', 'ASC']]
    });
  }

  /**
   * Update student
   */
  async updateStudent(id, updateData) {
    await Student.update(updateData, {
      where: { id }
    });
    
    // Fetch and return the updated student
    return await this.findStudentById(id);
  }

  /**
   * Delete student
   */
  async deleteStudent(id) {
    return await Student.destroy({ where: { id } });
  }

  /**
   * Search students
   */
  async searchStudents(schoolId, query) {
    return await Student.findAll({
      where: {
        [Op.or]: [
          { studentNumber: { [Op.like]: `%${query}%` } },
          { studentName: { [Op.like]: `%${query}%` } },
          { fatherName: { [Op.like]: `%${query}%` } },
          { motherName: { [Op.like]: `%${query}%` } }
        ]
      },
      include: [{
        model: Class,
        as: 'class',
        where: { schoolId },
        required: true
      }],
      order: [['studentName', 'ASC']]
    });
  }

  /**
   * Count students in a class
   */
  async countStudentsByClass(classId) {
    return await Student.count({ where: { classId } });
  }

  /**
   * Check if student number exists
   */
  async studentNumberExists(studentNumber) {
    const count = await Student.count({
      where: { studentNumber }
    });
    return count > 0;
  }
}

export default new StudentRepository();
