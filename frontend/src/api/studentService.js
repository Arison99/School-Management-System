import axios from 'axios';

const API_URL = 'http://localhost:6001';

class StudentService {
  /**
   * Get authorization headers
   */
  getAuthHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Get form data headers for file upload
   */
  getFormDataHeaders() {
    const token = localStorage.getItem('authToken');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data'
    };
  }

  /**
   * Get all classes for the current school
   * @returns {Promise<Object>} Response with classes data
   */
  async getAllClasses() {
    try {
      const response = await axios.get(
        `${API_URL}/api/classes`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get a specific class by ID
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Response with class data
   */
  async getClassById(classId) {
    try {
      const response = await axios.get(
        `${API_URL}/api/classes/${classId}`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Create a new class
   * @param {Object} classData - Class data
   * @returns {Promise<Object>} Response with created class
   */
  async createClass(classData) {
    try {
      const formData = new FormData();
      
      // Append class data
      Object.keys(classData).forEach(key => {
        if (key === 'photo' && classData[key] instanceof File) {
          formData.append('photo', classData[key]);
        } else if (classData[key] !== null && classData[key] !== undefined) {
          formData.append(key, classData[key]);
        }
      });

      const response = await axios.post(
        `${API_URL}/api/classes`,
        formData,
        { headers: this.getFormDataHeaders() }
      );

      return {
        success: true,
        data: response.data.data,
        message: 'Class created successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a class
   * @param {number} classId - Class ID
   * @param {Object} classData - Updated class data
   * @returns {Promise<Object>} Response with updated class
   */
  async updateClass(classId, classData) {
    try {
      const formData = new FormData();
      
      // Append updated data
      Object.keys(classData).forEach(key => {
        if (key === 'photo' && classData[key] instanceof File) {
          formData.append('photo', classData[key]);
        } else if (key === 'students' && Array.isArray(classData[key])) {
          formData.append('students', JSON.stringify(classData[key]));
        } else if (classData[key] !== null && classData[key] !== undefined) {
          formData.append(key, classData[key]);
        }
      });

      const response = await axios.put(
        `${API_URL}/api/classes/${classId}`,
        formData,
        { headers: this.getFormDataHeaders() }
      );

      return {
        success: true,
        data: response.data.data,
        message: 'Class updated successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a class
   * @param {number} classId - Class ID
   * @returns {Promise<Object>} Response
   */
  async deleteClass(classId) {
    try {
      await axios.delete(
        `${API_URL}/api/classes/${classId}`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        message: 'Class deleted successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Add a student to a class
   * @param {number} classId - Class ID
   * @param {Object} studentData - Student data
   * @returns {Promise<Object>} Response with updated class
   */
  async addStudentToClass(classId, studentData) {
    try {
      const formData = new FormData();
      
      // Append student data
      Object.keys(studentData).forEach(key => {
        if (key === 'photo' && studentData[key] instanceof File) {
          formData.append('photo', studentData[key]);
        } else if (studentData[key] !== null && studentData[key] !== undefined) {
          formData.append(key, studentData[key]);
        }
      });

      const response = await axios.post(
        `${API_URL}/api/classes/${classId}/students`,
        formData,
        { headers: this.getFormDataHeaders() }
      );

      return {
        success: true,
        data: response.data.data,
        message: 'Student added successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Update a student in a class
   * @param {number} classId - Class ID
   * @param {number} studentId - Student ID
   * @param {Object} studentData - Updated student data
   * @returns {Promise<Object>} Response with updated student
   */
  async updateStudent(classId, studentId, studentData) {
    try {
      const formData = new FormData();
      
      // Append updated student data
      Object.keys(studentData).forEach(key => {
        if (key === 'photo' && studentData[key] instanceof File) {
          formData.append('photo', studentData[key]);
        } else if (studentData[key] !== null && studentData[key] !== undefined) {
          formData.append(key, studentData[key]);
        }
      });

      const response = await axios.put(
        `${API_URL}/api/classes/${classId}/students/${studentId}`,
        formData,
        { headers: this.getFormDataHeaders() }
      );

      return {
        success: true,
        data: response.data.data,
        message: 'Student updated successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Delete a student from a class
   * @param {number} classId - Class ID
   * @param {number} studentId - Student ID
   * @returns {Promise<Object>} Response
   */
  async deleteStudent(classId, studentId) {
    try {
      await axios.delete(
        `${API_URL}/api/classes/${classId}/students/${studentId}`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        message: 'Student deleted successfully'
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get all students across all classes
   * @returns {Promise<Object>} Response with students data
   */
  async getAllStudents() {
    try {
      const response = await axios.get(
        `${API_URL}/api/students`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Search students
   * @param {string} query - Search query
   * @returns {Promise<Object>} Response with search results
   */
  async searchStudents(query) {
    try {
      const response = await axios.get(
        `${API_URL}/api/students/search?q=${encodeURIComponent(query)}`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        data: response.data.data || []
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate class data
   * @param {Object} classData - Class data
   * @returns {Object} Validation result
   */
  validateClassData(classData) {
    const errors = {};

    if (!classData.className || classData.className.trim().length < 2) {
      errors.className = 'Class name must be at least 2 characters long';
    }

    if (!classData.year || !/^\d{4}$/.test(classData.year)) {
      errors.year = 'Please enter a valid year (e.g., 2024)';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate student data
   * @param {Object} studentData - Student data
   * @returns {Object} Validation result
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

    if (!studentData.age || studentData.age < 1 || studentData.age > 100) {
      errors.age = 'Please enter a valid age';
    }

    if (!studentData.fatherName || studentData.fatherName.trim().length < 2) {
      errors.fatherName = 'Father name must be at least 2 characters long';
    }

    if (!studentData.motherName || studentData.motherName.trim().length < 2) {
      errors.motherName = 'Mother name must be at least 2 characters long';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @returns {Object} Formatted error response
   */
  handleError(error) {
    if (error.response) {
      const { status, data } = error.response;
      
      if (status === 401) {
        // Clear auth data and redirect to login
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
        window.location.href = '/login';
        return {
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Session expired. Please login again.'
        };
      }
      
      if (status === 404) {
        return {
          success: false,
          error: 'NOT_FOUND',
          message: data.message || 'Resource not found'
        };
      }

      if (status === 400) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: data.message || 'Invalid data provided',
          errors: data.errors || {}
        };
      }
      
      return {
        success: false,
        error: data.code || 'SERVER_ERROR',
        message: data.message || 'Server error occurred'
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your connection.'
      };
    } else {
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred'
      };
    }
  }

  /**
   * Format student data for display
   * @param {Object} student - Student object
   * @returns {Object} Formatted student data
   */
  formatStudentData(student) {
    return {
      ...student,
      age: student.age || this.calculateAge(student.dob),
      photoUrl: student.photo ? `${API_URL}${student.photo}` : null
    };
  }

  /**
   * Calculate age from date of birth
   * @param {string} dob - Date of birth
   * @returns {number} Age
   */
  calculateAge(dob) {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }
}

export default new StudentService();
