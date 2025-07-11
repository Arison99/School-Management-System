import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import studentService from '../api/studentService';

/* ----- StudentRow Component ----- */
/* Renders one student record with inline editing. */
const StudentRow = ({ student, onUpdateStudent, onDeleteStudent }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStudent, setEditedStudent] = useState({ ...student });
  const [photoFile, setPhotoFile] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedStudent((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
      setEditedStudent((prev) => ({
        ...prev,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const handleSave = () => {
    const dataToUpdate = { ...editedStudent };
    if (photoFile) {
      dataToUpdate.photo = photoFile;
    }
    delete dataToUpdate.photoPreview;
    onUpdateStudent(dataToUpdate);
    setIsEditing(false);
    setPhotoFile(null);
  };

  const handleCancel = () => {
    setEditedStudent({ ...student });
    setIsEditing(false);
    setPhotoFile(null);
  };

  const getPhotoUrl = (photo) => {
    if (editedStudent.photoPreview) return editedStudent.photoPreview;
    if (photo && photo.startsWith('http')) return photo;
    if (photo && photo.startsWith('/')) return `http://localhost:6001${photo}`;
    return photo;
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
            disabled
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
            accept="image/*"
          />
        ) : (
          student.photo && (
            <img
              src={getPhotoUrl(student.photo)}
              alt="Student"
              className="h-16 w-16 object-cover rounded-full"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
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
/* Renders a class "card" with editable class details and its list of students. */
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
    photo: null,
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleClassChange = (e) => {
    const { name, value } = e.target;
    setEditedClass((prev) => ({ ...prev, [name]: value }));
  };

  const handleClassPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setEditedClass((prev) => ({
        ...prev,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      }));
    }
  };

  const saveClassChanges = () => {
    const dataToUpdate = { ...editedClass };
    // Remove preview URL before sending to backend
    delete dataToUpdate.photoPreview;
    delete dataToUpdate.students; // Don't send students array when updating class
    onUpdateClass(dataToUpdate);
    setIsEditingClass(false);
  };

  const cancelClassChanges = () => {
    setEditedClass({ ...classData });
    setIsEditingClass(false);
  };

  const handleNewStudentPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewStudent({
        ...newStudent,
        photo: file,
        photoPreview: URL.createObjectURL(file),
      });
    }
  };

  const addStudent = async () => {
    if (newStudent.studentNumber && newStudent.studentName) {
      setLoading(true);
      try {
        const studentToAdd = { ...newStudent };
        delete studentToAdd.photoPreview;
        
        const result = await studentService.addStudentToClass(classData.id, studentToAdd);
        if (result.success) {
          // Refresh the class data
          const updatedClass = await studentService.getClassById(classData.id);
          if (updatedClass.success) {
            onUpdateClass(updatedClass.data);
          }
          // Reset form
          setNewStudent({
            studentNumber: "",
            studentName: "",
            dob: "",
            age: "",
            fatherName: "",
            motherName: "",
            photo: null,
          });
          setShowAddStudent(false);
          setMessage('Student added successfully!');
          setTimeout(() => setMessage(''), 3000);
        } else {
          setMessage(result.message || 'Failed to add student');
        }
      } catch (error) {
        setMessage('Error adding student');
      } finally {
        setLoading(false);
      }
    } else {
      setMessage('Student Number and Student Name are required.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const updateStudent = async (updatedStudent) => {
    setLoading(true);
    try {
      const result = await studentService.updateStudent(
        classData.id,
        updatedStudent.id,
        updatedStudent
      );
      if (result.success) {
        // Refresh the class data
        const updatedClass = await studentService.getClassById(classData.id);
        if (updatedClass.success) {
          onUpdateClass(updatedClass.data);
        }
      }
    } catch (error) {
      setMessage('Error updating student');
    } finally {
      setLoading(false);
    }
  };

  const deleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      setLoading(true);
      try {
        const result = await studentService.deleteStudent(classData.id, studentId);
        if (result.success) {
          // Refresh the class data
          const updatedClass = await studentService.getClassById(classData.id);
          if (updatedClass.success) {
            onUpdateClass(updatedClass.data);
          }
        }
      } catch (error) {
        setMessage('Error deleting student');
      } finally {
        setLoading(false);
      }
    }
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
              accept="image/*"
            />
            <button
              onClick={saveClassChanges}
              className="bg-green-500 text-white px-2 py-1 rounded"
              disabled={loading}
            >
              Save
            </button>
            <button
              onClick={cancelClassChanges}
              className="bg-gray-500 text-white px-2 py-1 rounded"
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center space-x-4">
            {(classData.photoPreview || classData.photo) && (
              <img
                src={classData.photoPreview || `http://localhost:6001${classData.photo}`}
                alt="Class"
                className="h-16 w-16 object-cover rounded-full"
              />
            )}
            <h2 className="text-xl font-bold">{classData.className}</h2>
            <span className="text-gray-600">{classData.year}</span>
            <span className="text-sm text-gray-500">
              ({classData.students?.length || 0} students)
            </span>
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
          disabled={loading}
        >
          {showAddStudent ? "Cancel" : "Add Student"}
        </button>
      </div>

      {message && (
        <p className={`mt-4 text-center ${
          message.includes('Error') || message.includes('required') 
            ? 'text-red-500' 
            : 'text-green-500'
        }`}>
          {message}
        </p>
      )}

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
                onChange={handleNewStudentPhotoChange}
                className="border rounded p-1 w-full"
                accept="image/*"
              />
              {newStudent.photoPreview && (
                <img 
                  src={newStudent.photoPreview} 
                  alt="Preview" 
                  className="mt-2 h-20 w-20 object-cover rounded"
                />
              )}
            </div>
          </div>
          <button
            onClick={addStudent}
            className="mt-4 bg-green-500 text-white px-4 py-2 rounded"
            disabled={loading}
          >
            {loading ? 'Adding...' : 'Add Student'}
          </button>
        </div>
      )}

      {classData.students && classData.students.length > 0 && (
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
      photo: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
      fetchClasses();
  }, []);

  const fetchClasses = async () => {
      setLoading(true);
      try {
          const result = await studentService.getAllClasses();
          if (result.success) {
              setClasses(result.data);
          } else {
              setError(result.message);
          }
      } catch (error) {
          console.error("Could not fetch classes:", error);
          setError('Failed to load classes');
      } finally {
          setLoading(false);
      }
  };

  const addNewClass = async () => {
    const validation = studentService.validateClassData(newClass);
    if (!validation.isValid) {
        setError(Object.values(validation.errors).join(', '));
        return;
    }

    setLoading(true);
    try {
        const result = await studentService.createClass(newClass);
        if (result.success) {
            setClasses([...classes, result.data]);
            setNewClass({ className: "", year: "", photo: null });
            setError('');
        } else {
            setError(result.message);
        }
    } catch (error) {
        console.error("Error adding new class:", error);
        setError('Failed to add class');
    } finally {
        setLoading(false);
    }
  };

  const updateClass = async (updatedClass) => {
    setLoading(true);
    try {
        const result = await studentService.updateClass(updatedClass.id, updatedClass);
        if (result.success) {
            setClasses(classes.map((cls) => (cls.id === result.data.id ? result.data : cls)));
            setError('');
        } else {
            setError(result.message);
        }
    } catch (error) {
        console.error("Error updating class:", error);
        setError('Failed to update class');
    } finally {
        setLoading(false);
    }
  };

  const handleClassPhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewClass({ ...newClass, photo: file });
    }
  };

  if (loading && classes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-xl">Loading classes...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-4">School Management System</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

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
                onChange={handleClassPhotoChange}
                className="border rounded p-1 w-full"
                accept="image/*"
              />
            </div>
          </div>
          <button
            onClick={addNewClass}
            disabled={loading}
            className={`mt-4 bg-indigo-500 text-white px-4 py-2 rounded ${
              loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600'
            }`}
          >
            {loading ? 'Adding...' : 'Add Class/Course'}
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