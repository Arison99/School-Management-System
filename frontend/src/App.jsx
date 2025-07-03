import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Signup from './Pages/Signup';
import Login from './Pages/Login';
import DashboardRoutes from '../src/DashboardRoutes';
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Signup page as the homepage */}
        <Route path="/" element={<Signup />} />
        {/* Login page */}
        <Route path="/login" element={<Login />} />
        {/* Dashboard routes */}
        <Route path="/dashboard/*" element={<DashboardRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;