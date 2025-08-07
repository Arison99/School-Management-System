# 🔐 Security Guide

## Table of Contents

- [Overview](#overview)
- [Authentication & Authorization](#authentication--authorization)
- [Data Protection](#data-protection)
- [Input Validation & Sanitization](#input-validation--sanitization)
- [File Upload Security](#file-upload-security)
- [Database Security](#database-security)
- [API Security](#api-security)
- [Frontend Security](#frontend-security)
- [Infrastructure Security](#infrastructure-security)
- [Security Best Practices](#security-best-practices)
- [Vulnerability Management](#vulnerability-management)
- [Compliance & Privacy](#compliance--privacy)
- [Security Monitoring](#security-monitoring)
- [Incident Response](#incident-response)

## Overview

Security is a critical aspect of the School Management System. This guide outlines the comprehensive security measures implemented to protect student data, institutional information, and system integrity.

### Security Principles

- **Defense in Depth**: Multiple layers of security controls
- **Least Privilege**: Minimum necessary access rights
- **Zero Trust**: Verify everything, trust nothing
- **Data Privacy**: Protect personal and sensitive information
- **Compliance Ready**: Adherence to educational data regulations

### Security Framework

```
┌─────────────────────────────────────────────────────────┐
│                    Application Security                 │
├─────────────────────────────────────────────────────────┤
│                    Data Security                        │
├─────────────────────────────────────────────────────────┤
│                  Network Security                       │
├─────────────────────────────────────────────────────────┤
│               Infrastructure Security                   │
└─────────────────────────────────────────────────────────┘
```

## Authentication & Authorization

### JWT Token-Based Authentication

#### Token Structure
```javascript
// JWT Header
{
  "alg": "HS256",
  "typ": "JWT"
}

// JWT Payload
{
  "userId": 123,
  "email": "user@example.com",
  "iat": 1641234567,
  "exp": 1641839367
}

// JWT Signature (HMAC SHA256)
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

#### Token Security Features

1. **Secure Secret**: 256-bit cryptographically secure random secret
2. **Expiration**: Tokens expire after 7 days
3. **Stateless**: No server-side session storage required
4. **Tamper-Proof**: Cryptographic signature prevents tampering

#### Implementation
```javascript
// Token generation
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { 
      expiresIn: '7d',
      algorithm: 'HS256'
    }
  );
};

// Token verification middleware
const authMiddleware = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};
```

### Role-Based Access Control (RBAC)

#### Role Definitions
```javascript
const roles = {
  ADMIN: {
    permissions: [
      'school:create', 'school:read', 'school:update', 'school:delete',
      'class:create', 'class:read', 'class:update', 'class:delete',
      'student:create', 'student:read', 'student:update', 'student:delete',
      'user:manage'
    ]
  },
  TEACHER: {
    permissions: [
      'class:read', 'class:update',
      'student:create', 'student:read', 'student:update'
    ]
  },
  VIEWER: {
    permissions: [
      'school:read', 'class:read', 'student:read'
    ]
  }
};
```

#### Authorization Middleware
```javascript
const authorize = (permission) => {
  return (req, res, next) => {
    const userRole = req.user.role || 'VIEWER';
    const userPermissions = roles[userRole]?.permissions || [];
    
    if (!userPermissions.includes(permission)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

// Usage in routes
app.put('/schools', authMiddleware, authorize('school:update'), schoolController.update);
```

### Session Security

#### Secure Token Storage
```javascript
// Frontend token storage (client-side)
class TokenManager {
  static setToken(token) {
    // Store in httpOnly cookie for maximum security (recommended)
    // or localStorage for simplicity (current implementation)
    localStorage.setItem('authToken', token);
  }
  
  static getToken() {
    return localStorage.getItem('authToken');
  }
  
  static removeToken() {
    localStorage.removeItem('authToken');
  }
  
  static isTokenExpired(token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  }
}
```

## Data Protection

### Password Security

#### Password Hashing
```javascript
const bcrypt = require('bcrypt');

// Password hashing during registration
const hashPassword = async (password) => {
  const saltRounds = 12; // High salt rounds for better security
  return await bcrypt.hash(password, saltRounds);
};

// Password verification during login
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Password strength validation
const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  return {
    isValid: password.length >= minLength && hasUpperCase && 
             hasLowerCase && hasNumbers && hasSpecialChar,
    requirements: {
      minLength: password.length >= minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumbers,
      hasSpecialChar
    }
  };
};
```

#### Password Policy
- **Minimum Length**: 8 characters
- **Complexity**: Must include uppercase, lowercase, numbers, and special characters
- **History**: Cannot reuse last 5 passwords
- **Expiration**: Recommend changing every 90 days
- **Lockout**: Account locked after 5 failed attempts

### Data Encryption

#### Environment Variables Security
```bash
# .env file (never commit to repository)
JWT_SECRET=your-super-secure-256-bit-secret-key-here
DB_ENCRYPTION_KEY=your-database-encryption-key
API_RATE_LIMIT=100
SESSION_SECRET=your-session-secret
```

#### Sensitive Data Handling
```javascript
// Encrypt sensitive fields before database storage
const crypto = require('crypto');

const encryptSensitiveData = (data) => {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.DB_ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  cipher.setAAD(Buffer.from('school-management', 'utf8'));
  
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex')
  };
};
```

### Personal Data Protection

#### GDPR/FERPA Compliance Features
```javascript
// Data anonymization for GDPR right to be forgotten
const anonymizeStudentData = async (studentId) => {
  return await Student.update({
    studentName: 'ANONYMIZED',
    fatherName: 'ANONYMIZED',
    motherName: 'ANONYMIZED',
    address: 'ANONYMIZED',
    phoneNumber: 'ANONYMIZED',
    email: 'ANONYMIZED',
    photo: null,
    anonymized: true,
    anonymizedAt: new Date()
  }, {
    where: { id: studentId }
  });
};

// Data export for GDPR data portability
const exportStudentData = async (studentId) => {
  const student = await Student.findByPk(studentId, {
    include: [{ model: Class, as: 'class' }]
  });
  
  return {
    personalData: {
      name: student.studentName,
      dateOfBirth: student.dob,
      guardians: {
        father: student.fatherName,
        mother: student.motherName
      },
      contact: {
        address: student.address,
        phone: student.phoneNumber,
        email: student.email
      }
    },
    academicData: {
      class: student.class.className,
      year: student.class.year,
      studentNumber: student.studentNumber,
      enrollmentDate: student.createdAt
    },
    exportDate: new Date().toISOString()
  };
};
```

## Input Validation & Sanitization

### Server-Side Validation

#### Express Validator Implementation
```javascript
const { body, validationResult } = require('express-validator');

// Validation rules for student creation
const studentValidationRules = () => {
  return [
    body('studentName')
      .trim()
      .isLength({ min: 2, max: 100 })
      .matches(/^[a-zA-Z\s]+$/)
      .withMessage('Student name must contain only letters and spaces'),
    
    body('studentNumber')
      .trim()
      .isAlphanumeric()
      .isLength({ min: 3, max: 20 })
      .withMessage('Student number must be 3-20 alphanumeric characters'),
    
    body('email')
      .optional()
      .isEmail()
      .normalizeEmail()
      .withMessage('Must be a valid email address'),
    
    body('phoneNumber')
      .optional()
      .isMobilePhone()
      .withMessage('Must be a valid phone number'),
    
    body('dob')
      .isISO8601()
      .toDate()
      .custom((value) => {
        const age = Math.floor((Date.now() - value.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age < 3 || age > 25) {
          throw new Error('Student age must be between 3 and 25 years');
        }
        return true;
      })
  ];
};

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().reduce((acc, error) => {
        acc[error.param] = error.msg;
        return acc;
      }, {})
    });
  }
  
  next();
};
```

#### XSS Prevention
```javascript
const xss = require('xss');

// XSS sanitization middleware
const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = xss(obj[key]);
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };
  
  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);
  
  next();
};
```

### SQL Injection Prevention

#### Sequelize ORM Protection
```javascript
// Secure query using Sequelize ORM (automatic parameterization)
const searchStudents = async (query) => {
  return await Student.findAll({
    where: {
      studentName: {
        [Op.iLike]: `%${query}%` // Sequelize automatically escapes parameters
      }
    },
    include: [{
      model: Class,
      as: 'class',
      where: {
        status: 'active'
      }
    }]
  });
};

// Raw query with manual parameterization (when needed)
const customQuery = async (studentId) => {
  return await sequelize.query(
    'SELECT * FROM students WHERE id = :studentId AND status = :status',
    {
      replacements: { studentId, status: 'active' },
      type: QueryTypes.SELECT
    }
  );
};
```

## File Upload Security

### Secure File Upload Configuration

#### Multer Security Settings
```javascript
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

// Allowed file types
const allowedMimeTypes = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp'
];

// File size limits (5MB for images)
const fileLimits = {
  fileSize: 5 * 1024 * 1024, // 5MB
  files: 1 // Only one file at a time
};

// Secure filename generation
const generateSecureFilename = (originalname) => {
  const ext = path.extname(originalname);
  const timestamp = Date.now();
  const randomBytes = crypto.randomBytes(8).toString('hex');
  return `${timestamp}-${randomBytes}${ext}`;
};

// Secure storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../uploads', req.uploadType);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const secureFilename = generateSecureFilename(file.originalname);
    cb(null, secureFilename);
  }
});

// File filter for security
const fileFilter = (req, file, cb) => {
  // Check MIME type
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type. Only images are allowed.'), false);
  }
  
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new Error('Invalid file extension.'), false);
  }
  
  cb(null, true);
};

