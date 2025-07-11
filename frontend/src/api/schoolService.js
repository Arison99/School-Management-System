import axios from 'axios';

const API_URL = 'http://localhost:6001';

class SchoolService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

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
   * Create a new school
   */
  async createSchool(schoolData) {
    try {
      const formData = new FormData();
      
      Object.keys(schoolData).forEach(key => {
        if (key === 'photo' && schoolData[key] instanceof File) {
          formData.append('photo', schoolData[key]);
        } else if (key === 'headMaster' || key === 'studentsPerClass') {
          formData.append(key, JSON.stringify(schoolData[key]));
        } else {
          formData.append(key, schoolData[key]);
        }
      });

      const response = await axios.post(
        `${API_URL}/api/schools`,
        formData,
        { headers: this.getFormDataHeaders() }
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
   * Get current user's school
   */
  async getMySchool() {
    try {
      const response = await axios.get(
        `${API_URL}/api/schools/my-school`,
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
   * Get school by ID
   */
  async getSchoolById(id) {
    try {
      const response = await axios.get(
        `${API_URL}/api/schools/${id}`,
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
   * Update school
   */
  async updateSchool(schoolData) {
    try {
      const formData = new FormData();
      
      Object.keys(schoolData).forEach(key => {
        if (key === 'photo' && schoolData[key] instanceof File) {
          formData.append('photo', schoolData[key]);
        } else if (key === 'headMaster' || key === 'studentsPerClass') {
          formData.append(key, JSON.stringify(schoolData[key]));
        } else if (schoolData[key] !== undefined && schoolData[key] !== null) {
          formData.append(key, schoolData[key]);
        }
      });

      const response = await axios.put(
        `${API_URL}/api/schools`,
        formData,
        { headers: this.getFormDataHeaders() }
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
   * Get all schools
   */
  async getAllSchools(options = {}) {
    try {
      const params = new URLSearchParams(options);
      const response = await axios.get(
        `${API_URL}/api/schools?${params}`,
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
   * Delete school
   */
  async deleteSchool() {
    try {
      const response = await axios.delete(
        `${API_URL}/api/schools`,
        { headers: this.getAuthHeaders() }
      );

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Get school statistics
   */
  async getSchoolStats() {
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
   * Validate school data
   */
  validateSchoolData(schoolData) {
    const errors = {};

    if (!schoolData.name || schoolData.name.trim().length < 2) {
      errors.name = 'School name must be at least 2 characters long';
    }

    if (!schoolData.type) {
      errors.type = 'School type is required';
    }

    if (!schoolData.registrationNumber) {
      errors.registrationNumber = 'Registration number is required';
    }

    if (!schoolData.licenseNumber) {
      errors.licenseNumber = 'License number is required';
    }

    if (!schoolData.tin) {
      errors.tin = 'TIN is required';
    }

    if (!schoolData.location) {
      errors.location = 'Location is required';
    }

    if (schoolData.email && !/\S+@\S+\.\S+/.test(schoolData.email)) {
      errors.email = 'Invalid email address';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Handle API errors
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
          error: 'SCHOOL_NOT_FOUND',
          message: 'No school profile found',
          requiresSetup: true
        };
      }
      
      return {
        success: false,
        error: data.code || 'SERVER_ERROR',
        message: data.message || 'Server error occurred',
        errors: data.errors || {}
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
   * Get school types
   */
  getSchoolTypes() {
    return [
      'Pre-Primary School',
      'Primary School',
      'Secondary School',
      'High School',
      'University',
      'Technical Institute',
      'Vocational School',
      'International School',
      'Special Education School',
      'Other'
    ];
  }
}

export default new SchoolService();
