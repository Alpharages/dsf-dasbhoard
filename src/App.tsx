import { Routes, Route, useNavigate, useParams, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatsGrid } from './components/dashboard/StatsGrid';
import { ProjectCard } from './components/dashboard/ProjectCard';
import { Filter, Grid, List, SortAsc, Plus, RefreshCw } from 'lucide-react';
import type { Project, DashboardSummary } from './types';
import apiClient from './api/client';
import { useState, useEffect } from 'react';
import { useSocket } from './hooks/useSocket';
import { useProjectUpdates } from './hooks/useProjectUpdates';
import { ReviewModal } from './components/quality-gate/ReviewModal';
import { ConversationUploadForm } from './components/conversations/ConversationUploadForm';
import { ConversationDetailView } from './components/conversations/ConversationDetailView';
import { ConversationSearchInterface } from './components/conversations/ConversationSearchInterface';
import { ConversationListWidget } from './components/conversations/ConversationListWidget';
import { CommandPalette } from './components/ux/CommandPalette';
import { HelpModal } from './components/ux/HelpModal';
import { useHotkeys } from 'react-hotkeys-hook';
import { SettingsLayout } from './pages/settings/SettingsLayout';
import {
  CleanupPanel,
  SelfHealingPanel,
  DependencyPanel,
  AutoMergePanel,
  CostPanel,
  AuditPanel,
  HealthPanel
} from './pages/settings/panels/AllPanels';
import { GithubCallback } from './pages/settings/GithubCallback';
import { DecisionDashboard } from './pages/DecisionDashboard';
import { FinancialMetricsPage } from './pages/FinancialMetricsPage';
import { WorkloadCapacityPage } from './pages/WorkloadCapacityPage';
import { ProjectsSyncPage } from './pages/ProjectsSyncPage';
import { Toaster, toast } from 'react-hot-toast';
import { FinancialMetricsSection } from './components/financial/FinancialMetricsSection';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { AuthProvider, useAuth } from './contexts';
import { ForbiddenPage } from './pages/ForbiddenPage';
import { Loader2 } from 'lucide-react';

import { ArchitectureReviewQueuePage } from './pages/ArchitectureReviewQueuePage';
import { ConstraintsPage } from './pages/architecture-review/constraints/ConstraintsPage';
import { EscalationAnalyticsPage } from './components/architecture-review/EscalationAnalyticsPage';
import ArchitectureMetricsPage from './pages/architecture-review/ArchitectureMetricsPage';
import { InvitationsPage } from './pages/InvitationsPage';
import UsersPage from './pages/UsersPage';
import { LeadQaReviewDashboardPage } from './pages/QaReviewDashboardPage';
import { ProductionErrorDashboard } from './pages/ProductionErrorDashboard';
import { ExecutionMonitoringDashboard } from './pages/ExecutionMonitoringDashboard';
import { NotificationPreferences } from './pages/NotificationPreferences';
import { PmApprovalDashboardPage } from './pages/PmApprovalDashboardPage';
import { AuditLogsDashboard } from './pages/AuditLogsDashboard';
import { ResourceManagerPage } from './features/resource-manager';
import { ObservabilityPage } from './pages/observability';
import CostAnalysisPage from './pages/CostAnalysisPage';



// Shared Layout component
function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* Desktop Sidebar - fixed position */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[280px] z-40">
        <Sidebar />
      </aside>
      
      {/* Main Content - margin to account for sidebar */}
      <main className="flex-1 lg:ml-[280px] min-h-screen flex flex-col">
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
          }
        }}
      />
    </div>
  );
}