// Multer configuration
const upload = multer({
  storage,
  fileFilter,
  limits: fileLimits
});
```

#### File Virus Scanning
```javascript
const clamscan = require('clamscan');

// Initialize ClamAV scanner (optional but recommended)
const initVirusScanner = async () => {
  try {
    return await new clamscan().init({
      removeInfected: true,
      quarantineInfected: './quarantine/',
      scanLog: './logs/clamscan.log',
      debugMode: false
    });
  } catch (err) {
    console.warn('Virus scanner not available:', err.message);
    return null;
  }
};

// Virus scanning middleware
const scanUploadedFile = async (req, res, next) => {
  if (!req.file) return next();
  
  const scanner = await initVirusScanner();
  if (!scanner) return next(); // Skip if scanner not available
  
  try {
    const scanResult = await scanner.isInfected(req.file.path);
    
    if (scanResult.isInfected) {
      // Remove infected file
      fs.unlinkSync(req.file.path);
      
      return res.status(400).json({
        success: false,
        message: 'File is infected and has been rejected'
      });
    }
    
    next();
  } catch (error) {
    console.error('Virus scan error:', error);
    next(); // Continue if scan fails
  }
};
```

### Image Processing Security

#### Safe Image Processing
```javascript
const sharp = require('sharp');

// Secure image processing
const processUploadedImage = async (filePath) => {
  try {
    const metadata = await sharp(filePath).metadata();
    
    // Validate image properties
    if (metadata.width > 4000 || metadata.height > 4000) {
      throw new Error('Image dimensions too large');
    }
    
    // Strip EXIF data and resize if needed
    const processedImagePath = filePath.replace(/(\.[^.]+)$/, '-processed$1');
    
    await sharp(filePath)
      .resize(800, 600, { 
        fit: 'inside',
        withoutEnlargement: true 
      })
      .jpeg({ 
        quality: 85,
        progressive: true 
      })
      .removeExif() // Remove potentially dangerous EXIF data
      .toFile(processedImagePath);
    
    // Replace original with processed image
    fs.unlinkSync(filePath);
    fs.renameSync(processedImagePath, filePath);
    
    return true;
  } catch (error) {
    console.error('Image processing error:', error);
    throw new Error('Invalid image file');
  }
};
```

## Database Security

### Connection Security

#### Secure Database Configuration
```javascript
// Secure Sequelize configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: process.env.DB_PATH || './school.db',
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  
  // Security options
  dialectOptions: {
    // Enable foreign key constraints
    foreignKeys: true,
    
    // SQLite specific security options
    options: {
      encrypt: true, // Enable database encryption if supported
      trustServerCertificate: false
    }
  },
  
  // Connection pool settings
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  
  // Query options
  define: {
    // Prevent mass assignment vulnerabilities
    underscored: true,
    paranoid: true, // Soft deletes
    timestamps: true,
    
    // Default scopes for data protection
    defaultScope: {
      attributes: {
        exclude: ['deletedAt'] // Hide soft-deleted records
      }
    }
  },
  
  // Disable dangerous features
  benchmark: false,
  operatorsAliases: false
});
```

### Data Access Security

#### Repository Pattern with Security
```javascript
class SecureStudentRepository {
  async findById(id, userId) {
    // Ensure user can only access their own school's data
    return await Student.findOne({
      where: { id },
      include: [{
        model: Class,
        as: 'class',
        include: [{
          model: School,
          as: 'school',
          where: { userId } // Security filter
        }]
      }]
    });
  }
  
