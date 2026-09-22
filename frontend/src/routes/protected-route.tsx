import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../providers/auth-provider';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children?: ReactNode;
  requiredRole?: 'student' | 'instructor' | 'admin';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force password change — block all other routes
  if (user.mustChangePassword) {
    return <Navigate to="/change-password" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    if (requiredRole === 'admin' && user.role === 'admin') {
      // Admin has access everywhere
    } else if (requiredRole === 'instructor' && (user.role === 'instructor' || user.role === 'admin')) {
      // Instructors and admins have access
    } else {
      return <Navigate to="/403" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
