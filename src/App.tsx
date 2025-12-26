import { Routes, Route, useNavigate, useParams, Outlet } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { StatsGrid } from './components/dashboard/StatsGrid';
import { ProjectCard } from './components/dashboard/ProjectCard';
import { Filter, Grid, List, SortAsc, Plus, RefreshCw } from 'lucide-react';
import type { Project, DashboardSummary } from './types';
import axios from 'axios';
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
import { Toaster, toast } from 'react-hot-toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Shared Layout component
function DashboardLayout() {
  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-200">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 relative">
        <Header />
        <div className="max-w-7xl mx-auto pt-8">
          <Outlet />
        </div>
      </main>
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
  const token = localStorage.getItem('token') || 'dummy-token';

  const { socket, connected } = useSocket(token);
  useProjectUpdates(socket, setProjects);

  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const handleShortcutAction = async (decision: 'APPROVE' | 'REJECT' | 'REWORK', label: string) => {
    if (!reviewState.isOpen) return;

    try {
      const authHeader = { Authorization: `Bearer ${token}` };
      await axios.post(`${API_BASE_URL}/executions/${reviewState.executionId}/approve`, {
        decision,
        reasoning: `Action triggered via keyboard shortcut (${label})`
      }, { headers: authHeader });

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
      await axios.post(`${API_BASE_URL}/telemetry/shortcut`, { shortcut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (err) {
      console.error('Failed to log shortcut usage:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const authHeader = { Authorization: `Bearer ${token}` };
      const [projectsRes, summaryRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/pm-dashboard/projects`, { headers: authHeader }),
        axios.get(`${API_BASE_URL}/pm-dashboard/summary`, { headers: authHeader })
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none">
              PM Dashboard
            </h1>
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${connected ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
              }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`}></div>
              {connected ? 'Real-time Live' : 'Offline'}
            </div>
          </div>
          <p className="text-slate-500 font-medium">
            Monitor your project portfolio and AI metrics in real-time.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={fetchData}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all"
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
        <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6 mb-8 text-rose-500 flex items-center justify-between">
          <p className="font-semibold">{error}</p>
          <button onClick={fetchData} className="px-4 py-2 bg-rose-500 text-white rounded-xl text-sm font-bold">Retry</button>
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

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <button className="p-2 bg-slate-800 text-blue-400 rounded-lg shadow-inner ring-1 ring-white/5">
            <Grid className="w-5 h-5" />
          </button>
          <button className="p-2 text-slate-500 hover:text-slate-300 transition-colors">
            <List className="w-5 h-5" />
          </button>
          <div className="h-6 w-px bg-slate-800 mx-2"></div>
          <div className="text-sm font-bold text-slate-400">
            Sorted by <span className="text-slate-200">Last Activity</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700/50 transition-all">
            <Filter className="w-4 h-4" />
            Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-semibold rounded-xl border border-slate-700/50 transition-all">
            <SortAsc className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 bg-slate-900/50 border border-slate-800 animate-pulse rounded-2xl"></div>
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
        <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl">
          <p className="text-slate-500 text-xl font-medium">No projects found. Create your first one!</p>
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
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#0f172a',
            color: '#cbd5e1',
            border: '1px solid #1e293b',
            borderRadius: '12px',
          }
        }}
      />
    </>
  );
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/conversations" element={
            <ConversationSearchInterface onConversationClick={(id) => navigate(`/conversations/${id}`)} />
          } />
          <Route path="/conversations/upload" element={
            <ConversationUploadForm onSuccess={(id) => navigate(`/conversations/${id}`)} />
          } />
          <Route path="/conversations/:id" element={<ConversationDetailViewWrapper />} />

          <Route path="/settings" element={<SettingsLayout />}>
            <Route path="cleanup" element={<CleanupPanel />} />
            <Route path="self-healing" element={<SelfHealingPanel />} />
            <Route path="dependency" element={<DependencyPanel />} />
            <Route path="auto-merge" element={<AutoMergePanel />} />
            <Route path="cost" element={<CostPanel />} />
            <Route path="audit" element={<AuditPanel />} />
            <Route path="health" element={<HealthPanel />} />
            <Route index element={<CleanupPanel />} /> {/* Default to cleanup */}
          </Route>

          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </QueryClientProvider>
  );
}

// Wrapper to extract :id param using useParams hook
function ConversationDetailViewWrapper() {
  const { id } = useParams<{ id: string }>();
  return <ConversationDetailView conversationId={id || ''} />;
}

export default App;