  async create(studentData, userId) {
    // Validate ownership before creation
    const classData = await Class.findOne({
      where: { id: studentData.classId },
      include: [{
        model: School,
        as: 'school',
        where: { userId }
      }]
    });
    
    if (!classData) {
      throw new Error('Unauthorized: Cannot add student to this class');
    }
    
    return await Student.create(studentData);
  }
  
  async update(id, updateData, userId) {
    // Ensure user owns the student's school
    const student = await this.findById(id, userId);
    
    if (!student) {
      throw new Error('Student not found or unauthorized');
    }
    
    return await student.update(updateData);
  }
}
```

### Database Auditing

#### Audit Trail Implementation
```javascript
// Audit log model
const AuditLog = sequelize.define('AuditLog', {
  tableName: DataTypes.STRING,
  recordId: DataTypes.INTEGER,
  action: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
  oldValues: DataTypes.JSON,
  newValues: DataTypes.JSON,
  userId: DataTypes.INTEGER,
  ipAddress: DataTypes.STRING,
  userAgent: DataTypes.STRING,
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
});

// Audit middleware
const createAuditLog = async (action, model, record, req) => {
  try {
    await AuditLog.create({
      tableName: model.tableName,
      recordId: record.id,
      action,
      oldValues: record._previousDataValues || null,
      newValues: record.dataValues || null,
      userId: req.user?.userId,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
};

// Model hooks for automatic auditing
Student.addHook('afterCreate', async (record, options) => {
  await createAuditLog('CREATE', Student, record, options.req);
});

Student.addHook('afterUpdate', async (record, options) => {
  await createAuditLog('UPDATE', Student, record, options.req);
});

Student.addHook('afterDestroy', async (record, options) => {
  await createAuditLog('DELETE', Student, record, options.req);
});
```

## API Security

### Rate Limiting

#### Express Rate Limiting
```javascript
const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('redis');

// Redis client for distributed rate limiting
const redisClient = Redis.createClient({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379
});

// General API rate limiting
const apiLimiter = rateLimit({
  store: new RedisStore({
    client: redisClient,
    prefix: 'rl:api:'
  }),
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  
  // Custom key generator (could include user ID)
  keyGenerator: (req) => {
    return req.user?.userId ? `user:${req.user.userId}` : req.ip;
  }
});

// Strict rate limiting for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Only 5 login attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.'
  },
  skipSuccessfulRequests: true
});

