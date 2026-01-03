/**
 * Role Helper Utilities
 * Provides role-based access control functions with hierarchy support
 * 
 * Role Hierarchy: ADMIN > MANAGER > TL > PM > QA > VIEWER
 * Higher roles can access all functionality of lower roles
 */

// Role constants
export const ROLE = {
    ADMIN: 'ADMIN',
    MANAGER: 'MANAGER',
    TL: 'TL',
    PM: 'PM',
    QA: 'QA',
    VIEWER: 'VIEWER',
} as const;

export type RoleType = typeof ROLE[keyof typeof ROLE];

// Role hierarchy levels (higher number = more permissions)
const ROLE_HIERARCHY: Record<string, number> = {
    ADMIN: 6,
    MANAGER: 5,
    TL: 4,
    PM: 3,
    QA: 2,
    VIEWER: 1,
};

/**
 * Check if user has exact role match
 * @param userRole - User's current role
 * @param requiredRole - Required role to check against
 * @returns true if roles match exactly
 */
export function hasRole(userRole: string, requiredRole: string): boolean {
    return userRole === requiredRole;
}

/**
 * Check if user has any of the required roles
 * @param userRole - User's current role
 * @param requiredRoles - Array of acceptable roles
 * @returns true if user has any of the required roles
 */
export function hasAnyRole(userRole: string, requiredRoles: string[]): boolean {
    return requiredRoles.some(role => hasRole(userRole, role));
}

/**
 * Check if user can access resource based on role hierarchy
 * ADMIN can access all resources
 * MANAGER can access TL, PM, QA, VIEWER resources
 * TL can access PM, QA, VIEWER resources
 * PM can access QA, VIEWER resources
 * QA can access VIEWER resources
 * VIEWER can only access VIEWER resources
 * 
 * @param userRole - User's current role
 * @param requiredRole - Required role for the resource
 * @returns true if user's role level >= required role level
 */
export function canAccess(userRole: string, requiredRole: string): boolean {
    const userLevel = ROLE_HIERARCHY[userRole] || 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;

    return userLevel >= requiredLevel;
}
