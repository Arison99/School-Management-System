import jwt from 'jsonwebtoken';
import User from '../models/signupModel.js';
import School from '../models/schoolModel.js';

/**
 * Middleware to authenticate token
 */
export const authenticateToken = async (req, res, next) => {
  let token;

  // Check if token is provided in headers
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'No token provided, authorization denied'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user to request object
    req.user = await User.findByPk(decoded.userId || decoded.id, {
      attributes: { exclude: ['password'] }
    });

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'User not found, authorization denied'
      });
    }

    next();
  } catch (error) {
    console.error('Authentication middleware error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token, authorization denied'
    });
  }
};

/**
 * Middleware to ensure user has a school
 */
export const requireSchool = async (req, res, next) => {
  try {
    const school = await School.findOne({ where: { userId: req.user.id } });
    
    if (!school) {
      return res.status(403).json({
        success: false,
        message: 'School profile required. Please create your school profile first.',
        code: 'SCHOOL_REQUIRED'
      });
    }

    req.school = school;
    next();
  } catch (error) {
    console.error('RequireSchool middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Alias for backward compatibility
export const isAuthenticated = authenticateToken;