// Apply rate limiting
app.use('/api/', apiLimiter);
app.use('/api/login', authLimiter);
app.use('/api/signup', authLimiter);
```

### CORS Security

#### Secure CORS Configuration
```javascript
const cors = require('cors');

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests from specific origins
    const allowedOrigins = [
      'http://localhost:5173', // Development frontend
      'https://yourdomain.com', // Production frontend
      'https://www.yourdomain.com'
    ];
    
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Origin',
    'X-Requested-With',
    'Content-Type',
    'Accept',
    'Authorization'
  ],
  credentials: true, // Allow cookies
  maxAge: 86400 // Cache preflight response for 24 hours
};

app.use(cors(corsOptions));
```

### Security Headers

#### Helmet.js Implementation
```javascript
const helmet = require('helmet');

app.use(helmet({
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'", "http://localhost:6001"], // API endpoint
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  
  // HTTP Strict Transport Security
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  
  // Prevent clickjacking
  frameguard: { action: 'deny' },
  
  // Prevent MIME type sniffing
  noSniff: true,
  
  // Disable X-Powered-By header
  hidePoweredBy: true,
  
  // Referrer Policy
  referrerPolicy: { policy: 'same-origin' }
}));
```

## Frontend Security

### Secure Token Management

#### Frontend Security Best Practices
```javascript
// Secure API client
class SecureAPIClient {
  constructor() {
    this.baseURL = process.env.VITE_API_BASE_URL || 'http://localhost:6001/api';
    this.token = this.getStoredToken();
    
    // Set up axios interceptors for security
    this.setupInterceptors();
  }
  
