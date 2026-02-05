/**
 * Permission Utilities
 * Role-based access control for execution controls and UI features
 */

import type { User } from '@/contexts/AuthContext';
import type { Execution, ExecutionStatus } from '@/types/execution';

// Role hierarchy - higher index = more permissions
const ROLE_HIERARCHY: Record<string, number> = {
  'VIEWER': 0,
  'QA': 1,
  'PM': 2,
  'TL': 3,
  'MANAGER': 4,
  'ADMIN': 5,
};

/**
 * Check if a user can control (pause/resume/emergency-stop) an execution
 * Rules:
 * - ADMIN: Can control all executions
 * - MANAGER, PM, TL: Can control executions for their projects
 * - QA, VIEWER: View-only (no control)
 */
export function canControlExecution(
  user: User | null,
  _execution: Execution
): boolean {
  if (!user) return false;

  // ADMIN can control all executions
  if (user.role === 'ADMIN') return true;

  // QA and VIEWER cannot control executions
  if (user.role === 'QA' || user.role === 'VIEWER') return false;

  // MANAGER, PM, TL can only control executions for their projects
  // Note: In a real implementation, we would check if the user has access to the project
  // For now, we assume all MANAGER/PM/TL roles can control any execution
  // This should be enhanced with project membership checks
  return ['MANAGER', 'PM', 'TL'].includes(user.role);
}

/**
 * Check if user has at least the specified role level
 */
export function hasMinimumRole(user: User | null, minRole: string): boolean {
  if (!user) return false;
  
  const userLevel = ROLE_HIERARCHY[user.role] ?? -1;
  const minLevel = ROLE_HIERARCHY[minRole] ?? 999;
  
  return userLevel >= minLevel;
}

/**
 * Check if user can view execution controls (buttons visibility)
 * This is for UX purposes - actual authorization happens on the backend
 */
export function canViewExecutionControls(user: User | null): boolean {
  if (!user) return false;
  
  // Only ADMIN, MANAGER, PM, TL can see controls
  return ['ADMIN', 'MANAGER', 'PM', 'TL'].includes(user.role);
}

/**
 * Check if user can configure notification preferences
 * All authenticated users can configure their own preferences
 */
export function canConfigureNotifications(user: User | null): boolean {
  return user !== null;
}

/**
 * Check if user can view all notification preferences (admin view)
 */
export function canViewAllNotifications(user: User | null): boolean {
  return hasMinimumRole(user, 'ADMIN');
}

/**
 * Check if user can access specific notification event types
 * Some event types may be admin-only
 */
export function canAccessEventType(
  user: User | null,
  eventType: string
): boolean {
  if (!user) return false;

  // Admin-only event types
  const adminOnlyEvents = [
    'error.production',
    'system.alert',
  ];

  if (adminOnlyEvents.includes(eventType)) {
    return user.role === 'ADMIN';
  }

  return true;
}

/**
 * Get available control actions for an execution based on status
 */
export function getAvailableControls(
  status: ExecutionStatus
): ('pause' | 'resume' | 'emergency-stop')[] {
  switch (status) {
    case 'QUEUED':
      return ['emergency-stop'];
    case 'IN_PROGRESS':
      return ['pause', 'emergency-stop'];
    case 'PAUSED':
      return ['resume', 'emergency-stop'];
    case 'COMPLETED':
    case 'FAILED':
    case 'TIMEOUT':
    case 'CANCELLED':
      return [];
    default:
      return [];
  }
}

/**
 * Check if a specific control action is available for an execution
 */
export function isControlAvailable(
  action: 'pause' | 'resume' | 'emergency-stop',
  status: ExecutionStatus
): boolean {
  const available = getAvailableControls(status);
  return available.includes(action);
}

/**
 * Permission result with reason
 */
export interface PermissionCheck {
  allowed: boolean;
  reason?: string;
}

/**
 * Detailed permission check for execution control
 */
export function checkExecutionControlPermission(
  user: User | null,
  execution: Execution,
  action: 'pause' | 'resume' | 'emergency-stop'
): PermissionCheck {
  if (!user) {
    return { allowed: false, reason: 'Not authenticated' };
  }

  // Check if action is available for current status
  if (!isControlAvailable(action, execution.status)) {
    return { 
      allowed: false, 
      reason: `Cannot ${action} execution with status ${execution.status}` 
    };
  }

  // Check role-based permission
  if (!canControlExecution(user, execution)) {
    return { 
      allowed: false, 
      reason: 'Insufficient permissions. Only PMs, TLs, Managers, and Admins can control executions.' 
    };
  }

  return { allowed: true };
}

/**
 * Filter executions that user can control
 */
export function filterControllableExecutions(
  user: User | null,
  executions: Execution[]
): Execution[] {
  if (!user) return [];
  
  if (user.role === 'ADMIN') return executions;
  
  if (['MANAGER', 'PM', 'TL'].includes(user.role)) {
    // In a real implementation, filter by user's projects
    // For now, return all executions for these roles
    return executions;
  }
  
  return [];
}
