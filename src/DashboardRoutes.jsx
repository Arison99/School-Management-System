import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Pages/dashboard';
import Home from './Pages/home'; // Adjust the path if Home.jsx is in a different directory
import School from './Pages/school'; // Adjust the path if School.jsx is in a different directory
import Student from './Pages/student'; // Adjust the path if Student.jsx is in a different directory

const DashboardRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<ProtectedRoute element={<Dashboard />} />}>
        <Route index element={<Home />} />
        <Route path="student" element={<ProtectedRoute element={<Student />} />} />
        {/* Add more protected routes for the dashboard here */}
        <Route path="school" element={<ProtectedRoute element={<School />} />} />
      </Route>
    </Routes>
  );
};

export default DashboardRoutes;