  setupInterceptors() {
    // Request interceptor
    axios.interceptors.request.use(
      (config) => {
        // Add CSRF token if available
        const csrfToken = this.getCSRFToken();
        if (csrfToken) {
          config.headers['X-CSRF-Token'] = csrfToken;
        }
        
        // Add authentication token
        if (this.token) {
          config.headers.Authorization = `Bearer ${this.token}`;
        }
        
        return config;
      },
      (error) => Promise.reject(error)
    );
    
    // Response interceptor for handling auth errors
    axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.handleUnauthorized();
        }
        return Promise.reject(error);
      }
    );
  }
  
  getStoredToken() {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      console.error('Error accessing localStorage:', error);
      return null;
    }
  }
  
  setToken(token) {
    try {
      localStorage.setItem('authToken', token);
      this.token = token;
    } catch (error) {
      console.error('Error storing token:', error);
    }
  }
  
  removeToken() {
    try {
      localStorage.removeItem('authToken');
      this.token = null;
    } catch (error) {
      console.error('Error removing token:', error);
    }
  }
  
  handleUnauthorized() {
    this.removeToken();
    window.location.href = '/login';
  }
}
```

### XSS Prevention

#### Content Sanitization
```javascript
import DOMPurify from 'dompurify';

// Sanitize user-generated content
const sanitizeHTML = (dirty) => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  });
};

// Safe component for rendering user content
const SafeHTML = ({ content, className }) => {
  const sanitizedContent = sanitizeHTML(content);
  
  return (
    <div 
      className={className}
      dangerouslySetInnerHTML={{ __html: sanitizedContent }}
    />
  );
};

// Input validation hook
const useSecureInput = (initialValue = '') => {
  const [value, setValue] = useState(initialValue);
  
  const handleChange = (event) => {
    const inputValue = event.target.value;
    
    // Basic XSS prevention
    const sanitizedValue = inputValue
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
    
    setValue(sanitizedValue);
  };
  
  return [value, handleChange];
};
```

### Secure Routing

#### Protected Routes Implementation
```javascript
import { Navigate } from 'react-router-dom';

// Protected route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('authToken');
  const [isValidToken, setIsValidToken] = useState(null);
  
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsValidToken(false);
        return;
      }
      
      try {
        // Verify token with backend
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        setIsValidToken(response.ok);
      } catch (error) {
        console.error('Token validation error:', error);
        setIsValidToken(false);
      }
    };
    
    validateToken();
  }, [token]);
  
  if (isValidToken === null) {
    return <div>Loading...</div>; // Loading state
  }
  
  return isValidToken ? children : <Navigate to="/login" replace />;
};

// Route configuration
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      } />
      
      <Route path="/school" element={
        <ProtectedRoute>
          <SchoolPage />
        </ProtectedRoute>
      } />
    </Routes>
  );
};
```

## Infrastructure Security

### Server Security

#### Express.js Security Configuration
```javascript
const express = require('express');
const app = express();

// Trust proxy (for rate limiting behind load balancer)
app.set('trust proxy', 1);

// Disable server information disclosure
app.disable('x-powered-by');

// Security middleware stack
app.use(helmet()); // Security headers
app.use(cors(corsOptions)); // CORS protection
app.use(rateLimit()); // Rate limiting
app.use(express.json({ limit: '10mb' })); // Body size limit
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Custom security middleware
app.use((req, res, next) => {
  // Add security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  next();
});

// Error handling middleware
app.use((error, req, res, next) => {
  // Log error for monitoring
  console.error('Security error:', {
    error: error.message,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    url: req.originalUrl,
    method: req.method
  });
  
  // Don't expose internal errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: isDevelopment ? error.message : 'Internal server error'
  });
});
```

### Environment Security

#### Secure Environment Configuration
```bash
# Production environment variables
NODE_ENV=production

