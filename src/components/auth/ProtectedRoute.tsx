/**
 * Protected Route Component
 * Wraps routes that require authentication and specific user roles
 * 
 * Features:
 * - Redirects to /login if not authenticated
 * - Redirects to /forbidden if authenticated but insufficient role
 * - Supports role hierarchy (ADMIN > MANAGER > TL > PM > QA > VIEWER)
 */

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { canAccess } from '../../utils/roleHelpers';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string; // Single role (backward compatibility)
    requiredRoles?: string[]; // Multiple allowed roles
}

export function ProtectedRoute({ children, requiredRole, requiredRoles }: ProtectedRouteProps) {
    const auth = useAuth();
    const location = useLocation();

    // Redirect to login if not authenticated
    if (!auth.isAuthenticated || !auth.user) {
        const returnUrl = location.pathname + location.search;
        return <Navigate to={`/login?returnUrl=${encodeURIComponent(returnUrl)}`} replace />;
    }

    // Check role-based access if role is required
    if (requiredRole || requiredRoles) {
        const userRole = auth.user.role;
        let hasAccess = false;

        if (requiredRoles && requiredRoles.length > 0) {
            // Check if user has any of the required roles (using hierarchy)
            hasAccess = requiredRoles.some(role => canAccess(userRole, role));
        } else if (requiredRole) {
            // Check single required role (using hierarchy)
            hasAccess = canAccess(userRole, requiredRole);
        }

        if (!hasAccess) {
            // Redirect to forbidden page with required role info
            return (
                <Navigate
                    to="/forbidden"
                    replace
                    state={{ requiredRole: requiredRole || requiredRoles?.join(', ') }}
                />
            );
        }
    }

    // User is authenticated and has access
    return <>{children}</>;
}

