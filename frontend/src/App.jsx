import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import Login from './Pages/login';
import SignUp from './Pages/Signup';
import Dashboard from './Pages/Dashboard';
import Home from './Pages/home';
import School from './Pages/school';
import Students from './Pages/student'; // Fix: Import Students component (note the 's' at the end)

import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        
        {/* Protected routes */}
        <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />}>
          <Route index element={<Navigate to="/dashboard/home" replace />} />
          <Route path="home" element={<Home />} />
          <Route path="school" element={<School />} />
          <Route path="student" element={<Students />} />
          {/* ...other dashboard routes... */}
        </Route>
        
      </Routes>
    </Router>
  );
}

export default App;