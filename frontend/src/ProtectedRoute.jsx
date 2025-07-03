import { Navigate, useLocation } from 'react-router-dom';
import loginService from './api/loginService';

const ProtectedRoute = ({ element }) => {
  const location = useLocation();
  const isAuthenticated = loginService.isAuthenticated();

  // If not authenticated, redirect to login with the intended destination
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;