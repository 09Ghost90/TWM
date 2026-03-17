import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function RequireAuth({ children, role }) {
  const { isAuthenticated, papel } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (role && papel !== role) {
    const redirectPath = papel === 'cliente' ? '/cliente/area' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