# Database
DB_PATH=./production.db
DB_ENCRYPTION_KEY=your-32-character-encryption-key

# JWT Configuration
JWT_SECRET=your-super-secure-256-bit-secret-key
JWT_EXPIRY=7d

# Server Configuration
PORT=6001
HOST=0.0.0.0

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret
CSRF_SECRET=your-csrf-secret

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100

# File Upload
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/gif

# Logging
LOG_LEVEL=info
LOG_FILE=./logs/app.log

# Monitoring
SENTRY_DSN=your-sentry-dsn
HEALTH_CHECK_ENDPOINT=/health
```

## Security Best Practices

### Development Security

#### Secure Development Checklist

1. **Code Review**
   - [ ] Security-focused code reviews
   - [ ] Automated security scanning
   - [ ] Dependency vulnerability checks
   - [ ] Static code analysis

2. **Testing**
   - [ ] Security unit tests
   - [ ] Integration security tests
   - [ ] Penetration testing
   - [ ] Load testing for DoS resistance

3. **Dependencies**
   - [ ] Regular dependency updates
   - [ ] Vulnerability scanning (npm audit)
   - [ ] License compliance checking
   - [ ] Minimal dependency principle

4. **Configuration**
   - [ ] Secure default configurations
   - [ ] Environment-specific settings
   - [ ] Secret management
   - [ ] Configuration validation

### Deployment Security

#### Production Security Checklist

1. **Server Configuration**
   - [ ] Firewall configuration
   - [ ] SSL/TLS certificate
   - [ ] Server hardening
   - [ ] Regular security updates

2. **Database Security**
   - [ ] Database encryption
   - [ ] Regular backups
   - [ ] Access control
   - [ ] Connection encryption

3. **Monitoring**
   - [ ] Security logging
   - [ ] Intrusion detection
   - [ ] Performance monitoring
   - [ ] Error tracking

4. **Backup & Recovery**
   - [ ] Regular automated backups
   - [ ] Disaster recovery plan
   - [ ] Data integrity checks
   - [ ] Recovery testing

## Vulnerability Management

### Security Scanning

#### Automated Security Tools
```bash
# Package.json security scripts
{
  "scripts": {
    "security:audit": "npm audit",
    "security:fix": "npm audit fix",
    "security:scan": "eslint --ext .js src/ --config .eslintrc-security.js",
    "security:deps": "audit-ci --moderate",
    "security:test": "npm run test:security"
  }
}
```

#### ESLint Security Configuration
```javascript
// .eslintrc-security.js
module.exports = {
  plugins: ['security'],
  extends: ['plugin:security/recommended'],
  rules: {
    'security/detect-object-injection': 'error',
    'security/detect-non-literal-regexp': 'error',
    'security/detect-unsafe-regex': 'error',
    'security/detect-buffer-noassert': 'error',
    'security/detect-child-process': 'error',
    'security/detect-disable-mustache-escape': 'error',
    'security/detect-eval-with-expression': 'error',
    'security/detect-no-csrf-before-method-override': 'error',
    'security/detect-non-literal-fs-filename': 'error',
    'security/detect-non-literal-require': 'error',
    'security/detect-possible-timing-attacks': 'error',
    'security/detect-pseudoRandomBytes': 'error'
  }
};
```

### Security Testing

#### Automated Security Tests
```javascript
// Security test suite
describe('Security Tests', () => {
  describe('Authentication', () => {
    test('should reject requests without token', async () => {
      const response = await request(app)
        .get('/api/schools/my-school')
        .expect(401);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('token');
    });
    
    test('should reject invalid tokens', async () => {
      const response = await request(app)
        .get('/api/schools/my-school')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
      
      expect(response.body.success).toBe(false);
    });
  });
  
  describe('Input Validation', () => {
    test('should sanitize XSS attempts', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${validToken}`)
        .send({
          studentName: maliciousInput,
          studentNumber: 'STU001',
          classId: 1
        })
        .expect(422);
      
      expect(response.body.success).toBe(false);
    });
    
    test('should prevent SQL injection', async () => {
      const sqlInjection = "'; DROP TABLE students; --";
      
      const response = await request(app)
        .get(`/api/students/search?q=${encodeURIComponent(sqlInjection)}`)
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
      
      // Should return empty results, not error
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });
  });
  
  describe('File Upload Security', () => {
    test('should reject non-image files', async () => {
      const response = await request(app)
        .post('/api/students')
        .set('Authorization', `Bearer ${validToken}`)
        .attach('photo', Buffer.from('malicious script'), 'malware.exe')
        .field('studentName', 'Test Student')
        .field('studentNumber', 'STU001')
        .field('classId', '1')
        .expect(400);
      
      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('file type');
    });
  });
});
```

## Compliance & Privacy

### GDPR Compliance

#### Data Protection Implementation
```javascript
// GDPR compliance service
class GDPRComplianceService {
  async handleDataPortabilityRequest(userId) {
    const userData = await this.exportAllUserData(userId);
    
    return {
      exportDate: new Date().toISOString(),
      legalBasis: 'Article 20 - Right to data portability',
      data: userData,
      retention: 'Data will be retained according to legal requirements',
      contact: 'privacy@yourschool.com'
    };
  }
  
  async handleRightToBeForgettenRequest(userId) {
    // Anonymize instead of delete to maintain referential integrity
    await this.anonymizeUserData(userId);
    
    return {
      processedDate: new Date().toISOString(),
      action: 'Data anonymized',
      retention: 'Anonymized data retained for legal compliance',
      contact: 'privacy@yourschool.com'
    };
  }
  
  async handleDataRectificationRequest(userId, corrections) {
    const validatedCorrections = await this.validateCorrections(corrections);
    await this.updateUserData(userId, validatedCorrections);
    
    return {
      processedDate: new Date().toISOString(),
      changes: validatedCorrections,
      contact: 'privacy@yourschool.com'
    };
  }
}
```

### FERPA Compliance

#### Educational Records Protection
```javascript
// FERPA compliance service
class FERPAComplianceService {
  async logEducationalRecordAccess(studentId, userId, purpose) {
    await EducationalRecordAccess.create({
      studentId,
      accessedBy: userId,
      purpose,
      accessDate: new Date(),
      ipAddress: req.ip,
      legitimate: await this.validateLegitimateEducationalInterest(userId, studentId)
    });
  }
  
  async validateDirectoryInformation(data) {
    const directoryFields = [
      'studentName', 'photo', 'className', 'year'
    ];
    
    // Only allow directory information without consent
    return Object.keys(data).every(field => directoryFields.includes(field));
  }
  
  async requireParentalConsent(studentAge) {
    return studentAge < 18;
  }
}
```

## Security Monitoring

### Logging & Monitoring

#### Security Event Logging
```javascript
const winston = require('winston');

// Security logger configuration
const securityLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'school-management-security' },
  transports: [
    new winston.transports.File({ 
      filename: 'logs/security-error.log', 
      level: 'error' 
    }),
    new winston.transports.File({ 
      filename: 'logs/security.log' 
    })
  ]
});

// Security event types
const SECURITY_EVENTS = {
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  UNAUTHORIZED_ACCESS: 'UNAUTHORIZED_ACCESS',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  SUSPICIOUS_ACTIVITY: 'SUSPICIOUS_ACTIVITY',
  DATA_ACCESS: 'DATA_ACCESS',
  DATA_MODIFICATION: 'DATA_MODIFICATION',
  FILE_UPLOAD: 'FILE_UPLOAD',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED'
};

// Security event logger
const logSecurityEvent = (event, details = {}, req = null) => {
  const logData = {
    event,
    timestamp: new Date().toISOString(),
    details,
    
    // Request information
    ...(req && {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      userId: req.user?.userId
    })
  };
  
  securityLogger.info('Security Event', logData);
  
  // Alert on critical events
  if (isCriticalEvent(event)) {
    alertSecurityTeam(logData);
  }
};

const isCriticalEvent = (event) => {
  const criticalEvents = [
    SECURITY_EVENTS.UNAUTHORIZED_ACCESS,
    SECURITY_EVENTS.SUSPICIOUS_ACTIVITY,
    SECURITY_EVENTS.RATE_LIMIT_EXCEEDED
  ];
  
  return criticalEvents.includes(event);
};
```

### Real-time Monitoring

#### Security Metrics Dashboard
```javascript
// Security metrics collection
class SecurityMetrics {
  constructor() {
    this.metrics = {
      loginAttempts: 0,
      failedLogins: 0,
      unauthorizedAccess: 0,
      rateLimitHits: 0,
      suspiciousActivity: 0
    };
  }
  
  incrementMetric(metric) {
    this.metrics[metric] = (this.metrics[metric] || 0) + 1;
    
    // Check for security thresholds
    this.checkSecurityThresholds();
  }
  
  checkSecurityThresholds() {
    const thresholds = {
      failedLogins: 10,
      unauthorizedAccess: 5,
      rateLimitHits: 50
    };
    
    Object.keys(thresholds).forEach(metric => {
      if (this.metrics[metric] >= thresholds[metric]) {
        this.triggerSecurityAlert(metric, this.metrics[metric]);
      }
    });
  }
  
  triggerSecurityAlert(metric, value) {
    const alert = {
      type: 'SECURITY_THRESHOLD_EXCEEDED',
      metric,
      value,
      threshold: thresholds[metric],
      timestamp: new Date().toISOString()
    };
    
    // Send alert to security team
    this.sendSecurityAlert(alert);
  }
}
```

## Incident Response

### Security Incident Response Plan

#### Incident Response Procedures
```javascript
// Incident response service
class IncidentResponseService {
  async handleSecurityIncident(incident) {
    // 1. Immediate containment
    await this.containIncident(incident);
    
    // 2. Assessment
    const assessment = await this.assessIncident(incident);
    
    // 3. Notification
    await this.notifyStakeholders(incident, assessment);
    
    // 4. Recovery
    await this.recoverFromIncident(incident);
    
    // 5. Documentation
    await this.documentIncident(incident, assessment);
  }
  
  async containIncident(incident) {
    switch (incident.type) {
      case 'UNAUTHORIZED_ACCESS':
        await this.revokeUserAccess(incident.userId);
        break;
      case 'DATA_BREACH':
        await this.isolateAffectedSystems();
        break;
      case 'MALWARE':
        await this.quarantineAffectedFiles();
        break;
    }
  }
  
  async assessIncident(incident) {
    return {
      severity: this.calculateSeverity(incident),
      scope: await this.determineScope(incident),
      impact: await this.assessImpact(incident),
      rootCause: await this.identifyRootCause(incident)
    };
  }
  
  calculateSeverity(incident) {
    const severityMatrix = {
      UNAUTHORIZED_ACCESS: 'MEDIUM',
      DATA_BREACH: 'HIGH',
      MALWARE: 'HIGH',
      DDOS: 'MEDIUM',
      INSIDER_THREAT: 'HIGH'
    };
    
    return severityMatrix[incident.type] || 'LOW';
  }
}
```

### Security Communication Plan

#### Stakeholder Notification
```javascript
// Notification service for security incidents
class SecurityNotificationService {
  async notifySecurityIncident(incident, assessment) {
    const notifications = [];
    
    // Internal notifications
    if (assessment.severity === 'HIGH') {
      notifications.push(this.notifySecurityTeam(incident));
      notifications.push(this.notifyManagement(incident));
    }
    
    // External notifications (if required)
    if (this.requiresRegulatoryNotification(incident)) {
      notifications.push(this.notifyRegulators(incident));
    }
    
    if (this.requiresUserNotification(incident)) {
      notifications.push(this.notifyAffectedUsers(incident));
    }
    
    await Promise.all(notifications);
  }
  
  requiresRegulatoryNotification(incident) {
    // GDPR requires notification within 72 hours for certain breaches
    return incident.type === 'DATA_BREACH' && 
           incident.scope.includes('PERSONAL_DATA');
  }
  
  requiresUserNotification(incident) {
    // Notify users if their data was potentially compromised
    return incident.type === 'DATA_BREACH' && 
           incident.impact === 'HIGH';
  }
}
```

---

*This security guide provides comprehensive protection measures for the School Management System. Regular security audits and updates are essential to maintain a strong security posture.*
