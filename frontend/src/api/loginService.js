import axios from 'axios';

const API_URL = 'http://localhost:5000';

class LoginService {
  /**
   * Login user
   * @param {Object} credentials - User login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   * @returns {Promise<Object>} Response data
   */
  async login(credentials) {
    try {
      const response = await axios.post(
        `${API_URL}/api/login`,
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      // Store token if login successful
      if (response.data.success && response.data.data.token) {
        localStorage.setItem('authToken', response.data.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.data.user));
        localStorage.setItem('isAuthenticated', 'true');
      }

      return {
        success: true,
        data: response.data.data,
        message: 'Login successful',
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Logout user
   */
  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('isAuthenticated');
  }

  /**
   * Get current user
   * @returns {Object|null} Current user data
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  /**
   * Get auth token
   * @returns {string|null} Auth token
   */
  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    return localStorage.getItem('isAuthenticated') === 'true' && !!this.getToken();
  }

  /**
   * Validate login credentials
   * @param {Object} credentials - Login credentials
   * @returns {Object} Validation result
   */
  validateCredentials(credentials) {
    const errors = {};

    if (!credentials.email || !/\S+@\S+\.\S+/.test(credentials.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!credentials.password) {
      errors.password = 'Password is required';
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
      const { status, data } = error.response;
      
      if (status === 401) {
        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          message: data.message || 'Invalid email or password',
        };
      }
      
      if (status === 404) {
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          message: data.message || 'User not found',
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
      
      return {
        success: false,
        error: 'SERVER_ERROR',
        message: data.message || 'Server error occurred',
      };
    } else if (error.request) {
      return {
        success: false,
        error: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your connection.',
      };
    } else {
      return {
        success: false,
        error: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      };
    }
  }
}

export default new LoginService();
