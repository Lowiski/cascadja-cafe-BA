import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService.js';

// Gates the whole dashboard and every write form behind the admin token.
export default function RequireAuth({ children }) {
  const location = useLocation();
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
