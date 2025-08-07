# 📡 API Documentation

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Base URL](#base-url)
- [Response Format](#response-format)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#authentication-endpoints)
  - [School Management](#school-management)
  - [Class Management](#class-management)
  - [Student Management](#student-management)
- [Code Examples](#code-examples)
- [SDKs and Tools](#sdks-and-tools)

## Overview

The School Management System API is a RESTful API that provides programmatic access to manage educational institutions, classes, and students. The API uses JSON for data exchange and JWT tokens for authentication.

### API Version
- **Current Version**: v1
- **Base URL**: `http://localhost:6001/api`
- **Documentation Version**: 1.0.0

### Supported Operations
- User authentication and authorization
- School profile management
- Class/course management
- Student enrollment and management
- File uploads (photos, documents)

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header for protected endpoints.

### Authentication Flow
1. Register or login to get a JWT token
2. Include the token in subsequent requests
3. Token expires after 7 days (configurable)

### Header Format
```
Authorization: Bearer <your-jwt-token>
```

### Token Payload
```json
{
  "userId": 123,
  "iat": 1641234567,
  "exp": 1641839367
}
```

## Base URL

### Development
```
http://localhost:6001/api
```

### Production
```
https://your-domain.com/api
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": {
    // Field-specific errors (for validation)
  }
}
```

### Pagination Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

## Error Handling

### HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 422 | Unprocessable Entity - Validation failed |
| 500 | Internal Server Error - Server error |

### Error Codes

| Code | Description |
|------|-------------|
| `USER_EXISTS` | Email already registered |
| `INVALID_CREDENTIALS` | Invalid email or password |
| `SCHOOL_NOT_FOUND` | School profile not found |
| `CLASS_EXISTS` | Class already exists |
| `STUDENT_NUMBER_EXISTS` | Student number already in use |
| `VALIDATION_ERROR` | Input validation failed |
| `UNAUTHORIZED` | Authentication failed |
| `SCHOOL_REQUIRED` | School profile required |

## Rate Limiting

- **Limit**: 100 requests per minute per IP
- **Reset**: Rate limit resets every minute
- **Headers**: Rate limit info included in response headers

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1641234567
```

## API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /signup
```

**Request Body:**
```json
{
  "name": "John Doe",
  "school": "Springfield Elementary",
  "institute": "Primary Schools",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "school": "Springfield Elementary",
      "institute": "Primary Schools"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Login
```http
POST /login
```

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### School Management

#### Get My School
```http
GET /schools/my-school
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Springfield Elementary",
    "type": "Primary Schools",
    "registrationNumber": "REG123456",
    "licenseNumber": "LIC789012",
    "tin": "TIN345678",
    "location": "Springfield",
    "address": "123 School Street",
    "phone": "+1234567890",
    "email": "info@springfield.edu",
    "website": "https://springfield.edu",
    "photo": "/uploads/schools/school-123.jpg",
    "headMaster": {
      "head_master_name": "Principal Skinner",
      "head_master_age": 45,
      "head_master_nin": "NIN123456789",
      "head_master_educationLevel": "Master's Degree"
    }
  }
}
```

#### Create School Profile
```http
POST /schools
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
name: Springfield Elementary
type: Primary Schools
registrationNumber: REG123456
licenseNumber: LIC789012
tin: TIN345678
location: Springfield
address: 123 School Street
phone: +1234567890
email: info@springfield.edu
website: https://springfield.edu
photo: [file]
headMaster: {"head_master_name":"Principal Skinner","head_master_age":45}
```

#### Update School Profile
```http
PUT /schools
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Get School Statistics
```http
GET /schools/stats
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalStudents": 250,
    "totalTeachers": 15,
    "totalStaff": 20,
    "totalCourses": 8,
    "studentsPerClass": [
      {
        "className": "Grade 1A",
        "year": "2025",
        "count": 30
      }
    ]
  }
}
```

### Class Management

#### Get All Classes
```http
GET /classes
Authorization: Bearer <token>
```

**Query Parameters:**
- `status` - Filter by status (active, inactive, archived)
- `limit` - Number of items per page
- `offset` - Number of items to skip

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "className": "Grade 1A",
      "year": "2025",
      "photo": "/uploads/classes/class-123.jpg",
      "capacity": 30,
      "status": "active",
      "studentCount": 25,
      "students": [...]
    }
  ]
}
```

#### Create Class
```http
POST /classes
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
className: Grade 1A
year: 2025
photo: [file]
capacity: 30
description: First grade class A
```

#### Get Class by ID
```http
GET /classes/:id
Authorization: Bearer <token>
```

#### Update Class
```http
PUT /classes/:id
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Delete Class
```http
DELETE /classes/:id
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Class deleted successfully"
}
```

### Student Management

#### Add Student to Class
```http
POST /classes/:classId/students
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Request Body (Form Data):**
```
studentNumber: STU001
studentName: Lisa Simpson
dob: 2018-05-09
age: 7
fatherName: Homer Simpson
motherName: Marge Simpson
photo: [file]
address: 742 Evergreen Terrace
phoneNumber: +1234567890
email: lisa@simpson.com
```

**Response:**
```json
{
  "success": true,
  "message": "Student added successfully",
  "data": {
    "id": 1,
    "studentNumber": "STU001",
    "studentName": "Lisa Simpson",
    "dob": "2018-05-09",
    "age": 7,
    "fatherName": "Homer Simpson",
    "motherName": "Marge Simpson",
    "photo": "/uploads/students/student-123.jpg",
    "status": "active"
  }
}
```

#### Update Student
```http
PUT /classes/:classId/students/:studentId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

#### Delete Student
```http
DELETE /classes/:classId/students/:studentId
Authorization: Bearer <token>
```

#### Get All Students
```http
GET /students
Authorization: Bearer <token>
```

#### Search Students
```http
GET /students/search?q=search_term
Authorization: Bearer <token>
```

**Query Parameters:**
- `q` - Search term (minimum 2 characters)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "studentNumber": "STU001",
      "studentName": "Lisa Simpson",
      "class": {
        "id": 1,
        "className": "Grade 1A",
        "year": "2025"
      }
    }
  ]
}
```

## Code Examples

### JavaScript/Node.js

```javascript
// Authentication
const login = async (email, password) => {
  const response = await fetch('http://localhost:6001/api/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });
  
  const data = await response.json();
  if (data.success) {
    localStorage.setItem('token', data.data.token);
  }
  return data;
};

// Get school data
const getSchool = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:6001/api/schools/my-school', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  
  return await response.json();
};

