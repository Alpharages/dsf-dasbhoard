import { useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams, Outlet, useLocation, type NavigateFunction } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts';
import { SocketProvider } from './contexts/SocketContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { TooltipProvider } from './components/ui/tooltip';
import { ImprovedSidebar } from './components/improved/Sidebar';
import { Header } from './components/layout/Header';
import { Toaster } from 'react-hot-toast';

import { Dashboard } from './pages/Dashboard';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { DecisionDashboard } from './pages/DecisionDashboard';
import { FinancialMetricsPage } from './pages/FinancialMetricsPage';
import { WorkloadCapacityPage } from './pages/WorkloadCapacityPage';
import { ProjectsSyncPage } from './pages/ProjectsSyncPage';
import { ArchitectureReviewQueuePage } from './pages/ArchitectureReviewQueuePage';
import { ConstraintsPage } from './pages/architecture-review/constraints/ConstraintsPage';
import ArchitectureMetricsPage from './pages/architecture-review/ArchitectureMetricsPage';
import { InvitationsPage } from './pages/InvitationsPage';
import UsersPage from './pages/UsersPage';
import { LeadQaReviewDashboardPage } from './pages/QaReviewDashboardPage';
import { ProductionErrorDashboard } from './pages/ProductionErrorDashboard';
import { ExecutionMonitoringDashboard } from './pages/ExecutionMonitoringDashboard';
import { NotificationPreferences } from './pages/NotificationPreferences';
import { PmApprovalDashboardPage } from './pages/PmApprovalDashboardPage';
import { AuditLogsDashboard } from './pages/AuditLogsDashboard';
import { ObservabilityPage } from './pages/observability';
import CostAnalysisPage from './pages/CostAnalysisPage';
import { CapabilityManagementPage } from './pages/CapabilityManagementPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsLayout } from './pages/settings/SettingsLayout';
import {
  CleanupPanel,
  SelfHealingPanel,
  DependencyPanel,
  AutoMergePanel,
  CostPanel,
  AuditPanel,
  HealthPanel,
  IntegrationHealthPanel,
} from './pages/settings/panels/AllPanels';
import { GithubCallback } from './pages/settings/GithubCallback';

import { ConversationUploadForm } from './components/conversations/ConversationUploadForm';
import { ConversationDetailView } from './components/conversations/ConversationDetailView';
import { ConversationSearchInterface } from './components/conversations/ConversationSearchInterface';
import { EscalationAnalyticsPage } from './components/architecture-review/EscalationAnalyticsPage';

import { ResourceManagerPage } from './features/resource-manager';

// Shared Layout component
function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Desktop Sidebar - visibility wrapper (fixed position handled by ImprovedSidebar internally) */}
      <div className="hidden md:block">
        <ImprovedSidebar />
      </div>

      {/* Main Content - margin to account for sidebar */}
      <main className="flex-1 md:ml-[72px] lg:ml-[280px] min-h-screen flex flex-col">
        {/* Header - full width within main content */}
        <Header />

        {/* Page Content - consistent padding */}
        <div className="flex-1 px-6 py-6">
          <Outlet />
        </div>
      </main>

      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: 'var(--card)',
            color: 'var(--card-foreground)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
          },
        }}
      />
    </div>
  );
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 60 seconds (AC#1)
      gcTime: 300 * 1000, // 5 minutes (AC#1)
    },
  },
});

function App() {
  const navigate = useNavigate();

  return (
    <AuthProvider>
      <SocketProvider>
        <AppContent navigate={navigate} />
      </SocketProvider>
    </AuthProvider>
  );
}

