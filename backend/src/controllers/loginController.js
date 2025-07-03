import loginService from '../services/loginService.js';

class LoginController {
  /**
   * Handle user login
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   */
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required',
          errors: {
            email: !email ? 'Email is required' : undefined,
            password: !password ? 'Password is required' : undefined,
          }
        });
      }

      // Attempt login
      const result = await loginService.authenticateUser(email, password);

      res.status(200).json({
        success: true,
        message: 'Login successful',
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
    console.error('Login error:', error);

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
    });
  }
}

export default new LoginController();
