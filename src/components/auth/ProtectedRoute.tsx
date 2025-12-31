/**
 * Protected Route Component
 * Wraps routes that require specific user roles
 */

import { Navigate } from 'react-router-dom';

type AllowedRole = 'USER' | 'MANAGER' | 'ADMIN' | 'TL';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: AllowedRole;
}

export function ProtectedRoute({ children, requiredRole = 'USER' }: ProtectedRouteProps) {
    // TODO: Replace with actual user role check from auth context/hook
    // For now, we'll use a simple check based on localStorage
    const userRole = localStorage.getItem('userRole') || 'USER';

    const hasAccess = () => {
        if (requiredRole === 'ADMIN') {
            return userRole === 'ADMIN';
        }
        if (requiredRole === 'MANAGER') {
            return userRole === 'MANAGER' || userRole === 'ADMIN';
        }
        return true; // USER role
    };

    if (!hasAccess()) {
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
}
