import axios from 'axios';

const API_URL = 'http://localhost:5000';

class SignupService {
  /**
   * Register a new user
   * @param {Object} userData - User registration data
   * @param {string} userData.name - User's name
   * @param {string} userData.school - School name
   * @param {string} userData.institute - Institute type
   * @param {string} userData.email - User's email
   * @param {string} userData.password - User's password
   * @returns {Promise<Object>} Response data
   */
  async signup(userData) {
    try {
      const response = await axios.post(
        `${API_URL}/api/signup/`,
        userData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      return {
        success: true,
        data: response.data,
        message: 'Signup successful',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Validate user data before sending to server
   * @param {Object} userData - User registration data
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
      errors,
    };
  }

  /**
   * Handle API errors
   * @param {Error} error - Axios error object
   * @returns {Object} Formatted error response
   */
  handleError(error) {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;
      
      if (status === 500) {
        return {
          success: false,
          error: 'USER_ALREADY_EXISTS',
          message: 'User already registered',
          redirectTo: '/dashboard',
        };
      }
      
      if (status === 400) {
        return {
          success: false,
          error: 'VALIDATION_ERROR',
          message: data.message || 'Invalid data provided',
          errors: data.errors || {},
        };
      }
      
      if (status === 409) {
        return {
          success: false,
          error: 'CONFLICT',
          message: data.message || 'Email already in use',
        };
      }
      
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: data.message || 'Server error occurred',
      };
    } else if (error.request) {
      // Request made but no response
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your connection.',
      };
    } else {
      // Something else happened
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  }

  /**
   * Get available institute types
   * @returns {Array} List of institute types
   */
  getInstituteTypes() {
    return [
      { value: '', label: 'Select your institute' },
      { value: 'Pre-Primary Schools (Nurseries/Kindergartens)', label: 'Pre-Primary Schools (Nurseries/Kindergartens)' },
      { value: 'Primary Schools', label: 'Primary Schools' },
      { value: 'Secondary Schools (O-Level and A-Level)', label: 'Secondary Schools (O-Level and A-Level)' },
      { value: 'Universities', label: 'Universities' },
      { value: 'Technical/Vocational Schools', label: 'Technical/Vocational Schools' },
      { value: 'Teacher Training Colleges', label: 'Teacher Training Colleges' },
      { value: 'Nursing/Midwifery Training Schools', label: 'Nursing/Midwifery Training Schools' },
      { value: 'Agricultural Institutes', label: 'Agricultural Institutes' },
      { value: 'Specialized Institutes', label: 'Specialized Institutes' },
    ];
  }
}

export default new SignupService();