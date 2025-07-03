import signupService from '../services/signupService.js';

class SignupController {
  /**
   * Handle user registration
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async signup(req, res) {
    try {
      const { name, school, institute, email, password } = req.body;

      // Validate input
      const validation = signupService.validateUserData(req.body);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validation.errors
        });
      }

      // Register user
      const result = await signupService.registerUser({
        name,
        school,
        institute,
        email,
        password
      });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      this.handleError(error, res);
    }
  }

  /**
   * Handle errors
   * @param {Error} error - Error object
   * @param {Object} res - Express response
   */
  handleError(error, res) {
    console.error('Signup error:', error);

    if (error.status) {
      return res.status(error.status).json({
        success: false,
        message: error.message,
        code: error.code
      });
    }

    if (error.name === 'ValidationError') {
      const errors = {};
      Object.keys(error.errors).forEach(key => {
        errors[key] = error.errors[key].message;
      });
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error, contact support',
    });
  }
}

export default new SignupController();
