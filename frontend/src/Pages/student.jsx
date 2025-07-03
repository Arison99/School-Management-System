import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/* ----- StudentRow Component ----- */
/* Renders one student record with inline editing. */
const StudentRow = ({ student, onUpdateStudent, onDeleteStudent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState({ ...student });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedStudent((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = () => {
    onUpdateStudent(editedStudent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedStudent({ ...student });
    setIsEditing(false);
  };

  return (
    <tr className="border-b">
      <td className="p-2">
        {isEditing ? (
          <input
            type="text"
            name="studentNumber"
            value={editedStudent.studentNumber}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        ) : (
          student.studentNumber
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            type="text"
            name="studentName"
            value={editedStudent.studentName}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        ) : (
          student.studentName
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            type="date"
            name="dob"
            value={editedStudent.dob}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        ) : (
          student.dob
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            type="number"
            name="age"
            value={editedStudent.age}
            onChange={handleChange}
            className="border rounded p-1 w-20"
          />
        ) : (
          student.age
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            type="text"
            name="fatherName"
            value={editedStudent.fatherName}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        ) : (
          student.fatherName
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            type="text"
            name="motherName"
            value={editedStudent.motherName}
            onChange={handleChange}
            className="border rounded p-1 w-full"
          />
        ) : (
          student.motherName
        )}
      </td>
      <td className="p-2">
        {isEditing ? (
          <input
            type="file"
            name="photo"
            onChange={handlePhotoChange}
            className="border rounded p-1 w-full"
          />
        ) : (
          student.photo && (
            <img
              src={student.photo}
              alt="Student"
              className="h-16 w-16 object-cover rounded-full"
            />
          )
        )}
      </td>
      <td className="p-2 whitespace-nowrap">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-2 py-1 mr-1 rounded"
            >
              Save
            </button>
            <button
              onClick={handleCancel}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="bg-blue-500 text-white px-2 py-1 mr-1 rounded"
            >
              Edit
            </button>
            <button
              onClick={() => onDeleteStudent(student.id)}
              className="bg-red-500 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </>
        )}
      </td>
    </tr>
  );
};

StudentRow.propTypes = {
  student: PropTypes.shape({
    id: PropTypes.number.isRequired,
    studentNumber: PropTypes.string.isRequired,
    studentName: PropTypes.string.isRequired,
    dob: PropTypes.string.isRequired,
    age: PropTypes.number.isRequired,
    fatherName: PropTypes.string.isRequired,
    motherName: PropTypes.string.isRequired,
    photo: PropTypes.string,
  }).isRequired,
  onUpdateStudent: PropTypes.func.isRequired,
  onDeleteStudent: PropTypes.func.isRequired,
};

/* ----- ClassCard Component ----- */
/* Renders a class “card” with editable class details and its list of students. */
const ClassCard = ({ classData, onUpdateClass }) => {
  const [isEditingClass, setIsEditingClass] = useState(false);
  const [editedClass, setEditedClass] = useState({ ...classData });
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({
    studentNumber: "",
    studentName: "",
    dob: "",
    age: "",
    fatherName: "",
    motherName: "",
    photo: "",
  });
  const [message, setMessage] = useState(''); // State for messages

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedClass((prev) => ({
        ...prev,
        photo: URL.createObjectURL(file),
      }));
    }
  };

  const saveClassChanges = () => {
    onUpdateClass(editedClass);
    setIsEditingClass(false);
  };

  const cancelClassChanges = () => {
    setEditedClass({ ...classData });
    setIsEditingClass(false);
  };

  const addStudent = () => {
    // Require at least student number and name before adding.
    if (newStudent.studentNumber && newStudent.studentName) {
      const studentToAdd = { ...newStudent, id: Date.now() };
      const updatedClass = {
        ...classData,
        students: [...classData.students, studentToAdd],
      };
      onUpdateClass(updatedClass);
      // Reset add-student form.
      setNewStudent({
        studentNumber: "",
        studentName: "",
        dob: "",
        age: "",
        fatherName: "",
        motherName: "",
        photo: "",
      });
      setShowAddStudent(false);
      setMessage('Student added successfully!'); // Set success message
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    } else {
      setMessage('Student Number and Student Name are required.'); // Set error message
      setTimeout(() => setMessage(''), 3000); // Clear message after 3 seconds
    }
  };

  const updateStudent = (updatedStudent) => {
    const updatedStudents = classData.students.map((s) =>
      s.id === updatedStudent.id ? updatedStudent : s
    );
    onUpdateClass({ ...classData, students: updatedStudents });
  };

  const deleteStudent = (studentId) => {
    const updatedStudents = classData.students.filter((s) => s.id !== studentId);
    onUpdateClass({ ...classData, students: updatedStudents });
  };

  return (
    <div className="bg-white shadow rounded p-4 my-4">
      <div className="flex flex-wrap justify-between items-center">
        {isEditingClass ? (
          <div className="flex flex-wrap items-center space-x-2">
            <input
              type="text"
              name="className"
              value={editedClass.className}
              onChange={handleClassChange}
              className="border rounded p-1"
              placeholder="Class Name"
            />
            <input
              type="text"
              name="year"
              value={editedClass.year}
              onChange={handleClassChange}
              className="border rounded p-1 w-24"
              placeholder="Year"
            />
            <input
              type="file"
              name="photo"
              onChange={handleClassPhotoChange}
              className="border rounded p-1"
            />
            <button
              onClick={saveClassChanges}
              className="bg-green-500 text-white px-2 py-1 rounded"
            >
              Save
            </button>
            <button
              onClick={cancelClassChanges}
              className="bg-gray-500 text-white px-2 py-1 rounded"
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center space-x-4">
            {classData.photo && (
              <img
                src={classData.photo}
                alt="Class"
                className="h-16 w-16 object-cover rounded-full"
              />
            )}
            <h2 className="text-xl font-bold">{classData.className}</h2>
            <span className="text-gray-600">{classData.year}</span>
            <button
              onClick={() => setIsEditingClass(true)}
              className="bg-blue-500 text-white px-2 py-1 rounded"
            >
              Edit Class
            </button>
          </div>
        )}
        <button
          onClick={() => setShowAddStudent(!showAddStudent)}
          className="bg-indigo-500 text-white px-2 py-1 rounded mt-2 sm:mt-0"
        >
          {showAddStudent ? "Cancel" : "Add Student"}
        </button>
      </div>

      {message && <p className="mt-4 text-center text-green-500">{message}</p>} {/* Display message here */}

      {showAddStudent && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="font-bold mb-2">Add New Student</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Student Number</label>
              <input
                type="text"
                name="studentNumber"
                value={newStudent.studentNumber}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, studentNumber: e.target.value })
                }
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Student Name</label>
              <input
                type="text"
                name="studentName"
                value={newStudent.studentName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, studentName: e.target.value })
                }
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm">DOB</label>
              <input
                type="date"
                name="dob"
                value={newStudent.dob}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, dob: e.target.value })
                }
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Age</label>
              <input
                type="number"
                name="age"
                value={newStudent.age}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, age: e.target.value })
                }
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Name of Father</label>
              <input
                type="text"
                name="fatherName"
                value={newStudent.fatherName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, fatherName: e.target.value })
                }
                className="border rounded p-1 w-full"
              />
            </div>
            <div>
              <label className="block text-sm">Name of Mother</label>
              <input
                type="text"
                name="motherName"
                value={newStudent.motherName}
                onChange={(e) =>
                  setNewStudent({ ...newStudent, motherName: e.target.value })
                }
                className="border rounded p-1 w-full"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">Photo</label>
              <input
                type="file"
                name="photo"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewStudent({
                      ...newStudent,
                      photo: URL.createObjectURL(file),
                    });
                  }
                }}
                className="border rounded p-1 w-full"
              />
            </div>
          </div>
          <button
            onClick={addStudent}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
          >
            Add Student
          </button>
        </div>
      )}

      {classData.students.length > 0 && (
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Student Number</th>
                <th className="p-2">Student Name</th>
                <th className="p-2">DOB</th>
                <th className="p-2">Age</th>
                <th className="p-2">Name of Father</th>
                <th className="p-2">Name of Mother</th>
                <th className="p-2">Photo</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {classData.students.map((student) => (
                <StudentRow
                  key={student.id}
                  student={student}
                  onUpdateStudent={updateStudent}
                  onDeleteStudent={deleteStudent}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

ClassCard.propTypes = {
  classData: PropTypes.shape({
    id: PropTypes.number.isRequired,
    className: PropTypes.string.isRequired,
    year: PropTypes.string.isRequired,
    photo: PropTypes.string, // optional class photo
    students: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.number.isRequired,
        studentNumber: PropTypes.string.isRequired,
        studentName: PropTypes.string.isRequired,
        dob: PropTypes.string.isRequired,
        age: PropTypes.number.isRequired,
        fatherName: PropTypes.string.isRequired,
        motherName: PropTypes.string.isRequired,
        photo: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  onUpdateClass: PropTypes.func.isRequired,
};

/* ----- Students (App) Component ----- */
/* Main component that allows creation of classes and renders all class cards. */
const Students = () => {
  const [classes, setClasses] = useState([]);
  const [newClass, setNewClass] = useState({
      className: "",
      year: "",
      photo: "",
  });

  useEffect(() => {
      fetchClasses(); // Fetch classes when component mounts
  }, []); // Empty dependency array ensures this runs only once on mount

  const fetchClasses = async () => {
      try {
          const response = await fetch('http://localhost:5000/classes'); // GET all classes
          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }
          const classesData = await response.json();
          setClasses(classesData);
      } catch (error) {
          console.error("Could not fetch classes:", error);
      }
  };

  const addNewClass = async () => {
    if (newClass.className && newClass.year) {
        try {
            const response = await fetch('http://localhost:5000/classes', { // POST new class
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newClass),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const addedClass = await response.json();
            setClasses([...classes, addedClass]); // Update local state with the new class
            setNewClass({ className: "", year: "", photo: "" }); // Reset input form
        } catch (error) {
            console.error("Error adding new class:", error);
        }
    }
};

// Update a single class (its name, year, photo, or its students)Modified to call server
const updateClass = async (updatedClass) => {
    try {
        const response = await fetch(`http://localhost:5000/classes/${updatedClass.id}`, { // PUT update class
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedClass),
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedClassFromServer = await response.json(); // Get the updated class back from the server
        setClasses(classes.map((cls) => (cls.id === updatedClassFromServer.id ? updatedClassFromServer : cls))); // Update local state
    } catch (error) {
        console.error("Error updating class:", error);
    }
};

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">School Management System</h1>
        <div className="bg-white shadow rounded p-4 mb-6">
          <h2 className="text-xl font-bold mb-2">Create New Class/Course</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Class/Course Name</label>
              <input
                type="text"
                value={newClass.className}
                onChange={(e) =>
                  setNewClass({ ...newClass, className: e.target.value })
                }
                className="border rounded p-1 w-full"
                placeholder="e.g. Senior 4 / BBA 4600 / Primary 3"
              />
            </div>
            <div>
              <label className="block text-sm">Year</label>
              <input
                type="text"
                value={newClass.year}
                onChange={(e) =>
                  setNewClass({ ...newClass, year: e.target.value })
                }
                className="border rounded p-1 w-full"
                placeholder="e.g. 2025, 2020, 2005"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-sm">Class/Course Photo</label>
              <input
                type="file"
                name="photo"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    setNewClass({ ...newClass, photo: URL.createObjectURL(file) });
                  }
                }}
                className="border rounded p-1 w-full"
              />
            </div>
          </div>
          <button
            onClick={addNewClass}
            className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded"
          >
            Add Class/Course
          </button>
        </div>

        {classes.map((cls) => (
          <ClassCard key={cls.id} classData={cls} onUpdateClass={updateClass} />
        ))}
      </div>
    </div>
  );
};

export default Students;