// Create class with photo
const createClass = async (classData, photo) => {
  const token = localStorage.getItem('token');
  const formData = new FormData();
  
  formData.append('className', classData.className);
  formData.append('year', classData.year);
  if (photo) {
    formData.append('photo', photo);
  }
  
  const response = await fetch('http://localhost:6001/api/classes', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  return await response.json();
};
```

### Python

```python
import requests
import json

BASE_URL = 'http://localhost:6001/api'

class SchoolAPI:
    def __init__(self):
        self.token = None
    
    def login(self, email, password):
        response = requests.post(f'{BASE_URL}/login', json={
            'email': email,
            'password': password
        })
        
        data = response.json()
        if data['success']:
            self.token = data['data']['token']
        return data
    
    def get_headers(self):
        return {
            'Authorization': f'Bearer {self.token}',
            'Content-Type': 'application/json'
        }
    
    def get_school(self):
        response = requests.get(
            f'{BASE_URL}/schools/my-school',
            headers=self.get_headers()
        )
        return response.json()
    
    def create_class(self, class_name, year, photo_path=None):
        files = {}
        data = {
            'className': class_name,
            'year': year
        }
        
        if photo_path:
            files['photo'] = open(photo_path, 'rb')
        
        headers = {'Authorization': f'Bearer {self.token}'}
        response = requests.post(
            f'{BASE_URL}/classes',
            data=data,
            files=files,
            headers=headers
        )
        
        if photo_path:
            files['photo'].close()
        
        return response.json()

# Usage
api = SchoolAPI()
api.login('john@example.com', 'password')
school = api.get_school()
print(school)
```

### cURL Examples

```bash
# Login
curl -X POST http://localhost:6001/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password"}'

# Get school (replace TOKEN with actual token)
curl -X GET http://localhost:6001/api/schools/my-school \
  -H "Authorization: Bearer TOKEN"

# Create class with photo
curl -X POST http://localhost:6001/api/classes \
  -H "Authorization: Bearer TOKEN" \
  -F "className=Grade 1A" \
  -F "year=2025" \
  -F "photo=@/path/to/photo.jpg"

# Search students
curl -X GET "http://localhost:6001/api/students/search?q=lisa" \
  -H "Authorization: Bearer TOKEN"
```

## SDKs and Tools

### Recommended Tools

1. **Postman Collection**: Import the API collection for testing
2. **Insomnia**: Alternative API testing tool
3. **OpenAPI/Swagger**: API documentation and testing interface

### Client Libraries

- **JavaScript**: Axios, Fetch API
- **Python**: requests library
- **PHP**: Guzzle HTTP client
- **Java**: OkHttp, Apache HttpClient
- **C#**: HttpClient

### Testing

```javascript
// Jest test example
describe('School API', () => {
  let token;
  
  beforeAll(async () => {
    const response = await login('test@example.com', 'password');
    token = response.data.token;
  });
  
  test('should get school data', async () => {
    const school = await getSchool(token);
    expect(school.success).toBe(true);
    expect(school.data).toHaveProperty('name');
  });
  
  test('should create class', async () => {
    const classData = {
      className: 'Test Class',
      year: '2025'
    };
    
    const result = await createClass(classData, token);
    expect(result.success).toBe(true);
    expect(result.data.className).toBe('Test Class');
  });
});
```

## Webhooks (Future Feature)

Webhooks will be available in future versions to notify external systems of events:

- Student enrollment
- Class creation
- Profile updates
- System events

---

*For more examples and detailed integration guides, visit our [GitHub repository](https://github.com/Arison99/School-Management-System) or contact support.*