// Dashboard component
function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';

  const { socket, connected } = useSocket(token);
  useProjectUpdates(socket, setProjects);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleShortcutAction = async (decision: 'APPROVE' | 'REJECT' | 'REWORK', label: string) => {
    if (!reviewState.isOpen) return;

    try {
      await apiClient.post(`/executions/${reviewState.executionId}/approve`, {
        decision,
        reasoning: `Action triggered via keyboard shortcut (${label})`
      });

      toast.success(`${label} successful!`);
      setReviewState(prev => ({ ...prev, isOpen: false }));
      fetchData();
    } catch (err: any) {
      console.error(`Failed to ${label}:`, err);
      toast.error(`Failed to ${label}`);
    }
  };

  useHotkeys('mod+k, /', (e) => {
    e.preventDefault();
    setIsPaletteOpen((prev) => !prev);
    recordShortcutUsage(e.key === '/' ? 'search' : 'cmdk');
  }, { enableOnFormTags: true });

  useHotkeys('shift+?', (e) => {
    e.preventDefault();
    setIsHelpOpen(true);
    recordShortcutUsage('help');
  });

  useHotkeys('n', (e) => {
    e.preventDefault();
    if (isPaletteOpen || isHelpOpen || reviewState.isOpen) return;
    toast.success('New Project creation opened (Shortcut: N)');
    recordShortcutUsage('new_project');
  });

  useHotkeys('a', (e) => {
    e.preventDefault();
    if (reviewState.isOpen) {
      handleShortcutAction('APPROVE', 'Approval');
      recordShortcutUsage('approve');
    }
  });

  useHotkeys('r', (e) => {
    e.preventDefault();
    if (reviewState.isOpen) {
      handleShortcutAction('REJECT', 'Rejection');
      recordShortcutUsage('reject');
    }
  });

  useHotkeys('e', (e) => {
    e.preventDefault();
    if (reviewState.isOpen) {
      handleShortcutAction('REWORK', 'Rework');
      recordShortcutUsage('rework');
    }
  });

  useHotkeys('esc', (e) => {
    e.preventDefault();
    if (isPaletteOpen) setIsPaletteOpen(false);
    if (isHelpOpen) setIsHelpOpen(false);
    if (reviewState.isOpen) setReviewState(prev => ({ ...prev, isOpen: false }));
  });

  const recordShortcutUsage = async (shortcut: string) => {
    try {
      await apiClient.post('/telemetry/shortcut', { shortcut });
    } catch (err) {
      console.error('Failed to log shortcut usage:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [projectsRes, summaryRes] = await Promise.all([
        apiClient.get('/pm-dashboard/projects'),
        apiClient.get('/pm-dashboard/summary')
      ]);

      setProjects(projectsRes.data.data);
      setSummary(summaryRes.data);
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    projectName: string;
    ticketTitle: string;
    executionId: string;
    qaSummary: any;
    diffs: any[];
    ticketRequirements: string;
    confidenceScore: number;
  }>({
    isOpen: false,
    projectName: '',
    ticketTitle: '',
    executionId: '',
    qaSummary: null,
    diffs: [],
    ticketRequirements: '',
    confidenceScore: 0
  });

  const handleReview = async (project: Project) => {
    setReviewState({
      isOpen: true,
      projectName: project.name,
      ticketTitle: 'Update Dashboard Components',
      executionId: 'exec-12345',
      ticketRequirements: '1. Update the layout to use a darker theme.\n2. Ensure responsiveness for mobile devices.\n3. Add a new ProjectCard component for displaying project details.',
      confidenceScore: 0.89,
      qaSummary: {
        linting_passed: true,
        tests_passed: true,
        test_coverage: 85,
        quality_score: 92
      },
      diffs: [
        {
          fileName: 'src/components/Dashboard.tsx',
          oldCode: 'const Dashboard = () => { return <div>Old Dashboard</div> }',
          newCode: 'const Dashboard = () => { return <div className="bg-slate-900">New Premium Dashboard</div> }'
        }
      ]
    });
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">
              PM Dashboard
            </h1>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${connected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20 '
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`}></div>
              {connected ? 'Real-time Live' : 'Offline'}
            </div>
          </div>
          <p className="text-muted-foreground font-medium">
            Monitor your project portfolio and AI metrics in real-time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="p-3 bg-card border border-border text-muted-foreground hover:text-foreground rounded-2xl transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 mb-8 text-destructive flex items-center justify-between">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-bold">Retry</button>
        </div>
      )}

      {summary && <StatsGrid summary={summary} />}

      {/* Recent Conversations Widget */}
      <div className="mb-8">
        <ConversationListWidget
          onConversationClick={(id) => navigate(`/conversations/${id}`)}
          onViewAll={() => navigate('/conversations')}
        />
      </div>

      {/* Financial Metrics Section (Manager/Admin only) - Story 6-R-3 */}
      <FinancialMetricsSection projectId={projects[0]?.id} />

      <div className="bg-card/40 border border-border rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 bg-secondary text-primary rounded-lg shadow-inner ring-1 ring-background/5">
            <Grid className="w-5 h-5" />
          </button>
          <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
            <List className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-border mx-2"></div>
          <div className="text-sm font-bold text-muted-foreground">
            Sorted by <span className="text-foreground">Last Activity</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold rounded-xl border border-border/50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold rounded-xl border border-border/50 transition-all">
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-card/50 border border-border animate-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onReview={handleReview}
            />
          ))}
        </div>
      ) : !error && (
        <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-3xl">
          <p className="text-muted-foreground text-xl font-medium">No projects found. Create your first one!</p>
        </div>
      )}

      <ReviewModal
        isOpen={reviewState.isOpen}
        onClose={() => setReviewState(prev => ({ ...prev, isOpen: false }))}
        executionId={reviewState.executionId}
        projectName={reviewState.projectName}
        ticketTitle={reviewState.ticketTitle}
        ticketRequirements={reviewState.ticketRequirements}
        confidenceScore={reviewState.confidenceScore}
        qaSummary={reviewState.qaSummary}
        diffs={reviewState.diffs}
        onActionComplete={fetchData}
      />

      <CommandPalette isOpen={isPaletteOpen} onClose={() => setIsPaletteOpen(false)} onOpenHelp={() => setIsHelpOpen(true)} />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}

import { CapabilityManagementPage } from './pages/CapabilityManagementPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from './components/ui/tooltip';
import { LoginPage } from './pages/LoginPage';
import { RegistrationPage } from './pages/RegistrationPage';
import { ProfilePage } from './pages/ProfilePage';

const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();

  return (
    <AuthProvider>
      <AppContent navigate={navigate} />
    </AuthProvider>
  );
}

// Inner component to access useAuth hook
function AppContent({ navigate }: { navigate: any }) {
  const { isLoading } = useAuth();

  // Show global loading overlay during initial auth check
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register/:inviteToken" element={<RegistrationPage />} />
          <Route path="/forbidden" element={<ForbiddenPage />} />

          {/* Protected routes inside DashboardLayout */}
          <Route element={<DashboardLayout />}>
            {/* Dashboard - all authenticated users */}
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } />
            {/* Conversations - all authenticated users */}
            <Route path="/conversations" element={
              <ProtectedRoute>
                <ConversationSearchInterface onConversationClick={(id) => navigate(`/conversations/${id}`)} />
              </ProtectedRoute>
            } />
            <Route path="/conversations/upload" element={
              <ProtectedRoute>
                <ConversationUploadForm onSuccess={(id) => navigate(`/conversations/${id}`)} />
              </ProtectedRoute>
            } />
            <Route path="/conversations/:id" element={
              <ProtectedRoute>
                <ConversationDetailViewWrapper />
              </ProtectedRoute>
            } />

            {/* Projects sync - all authenticated users */}
            <Route path="/projects/sync" element={
              <ProtectedRoute>
                <ProjectsSyncPage />
              </ProtectedRoute>
            } />

            {/* Decisions - all authenticated users */}
            <Route path="/decisions" element={
              <ProtectedRoute>
                <DecisionDashboard />
              </ProtectedRoute>
            } />
            <Route path="/audit-logs" element={
              <ProtectedRoute requiredRoles={['QA', 'TL', 'ADMIN', 'MANAGER']}>
                <AuditLogsDashboard />
              </ProtectedRoute>
            } />
            <Route path="/resource-manager" element={
              <ProtectedRoute requiredRoles={['TL', 'ADMIN', 'MANAGER']}>
                <ResourceManagerPage />
              </ProtectedRoute>
            } />
            <Route
              path="/financial-metrics"
              element={
                <ProtectedRoute requiredRole="MANAGER">
                  <FinancialMetricsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/cost"
              element={
                <ProtectedRoute>
                  <CostAnalysisPage />
                </ProtectedRoute>
              }
            />
            {/* Capacity monitor - all authenticated users */}
            <Route
              path="/capacity-monitor"
              element={
                <ProtectedRoute>
                  <WorkloadCapacityPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/qa-review/dashboard"
              element={
                <ProtectedRoute requiredRoles={['QA', 'TL', 'ADMIN', 'MANAGER']}>
                  <LeadQaReviewDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/queue"
              element={
                <ProtectedRoute requiredRole="TL">
                  <ArchitectureReviewQueuePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/constraints"
              element={
                <ProtectedRoute requiredRole="TL">
                  <ConstraintsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/escalations"
              element={
                <ProtectedRoute requiredRole="TL">
                  <EscalationAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/architecture-review/metrics"
              element={
                <ProtectedRoute requiredRole="TL">
                  <ArchitectureMetricsPage />
                </ProtectedRoute>
              }
            />
            {/* Architecture capabilities - all authenticated users */}
            <Route
              path="/architecture/capabilities"
              element={
                <ProtectedRoute>
                  <CapabilityManagementPage />
                </ProtectedRoute>
              }
            />

            {/* Admin/Manager routes */}
            <Route path="/admin/invitations" element={
              <ProtectedRoute requiredRoles={['ADMIN', 'MANAGER']}>
                <InvitationsPage />
              </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
              <ProtectedRoute requiredRoles={['ADMIN']}>
                <UsersPage />
              </ProtectedRoute>
            } />

            {/* Settings - all authenticated users */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }>
              <Route path="cleanup" element={<CleanupPanel />} />
              <Route path="self-healing" element={<SelfHealingPanel />} />
              <Route path="dependency" element={<DependencyPanel />} />
              <Route path="auto-merge" element={<AutoMergePanel />} />
              <Route path="cost" element={<CostPanel />} />
              <Route path="audit" element={<AuditPanel />} />
              <Route path="health" element={<HealthPanel />} />
              <Route path="github/callback" element={<GithubCallback />} />
              <Route index element={<CleanupPanel />} /> {/* Default to cleanup */}
            </Route>

            {/* Production Errors - all authenticated users */}
            <Route
              path="/production-errors"
              element={
                <ProtectedRoute>
                  <ProductionErrorDashboard />
                </ProtectedRoute>
              }
            />

            {/* PM Approval Queue - PM, TL, Manager, Admin */}
            <Route
              path="/approvals"
              element={
                <ProtectedRoute requiredRoles={['PM', 'TL', 'MANAGER', 'ADMIN']}>
                  <PmApprovalDashboardPage />
                </ProtectedRoute>
              }
            />

            {/* Execution Monitoring - PM, TL, Manager, Admin */}
            <Route
              path="/executions"
              element={
                <ProtectedRoute requiredRoles={['PM', 'TL', 'MANAGER', 'ADMIN']}>
                  <ExecutionMonitoringDashboard />
                </ProtectedRoute>
              }
            />

            {/* Observability Control Panel - PM, TL, QA, Manager, Admin, Operator */}
            <Route
              path="/observability"
              element={
                <ProtectedRoute requiredRoles={['PM', 'TL', 'QA', 'MANAGER', 'ADMIN', 'OPERATOR']}>
                  <ObservabilityPage />
                </ProtectedRoute>
              }
            />

            {/* Notification Preferences - all authenticated users */}
            <Route
              path="/notifications/preferences"
              element={
                <ProtectedRoute>
                  <NotificationPreferences />
                </ProtectedRoute>
              }
            />

            {/* Catch-all redirect to dashboard (protected) */}
            <Route path="*" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
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

