import express from 'express';
import pkg from 'body-parser';
const { json, urlencoded } = pkg;
import cors from 'cors';
import multer from 'multer';
import path from 'path';

const app = express();
const PORT = 5000;
const HOST = 'localhost'; // Bind to all available network interfaces

app.listen(PORT, HOST, () => {
    console.log(`Server listening on http://${HOST}:${PORT}`);
});

app.use(cors());
app.use(json());
app.use(urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Comprehensive school data with realistic values
let schoolData = {
    school: "St. Mary's International School",
    type: "International School",
    registrationNumber: "REG/2024/0123",
    licenseNumber: "LIC/2024/456",
    tin: "TIN98765432",
    location: "Plot 145, Victoria Avenue, Kampala, Uganda",
    staff: 85,
    photo: "https://via.placeholder.com/800x600?text=St.+Mary's+International+School",
    headMaster: {
        photo: "https://via.placeholder.com/400x400?text=Dr.+Sarah+Johnson",
        head_master_name: "Dr. Sarah Johnson",
        head_master_age: 52,
        head_master_nin: "NIN123456789",
        head_master_educationLevel: "PhD in Educational Leadership",
    },
    totalCourses: 28,
    totalStudents: 850,
    studentsPerClass: [
        { className: "Year 7", count: 120 },
        { className: "Year 8", count: 115 },
        { className: "Year 9", count: 118 },
        { className: "Year 10", count: 112 },
        { className: "Year 11", count: 105 },
        { className: "Year 12", count: 95 },
        { className: "Year 13", count: 85 }
    ],
    totalTeachers: 65,
};

// Initialize classes with comprehensive dummy data
let classes = [
    {
        id: 1,
        className: "Year 7A",
        year: "2024",
        photo: "https://via.placeholder.com/800x600?text=Year+7A+Class",
        students: [
            {
                id: 101,
                studentNumber: "2024/Y7A/001",
                studentName: "John Smith",
                dob: "2012-03-15",
                age: 12,
                fatherName: "Michael Smith",
                motherName: "Sarah Smith",
                photo: "https://via.placeholder.com/300x300?text=John+Smith"
            },
            {
                id: 102,
                studentNumber: "2024/Y7A/002",
                studentName: "Emily Johnson",
                dob: "2012-05-20",
                age: 12,
                fatherName: "Robert Johnson",
                motherName: "Mary Johnson",
                photo: "https://via.placeholder.com/300x300?text=Emily+Johnson"
            }
        ]
    },
    {
        id: 2,
        className: "Year 8B",
        year: "2024",
        photo: "https://via.placeholder.com/800x600?text=Year+8B+Class",
        students: [
            {
                id: 201,
                studentNumber: "2024/Y8B/001",
                studentName: "David Williams",
                dob: "2011-07-10",
                age: 13,
                fatherName: "James Williams",
                motherName: "Patricia Williams",
                photo: "https://via.placeholder.com/300x300?text=David+Williams"
            },
            {
                id: 202,
                studentNumber: "2024/Y8B/002",
                studentName: "Sophie Brown",
                dob: "2011-09-25",
                age: 13,
                fatherName: "Thomas Brown",
                motherName: "Elizabeth Brown",
                photo: "https://via.placeholder.com/300x300?text=Sophie+Brown"
            }
        ]
    },
    {
        id: 3,
        className: "Year 9C",
        year: "2024",
        photo: "https://via.placeholder.com/800x600?text=Year+9C+Class",
        students: [
            {
                id: 301,
                studentNumber: "2024/Y9C/001",
                studentName: "Michael Davis",
                dob: "2010-11-30",
                age: 14,
                fatherName: "William Davis",
                motherName: "Jennifer Davis",
                photo: "https://via.placeholder.com/300x300?text=Michael+Davis"
            },
            {
                id: 302,
                studentNumber: "2024/Y9C/002",
                studentName: "Emma Wilson",
                dob: "2010-12-15",
                age: 14,
                fatherName: "Charles Wilson",
                motherName: "Margaret Wilson",
                photo: "https://via.placeholder.com/300x300?text=Emma+Wilson"
            }
        ]
    }
];

/* ----- School API Endpoints ----- */
app.get('/api/school', (req, res) => {
    res.json(schoolData);
});

app.put('/api/school', upload.fields([{ name: 'photo', maxCount: 1 }, { name: 'headMaster.photo', maxCount: 1 }]), (req, res) => {
    const updatedSchoolData = req.body;

    if (req.files['photo'] && req.files['photo'][0]) {
        updatedSchoolData.photo = '/uploads/' + req.files['photo'][0].filename;
    } else {
        updatedSchoolData.photo = schoolData.photo;
    }

    if (req.files['headMaster.photo'] && req.files['headMaster.photo'][0]) {
        updatedSchoolData.headMaster = {
            ...updatedSchoolData.headMaster,
            photo: '/uploads/' + req.files['headMaster.photo'][0].filename
        };
    } else {
        updatedSchoolData.headMaster = {
            ...updatedSchoolData.headMaster,
            photo: schoolData.headMaster.photo
        };
    }

    schoolData = {
        ...updatedSchoolData,
        headMaster: {
            ...updatedSchoolData.headMaster
        }
    };

    res.json(schoolData);
});

/* ----- Home Data API Endpoint ----- */
app.get('/api/home-data', (req, res) => {
    const homeData = {
        name: schoolData.school,
        type: schoolData.type,
        registrationNumber: schoolData.registrationNumber,
        licenseNumber: schoolData.licenseNumber,
        tin: schoolData.tin,
        photo: schoolData.photo,
        headMaster: {
            name: schoolData.headMaster.head_master_name,
            photo: schoolData.headMaster.photo,
        },
        totalCourses: schoolData.totalCourses,
        totalStudents: schoolData.totalStudents,
        studentsPerClass: schoolData.studentsPerClass,
        totalTeachers: schoolData.totalTeachers,
    };
    res.json(homeData);
});

/* ----- Class Management Endpoints ----- */
app.get('/classes', (req, res) => {
    res.json(classes);
});

app.post('/classes', (req, res) => {
    const newClass = {
        id: Date.now(),
        className: req.body.className,
        year: req.body.year,
        photo: req.body.photo || `https://via.placeholder.com/800x600?text=${req.body.className}`,
        students: [],
    };
    classes.push(newClass);
    res.status(201).json(newClass);
});

app.put('/classes/:classId', (req, res) => {
    const classId = parseInt(req.params.classId);
    const updatedClass = req.body;

    classes = classes.map(cls => 
        cls.id === classId ? 
        { ...updatedClass, id: classId, students: cls.students } : 
        cls
    );

    const foundClass = classes.find(cls => cls.id === classId);
    if (foundClass) {
        res.json(foundClass);
    } else {
        res.status(404).send('Class not found');
    }
});

app.delete('/classes/:classId', (req, res) => {
    const classId = parseInt(req.params.classId);
    classes = classes.filter(cls => cls.id !== classId);
    res.status(204).send();
});

/* ----- Student Management Endpoints ----- */
app.get('/classes/:classId/students', (req, res) => {
    const classId = parseInt(req.params.classId);
    const selectedClass = classes.find(cls => cls.id === classId);
    if (selectedClass) {
        res.json(selectedClass.students);
    } else {
        res.status(404).send('Class not found');
    }
});

app.post('/classes/:classId/students', (req, res) => {
    const classId = parseInt(req.params.classId);
    const newStudent = {
        id: Date.now(),
        studentNumber: req.body.studentNumber,
        studentName: req.body.studentName,
        dob: req.body.dob,
        age: req.body.age,
        fatherName: req.body.fatherName,
        motherName: req.body.motherName,
        photo: req.body.photo || `https://via.placeholder.com/300x300?text=${req.body.studentName}`,
    };

    classes = classes.map(cls => {
        if (cls.id === classId) {
            cls.students.push(newStudent);
            return cls;
        }
        return cls;
    });

    const selectedClass = classes.find(cls => cls.id === classId);
    if (selectedClass) {
        res.status(201).json(newStudent);
    } else {
        res.status(404).send('Class not found');
    }
});

app.put('/classes/:classId/students/:studentId', (req, res) => {
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);
    const updatedStudent = req.body;

    classes = classes.map(cls => {
        if (cls.id === classId) {
            cls.students = cls.students.map(student =>
                student.id === studentId ? { ...updatedStudent, id: studentId } : student
            );
            return cls;
        }
        return cls;
    });

    const selectedClass = classes.find(cls => cls.id === classId);
    if (selectedClass) {
        const foundStudent = selectedClass.students.find(student => student.id === studentId);
        if (foundStudent) {
            res.json(foundStudent);
        } else {
            res.status(404).send('Student not found in class');
        }
    } else {
        res.status(404).send('Class not found');
    }
});

app.delete('/classes/:classId/students/:studentId', (req, res) => {
    const classId = parseInt(req.params.classId);
    const studentId = parseInt(req.params.studentId);

    classes = classes.map(cls => {
        if (cls.id === classId) {
            cls.students = cls.students.filter(student => student.id !== studentId);
            return cls;
        }
        return cls;
    });

    res.status(204).send();
});

