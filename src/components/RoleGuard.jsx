import { useAuth } from '@/lib/AuthContext';
import { Navigate } from 'react-router-dom';

/**
 * Renders children only if user has one of the allowed roles.
 * Otherwise redirects to `fallback` (default: "/").
 */
export default function RoleGuard({ roles = [], fallback = '/', children }) {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to={fallback} replace />;

  return children;
}