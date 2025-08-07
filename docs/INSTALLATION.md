# 🔧 Installation Guide

## Table of Contents

- [System Requirements](#system-requirements)
- [Development Environment Setup](#development-environment-setup)
- [Installation Methods](#installation-methods)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Verification](#verification)
- [Troubleshooting](#troubleshooting)

## System Requirements

### Minimum Requirements

- **Operating System**: Windows 10, macOS 10.14, or Ubuntu 18.04+
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **RAM**: 4GB minimum, 8GB recommended
- **Storage**: 2GB free space
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+, or Edge 90+

### Recommended Requirements

- **Node.js**: Version 20.x (LTS)
- **RAM**: 8GB or more
- **Storage**: 5GB free space for development
- **Internet**: Stable connection for package downloads

## Development Environment Setup

### 1. Install Node.js and npm

#### Windows
1. Download Node.js from [nodejs.org](https://nodejs.org/)
2. Run the installer (.msi file)
3. Follow the installation wizard
4. Verify installation:
   ```cmd
   node --version
   npm --version
   ```

#### macOS
1. **Option 1: Official Installer**
   - Download from [nodejs.org](https://nodejs.org/)
   - Run the .pkg installer

2. **Option 2: Using Homebrew**
   ```bash
   brew install node
   ```

3. Verify installation:
   ```bash
   node --version
   npm --version
   ```

#### Ubuntu/Debian
```bash
# Update package index
sudo apt update

# Install Node.js and npm
sudo apt install nodejs npm

# Verify installation
node --version
npm --version
```

### 2. Install Git

#### Windows
1. Download Git from [git-scm.com](https://git-scm.com/)
2. Run the installer
3. Use default settings unless you have specific preferences

#### macOS
```bash
# Using Homebrew
brew install git

# Or download from git-scm.com
```

#### Ubuntu/Debian
```bash
sudo apt install git
```

### 3. Install a Code Editor (Recommended)

- **Visual Studio Code**: [code.visualstudio.com](https://code.visualstudio.com/)
- **WebStorm**: [jetbrains.com/webstorm](https://www.jetbrains.com/webstorm/)
- **Sublime Text**: [sublimetext.com](https://www.sublimetext.com/)

## Installation Methods

### Method 1: Git Clone (Recommended)

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Arison99/School-Management-System.git
   cd School-Management-System
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install Frontend Dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

### Method 2: Download ZIP

1. **Download the Project**
   - Go to the [GitHub repository](https://github.com/Arison99/School-Management-System)
   - Click "Code" → "Download ZIP"
   - Extract the ZIP file

2. **Navigate to Project Directory**
   ```bash
   cd School-Management-System
   ```

3. **Install Dependencies** (same as Method 1 steps 2-3)

## Database Setup

The system uses SQLite by default, which requires no additional setup. The database file will be created automatically when you first run the backend.

### Database File Location
- **Development**: `backend/School Mgt System.sqlite`
- **File Creation**: Automatic on first server start

### Alternative Database Options

If you want to use a different database:

#### PostgreSQL
1. Install PostgreSQL
2. Create a database
3. Update `.env` file:
   ```env
   DB_DIALECT=postgres
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=school_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

#### MySQL
1. Install MySQL
2. Create a database
3. Update `.env` file:
   ```env
   DB_DIALECT=mysql
   DB_HOST=localhost
   DB_PORT=3306
   DB_NAME=school_management
   DB_USER=your_username
   DB_PASSWORD=your_password
   ```

## Environment Configuration

### 1. Backend Environment Setup

Create the environment file:
```bash
cd backend
cp .env.example .env
```

Edit the `.env` file:
```env
# Server Configuration
PORT=6001
HOST=localhost
NODE_ENV=development

# Database Configuration (SQLite)
DB_DIALECT=sqlite
DB_STORAGE=./School Mgt System.sqlite

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# JWT Secret (Change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# File Upload
MAX_FILE_SIZE=5242880
```

### 2. Frontend Configuration

The frontend uses Vite with default configuration. No additional environment setup is typically required for development.

If needed, create `frontend/.env`:
```env
# API Base URL
VITE_API_URL=http://localhost:6001
```

### 3. Security Configuration

**Important**: For production deployments:
1. Change the JWT_SECRET to a strong, random string
2. Use environment-specific configuration
3. Enable HTTPS
4. Configure proper CORS settings

## Running the Application

### Development Mode

#### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

#### Option 2: Using npm Scripts (if available)

From the root directory:
```bash
# Install dependencies for both
npm run install:all

# Start both services
npm run dev
```

### Production Mode

1. **Build the Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the Backend**
   ```bash
   cd backend
   npm start
   ```

3. **Serve the Frontend**
   - Use a web server like Nginx or Apache
   - Or serve the built files using Node.js

## Verification

### 1. Backend Verification

Check if the backend is running:
```bash
curl http://localhost:6001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Server is running",
  "timestamp": "2025-01-07T12:00:00.000Z"
}
```

### 2. Frontend Verification

1. Open your browser
2. Navigate to `http://localhost:5173`
3. You should see the School Management System signup page

### 3. Database Verification

Check if the database was created:
```bash
cd backend
ls -la "School Mgt System.sqlite"
```

### 4. Full System Test

1. **Create an Account**
   - Fill out the signup form
   - Submit the form
   - Verify you can log in

2. **Test Core Features**
   - Create a school profile
   - Add a class
   - Add a student to the class

## Troubleshooting

### Common Installation Issues

#### 1. Node.js Version Issues

**Problem**: "Node.js version not supported"
**Solution**:
```bash
# Check Node.js version
node --version

# If version is below 18.x, update Node.js
# Use Node Version Manager (nvm) for version management
```

#### 2. npm Install Failures

**Problem**: Dependencies fail to install
**Solutions**:
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall dependencies
npm install

# If still failing, try yarn
npm install -g yarn
yarn install
```

#### 3. Port Already in Use

**Problem**: "Port 6001 is already in use"
**Solutions**:
```bash
# Option 1: Kill the process using the port
# Windows
netstat -ano | findstr :6001
taskkill /PID <PID> /F

# macOS/Linux
lsof -ti:6001 | xargs kill -9

# Option 2: Use a different port
# Edit backend/.env and change PORT=6001 to PORT=6002
```

#### 4. Permission Issues

**Problem**: Permission denied errors
**Solutions**:
```bash
# Fix npm permissions (macOS/Linux)
sudo chown -R $(whoami) ~/.npm

# Or use nvm instead of system Node.js
```

#### 5. Database Connection Issues

**Problem**: Cannot connect to database
**Solutions**:
1. Check if the backend directory is writable
2. Verify the `.env` file configuration
3. Check for typos in the database configuration
4. Ensure no other process is using the database file

#### 6. CORS Issues

**Problem**: Cross-origin request blocked
**Solutions**:
1. Verify FRONTEND_URL in backend `.env` file
2. Check that both frontend and backend are running
3. Ensure ports match the configuration

### Getting Help

If you encounter issues not covered here:

1. **Check the logs**:
   - Backend: Look at the terminal running the backend
   - Frontend: Check browser console (F12)

2. **Review documentation**:
   - [Troubleshooting Guide](TROUBLESHOOTING.md)
   - [FAQ](FAQ.md)

3. **Community support**:
   - [GitHub Issues](https://github.com/Arison99/School-Management-System/issues)
   - [GitHub Discussions](https://github.com/Arison99/School-Management-System/discussions)

4. **Contact support**:
   - Email: support@schoolms.com

### Development Tips

1. **IDE Configuration**:
   - Install ESLint extension for code quality
   - Use Prettier for code formatting
   - Enable auto-save for better development experience

2. **Browser DevTools**:
   - Use Network tab to monitor API requests
   - Check Console for JavaScript errors
   - Use Application tab to inspect localStorage

3. **Hot Reload**:
   - Both frontend (Vite) and backend (nodemon) support hot reload
   - Changes should be reflected automatically

---

*For production deployment instructions, see the [Deployment Guide](DEPLOYMENT.md).*
