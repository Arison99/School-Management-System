import studentService from '../services/studentService.js';

class StudentController {
  /**
   * Get all students in school
   */
  async getAllStudents(req, res) {
    try {
      const schoolId = req.school.id;
      
      const students = await studentService.getAllStudentsBySchool(schoolId);

      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Search students
   */
  async searchStudents(req, res) {
    try {
      const schoolId = req.school.id;
      const { q } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const students = await studentService.searchStudents(schoolId, q);

      res.json({
        success: true,
        data: students
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors
   */
  handleError(error, res) {
    console.error('Student controller error:', error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

export default new StudentController();