// Inner component to access useAuth hook
function AppContent({ navigate }: { navigate: NavigateFunction }) {
  const { isLoading } = useAuth();
  const location = useLocation();

  // Drive document.title from the current pathname via a static lookup.
  // useMatches() requires a data router (createBrowserRouter); useLocation() works with BrowserRouter.
  useEffect(() => {
    const routeTitles: [string, string][] = [
      ['/login', 'Login — DSF'],
      ['/register', 'Registration — DSF'],
      ['/forbidden', '403 Forbidden — DSF'],
      ['/profile', 'Profile — DSF'],
      ['/conversations/upload', 'Upload Conversation — DSF'],
      ['/conversations', 'Conversations — DSF'],
      ['/projects/sync', 'Projects Sync — DSF'],
      ['/decisions', 'Decisions — DSF'],
      ['/audit-logs', 'Audit Logs — DSF'],
      ['/resource-manager', 'Resource Manager — DSF'],
      ['/financial-metrics', 'Financial Metrics — DSF'],
      ['/cost', 'Cost Analysis — DSF'],
      ['/capacity-monitor', 'Capacity Monitor — DSF'],
      ['/qa-review/dashboard', 'QA Review — DSF'],
      ['/architecture-review/queue', 'Architecture Queue — DSF'],
      ['/architecture-review/constraints', 'Architecture Constraints — DSF'],
      ['/architecture-review/escalations', 'Escalations — DSF'],
      ['/architecture-review/metrics', 'Architecture Metrics — DSF'],
      ['/architecture/capabilities', 'Capabilities — DSF'],
      ['/admin/invitations', 'Invitations — DSF'],
      ['/admin/users', 'Users — DSF'],
      ['/settings', 'Settings — DSF'],
      ['/production-errors', 'Production Errors — DSF'],
      ['/approvals', 'PM Approvals — DSF'],
      ['/executions', 'Execution Monitoring — DSF'],
      ['/observability', 'Observability — DSF'],
      ['/notifications/preferences', 'Notification Preferences — DSF'],
    ];
    const path = location.pathname;
    const match = routeTitles.find(([key]) => path === key || path.startsWith(key + '/'));
    document.title = match ? match[1] : path === '/' ? 'PM Dashboard — DSF' : 'DSF Dashboard';
  }, [location.pathname]);

  // Suppress render during initial auth check (AppContent returns null; AuthContext initializes isLoading: true)
  if (isLoading) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" handle={{ title: 'Login — DSF' }} element={<LoginPage />} />
          <Route path="/register/:inviteToken" handle={{ title: 'Registration — DSF' }} element={<RegistrationPage />} />
          <Route path="/forbidden" handle={{ title: '403 Forbidden — DSF' }} element={<ForbiddenPage />} />

          {/* Protected routes inside DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Dashboard - all authenticated users */}
            <Route
              path="/"
              handle={{ title: 'PM Dashboard — DSF' }}
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              handle={{ title: 'Profile — DSF' }}
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            {/* Conversations - all authenticated users */}
            <Route
              path="/conversations"
              handle={{ title: 'Conversations — DSF' }}
              element={
                <ProtectedRoute>
                  <ConversationSearchInterface
                    onConversationClick={(id) => navigate(`/conversations/${id}`)}
                  />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations/upload"
              handle={{ title: 'Upload Conversation — DSF' }}
              element={
                <ProtectedRoute>
                  <ConversationUploadForm onSuccess={(id) => navigate(`/conversations/${id}`)} />
                </ProtectedRoute>
              }
            />
            <Route
              path="/conversations/:id"
              handle={{ title: 'Conversation Details — DSF' }}
              element={
                <ProtectedRoute>
                  <ConversationDetailViewWrapper />
                </ProtectedRoute>
              }
            />

            {/* /projects redirects to /projects/sync */}
            <Route path="/projects" element={<Navigate to="/projects/sync" replace />} />

            {/* Projects sync - all authenticated users */}
            <Route
              path="/projects/sync"
              handle={{ title: 'Projects Sync — DSF' }}
              element={
                <ProtectedRoute>
                  <ProjectsSyncPage />
                </ProtectedRoute>
              }
            />

            {/* Decisions - all authenticated users */}
            <Route
              path="/decisions"
              handle={{ title: 'Decisions — DSF' }}
              element={
                <ProtectedRoute>
                  <DecisionDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audit-logs"
              handle={{ title: 'Audit Logs — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['QA', 'TL', 'ADMIN', 'MANAGER']}>
                  <AuditLogsDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/resource-manager"
              handle={{ title: 'Resource Manager — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['TL', 'ADMIN', 'MANAGER']}>
                  <ResourceManagerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/financial-metrics"
              handle={{ title: 'Financial Metrics — DSF' }}
              element={
                <ProtectedRoute requiredRole="MANAGER">
                  <FinancialMetricsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost"
              handle={{ title: 'Cost Analysis — DSF' }}
              element={
                <ProtectedRoute>
                  <CostAnalysisPage />
                </ProtectedRoute>
              }
            />
            {/* Capacity monitor - all authenticated users */}
            <Route
              path="/capacity-monitor"
              handle={{ title: 'Capacity Monitor — DSF' }}
              element={
                <ProtectedRoute>
                  <WorkloadCapacityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qa-review/dashboard"
              handle={{ title: 'QA Review — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['QA', 'TL', 'ADMIN', 'MANAGER']}>
                  <LeadQaReviewDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/queue"
              handle={{ title: 'Architecture Queue — DSF' }}
              element={
                <ProtectedRoute requiredRole="TL">
                  <ArchitectureReviewQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/constraints"
              handle={{ title: 'Architecture Constraints — DSF' }}
              element={
                <ProtectedRoute requiredRole="TL">
                  <ConstraintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/escalations"
              handle={{ title: 'Escalations — DSF' }}
              element={
                <ProtectedRoute requiredRole="TL">
                  <EscalationAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/metrics"
              handle={{ title: 'Architecture Metrics — DSF' }}
              element={
                <ProtectedRoute requiredRole="TL">
                  <ArchitectureMetricsPage />
                </ProtectedRoute>
              }
            />
            {/* Architecture capabilities - all authenticated users */}
            <Route
              path="/architecture/capabilities"
              handle={{ title: 'Capabilities — DSF' }}
              element={
                <ProtectedRoute>
                  <CapabilityManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Admin/Manager routes */}
            <Route
              path="/admin/invitations"
              handle={{ title: 'Invitations — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
                  <InvitationsPage />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/users"
              handle={{ title: 'Users — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['ADMIN']}>
                  <UsersPage />
                </ProtectedRoute>
              }
            />

            {/* Settings - all authenticated users */}
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <SettingsLayout />
                </ProtectedRoute>
              }
            >
              <Route path="cleanup" handle={{ title: 'Settings: Cleanup — DSF' }} element={<CleanupPanel />} />
              <Route path="self-healing" handle={{ title: 'Settings: Self-Healing — DSF' }} element={<SelfHealingPanel />} />
              <Route path="dependency" handle={{ title: 'Settings: Dependencies — DSF' }} element={<DependencyPanel />} />
              <Route path="auto-merge" handle={{ title: 'Settings: Auto-Merge — DSF' }} element={<AutoMergePanel />} />
              <Route path="cost" handle={{ title: 'Settings: Cost Control — DSF' }} element={<CostPanel />} />
              <Route path="audit" handle={{ title: 'Settings: Audit — DSF' }} element={<AuditPanel />} />
              <Route path="health" handle={{ title: 'Settings: Deployment Health — DSF' }} element={<HealthPanel />} />
              <Route path="integrations" handle={{ title: 'Settings: Integration Health — DSF' }} element={<ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}><IntegrationHealthPanel /></ProtectedRoute>} />
              <Route path="github/callback" handle={{ title: 'GitHub Auth — DSF' }} element={<GithubCallback />} />
              <Route index handle={{ title: 'Settings: Cleanup — DSF' }} element={<CleanupPanel />} /> {/* Default to cleanup */}
            </Route>

            {/* Production Errors - all authenticated users */}
            <Route
              path="/production-errors"
              handle={{ title: 'Production Errors — DSF' }}
              element={
                <ProtectedRoute>
                  <ProductionErrorDashboard />
                </ProtectedRoute>
              }
            />

            {/* PM Approval Queue - PM, TL, Manager, Admin */}
            <Route
              path="/approvals"
              handle={{ title: 'PM Approvals — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['PM', 'TL', 'MANAGER', 'ADMIN']}>
                  <PmApprovalDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Execution Monitoring - PM, TL, Manager, Admin */}
            <Route
              path="/executions"
              handle={{ title: 'Execution Monitoring — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['PM', 'TL', 'MANAGER', 'ADMIN']}>
                  <ExecutionMonitoringDashboard />
                </ProtectedRoute>
              }
            />

            {/* Observability Control Panel - PM, TL, QA, Manager, Admin, Operator */}
            <Route
              path="/observability"
              handle={{ title: 'Observability — DSF' }}
              element={
                <ProtectedRoute requiredRoles={['PM', 'TL', 'QA', 'MANAGER', 'ADMIN', 'OPERATOR']}>
                  <ObservabilityPage />
                </ProtectedRoute>
              }
            />

            {/* Notification Preferences - all authenticated users */}
            <Route
              path="/notifications/preferences"
              handle={{ title: 'Notification Preferences — DSF' }}
              element={
                <ProtectedRoute>
                  <NotificationPreferences />
                </ProtectedRoute>
              }
            />

            {/* Catch-all renders a dedicated 404 page (protected) */}
            <Route
              path="*"
              handle={{ title: '404 Not Found — DSF' }}
              element={
                <ProtectedRoute>
                  <NotFoundPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

// Wrapper to extract :id param using useParams hook
function ConversationDetailViewWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ConversationDetailView conversationId={id || ''} />;
}

export default App;
