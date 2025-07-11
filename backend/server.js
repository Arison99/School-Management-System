import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import sequelize from './src/config/database.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config();

// Import models to establish associations
import User from './src/models/signupModel.js';
import School from './src/models/schoolModel.js';
import Class from './src/models/classModel.js';
import Student from './src/models/studentModel.js';

// Import routes
import signupRoute from './src/routes/signupRoute.js';
import loginRoute from './src/routes/loginRoute.js';
import schoolRoute from './src/routes/schoolRoute.js';
import classRoute from './src/routes/classRoute.js';
import studentRoute from './src/routes/studentRoute.js';

const app = express();
const PORT = process.env.PORT || 6001;
const HOST = process.env.HOST || 'localhost';

// Create uploads directories if they don't exist
const uploadsDir = path.join(__dirname, 'uploads');
const schoolsDir = path.join(__dirname, 'uploads/schools');
const classesDir = path.join(__dirname, 'uploads/classes');
const studentsDir = path.join(__dirname, 'uploads/students');

[uploadsDir, schoolsDir, classesDir, studentsDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`Created directory: ${dir}`);
    }
});

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (for uploaded images)
app.use('/uploads', express.static(uploadsDir));

// Database connection and sync
const initializeDatabase = async () => {
    try {
        await sequelize.authenticate();
        console.log('SQLite database connection established successfully');
        console.log(`Database file: School Mgt System.sqlite`);
        
        // Set up associations
        School.belongsTo(User, { foreignKey: 'userId' });
        User.hasOne(School, { foreignKey: 'userId' });
        
        Class.belongsTo(School, { foreignKey: 'schoolId' });
        School.hasMany(Class, { foreignKey: 'schoolId' });
        
        Student.belongsTo(Class, { foreignKey: 'classId', as: 'class' });
        Class.hasMany(Student, { foreignKey: 'classId', as: 'students' });
        
        // Sync database without altering existing tables
        await sequelize.sync({ force: false, alter: false });
        console.log('Database synchronized successfully');
    } catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};

// Initialize database
initializeDatabase();

// API Routes
app.use('/api/signup', signupRoute);
app.use('/api/login', loginRoute);
app.use('/api/schools', schoolRoute);
app.use('/api/classes', classRoute);
app.use('/api/students', studentRoute);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Server is running',
        timestamp: new Date().toISOString()
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Start server
app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Close server & exit process
    process.exit(1);
});

