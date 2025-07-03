import axios from 'axios';

const API_URL = 'http://localhost:5000';

class HomeService {
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
   * Get home page data (school info and statistics)
   * @returns {Promise<Object>} Home page data
   */
  async getHomeData() {
    try {
      // Check if user has a school first
      const hasSchool = await this.hasSchoolSetup();
      
      if (!hasSchool) {
        return {
          success: false,
          error: 'NOT_FOUND',
          message: 'No school profile found',
          requiresSetup: true
        };
      }

      // If school exists, fetch the data
      const schoolResponse = await axios.get(
        `${API_URL}/api/schools/my-school`,
        { headers: this.getAuthHeaders() }
      );

      const statsResponse = await axios.get(
        `${API_URL}/api/schools/stats`,
        { headers: this.getAuthHeaders() }
      );

      const school = schoolResponse.data.data;
      const stats = statsResponse.data.data;

      // Format the data for the home page
      return {
        success: true,
        data: {
          name: school.name,
          type: school.type,
          registrationNumber: school.registrationNumber,
          licenseNumber: school.licenseNumber,
          tin: school.tin,
          photo: school.photo ? `${API_URL}${school.photo}` : '/placeholder-school.jpg',
          headMaster: {
            name: school.headMaster?.head_master_name || 'Not assigned',
            photo: school.headMaster?.photo ? `${API_URL}${school.headMaster.photo}` : '/placeholder-user.jpg',
            age: school.headMaster?.head_master_age,
            nin: school.headMaster?.head_master_nin,
            educationLevel: school.headMaster?.head_master_educationLevel
          },
          totalCourses: stats.totalCourses || 0,
          totalStudents: stats.totalStudents || 0,
          totalTeachers: stats.totalTeachers || 0,
          totalStaff: stats.totalStaff || 0,
          studentsPerClass: stats.studentsPerClass || []
        }
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get dashboard statistics only
   * @returns {Promise<Object>} Statistics data
   */
  async getStatistics() {
    try {
      const response = await axios.get(
        `${API_URL}/api/schools/stats`,
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
          message: 'School data not found. Please complete your school profile.',
          requiresSetup: true
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
   * Format numbers with commas
   * @param {number} num - Number to format
   * @returns {string} Formatted number
   */
  formatNumber(num) {
    return new Intl.NumberFormat().format(num);
  }

  /**
   * Check if user has completed school setup
   * @returns {Promise<boolean>} Setup status
   */
  async hasSchoolSetup() {
    try {
      const response = await axios.get(
        `${API_URL}/api/schools/my-school`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.success && response.data.data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        return false;
      }
      throw error;
    }
  }
}

export default new HomeService();
