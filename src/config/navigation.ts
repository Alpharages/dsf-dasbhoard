import type { LucideIcon } from 'lucide-react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Brain,
  Briefcase,
  Building,
  CheckCircle,
  DollarSign,
  Gauge,
  Inbox,
  LayoutDashboard,
  Lock,
  MessageSquare,
  Settings,
  ShieldAlert,
  UserPlus,
  Users,
} from 'lucide-react';

export interface NavigationItem {
  icon: LucideIcon;
  label: string;
  path: string;
  roles?: string[];
  shortcut?: string;
}

export interface NavigationGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavigationItem[];
}

/**
 * Returns true if `itemPath` matches the current `currentPath`.
 * Shared by Sidebar and MobileSidebar to keep active-state logic consistent.
 */
export function isNavItemActive(itemPath: string, currentPath: string): boolean {
  if (itemPath === '/') return currentPath === '/';
  return currentPath.startsWith(itemPath);
}

export const navigationGroups: NavigationGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/', shortcut: 'G D' },
      { icon: Activity, label: 'Executions', path: '/executions', shortcut: 'G E' },
    ],
  },
  {
    id: 'projects',
    label: 'Projects & Work',
    icon: Briefcase,
    items: [
      { icon: Briefcase, label: 'Projects', path: '/projects/sync', shortcut: 'G P' },
      { icon: CheckCircle, label: 'Decisions', path: '/decisions', shortcut: 'G N' },
      { icon: Inbox, label: 'PM Approvals', path: '/approvals', roles: ['PM', 'TL', 'ADMIN', 'MANAGER'] },
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: BarChart3,
    items: [
      { icon: Gauge, label: 'Capacity Monitor', path: '/capacity-monitor' },
      { icon: DollarSign, label: 'Financial Metrics', path: '/financial-metrics', roles: ['MANAGER', 'ADMIN'] },
      { icon: BarChart3, label: 'Cost Analysis', path: '/cost' },
    ],
  },
  {
    id: 'architecture',
    label: 'Architecture',
    icon: Building,
    items: [
      { icon: Building, label: 'Review Queue', path: '/architecture-review/queue', roles: ['TL', 'ADMIN'] },
      { icon: BarChart3, label: 'Metrics & Insights', path: '/architecture-review/metrics', roles: ['TL', 'ADMIN'] },
      { icon: Settings, label: 'Constraints', path: '/architecture-review/constraints', roles: ['TL', 'ADMIN'] },
      { icon: Brain, label: 'AI Capabilities', path: '/architecture/capabilities' },
    ],
  },
  {
    id: 'operations',
    label: 'Operations',
    icon: AlertTriangle,
    items: [
      { icon: ShieldAlert, label: 'Audit Logs', path: '/audit-logs', roles: ['QA', 'TL', 'ADMIN', 'MANAGER'] },
      { icon: Lock, label: 'Resource Manager', path: '/resource-manager', roles: ['TL', 'ADMIN', 'MANAGER'] },
      { icon: Activity, label: 'Observability', path: '/observability', roles: ['PM', 'TL', 'QA', 'MANAGER', 'ADMIN', 'OPERATOR'] },
      { icon: AlertTriangle, label: 'Production Errors', path: '/production-errors' },
      { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    ],
  },
  {
    id: 'admin',
    label: 'Administration',
    icon: Users,
    items: [
      { icon: UserPlus, label: 'Invitations', path: '/admin/invitations', roles: ['MANAGER', 'ADMIN'] },
      { icon: Users, label: 'Users', path: '/admin/users', roles: ['ADMIN'] },
      { icon: Bell, label: 'Notifications', path: '/notifications/preferences' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ],
  },
];
