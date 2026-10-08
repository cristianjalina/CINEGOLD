import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';

function hasRequiredRole(user, roles) {
  if (!roles || roles.length === 0) {
    return true;
  }

  return Boolean(user?.roles?.some((role) => roles.includes(role)));
}

export default function ProtectedRoute({ roles = [] }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black text-white">
        Cargando...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!hasRequiredRole(user, roles)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
