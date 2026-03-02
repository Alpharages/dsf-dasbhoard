import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SortAsc, Plus, RefreshCw, XCircle, ChevronDown, Check } from 'lucide-react';
import { useHotkeys } from 'react-hotkeys-hook';
import { toast } from 'react-hot-toast';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { ProjectCard } from '../components/dashboard/ProjectCard';
import { NewProjectDialog } from '../components/dashboard/NewProjectDialog';
import { ExecutionKPISection } from '../components/dashboard/ExecutionKPISection';
import { FinancialKPISection } from '../components/dashboard/FinancialKPISection';
import { ProviderDistributionChart } from '../components/dashboard/ProviderDistributionChart';
import type { ProjectFilters } from '../components/dashboard/ProjectFilterSheet';
import { ProjectFilterSheet } from '../components/dashboard/ProjectFilterSheet';
import { ReviewModal } from '../components/quality-gate/ReviewModal';
import { ConversationListWidget } from '../components/conversations/ConversationListWidget';
import { FinancialMetricsSection } from '../components/financial/FinancialMetricsSection';
import { CommandPalette } from '../components/ux/CommandPalette';
import { HelpModal } from '../components/ux/HelpModal';
import { ProjectCardListView } from '../components/dashboard/ProjectCardListView';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '../components/ui/dropdown-menu';
import type { Project, DashboardSummary } from '@/types';
import apiClient from '../api/client';
import { useSocket } from '../hooks/useSocket';
import { useProjectUpdates } from '../hooks/useProjectUpdates';
import { filterProjects } from '../utils/projectFilters';
import { sortProjects } from '../utils/projectSort';
import { useAuth } from '@/contexts';
import { canAccess } from '../utils/roleHelpers';

/** Returns null for invalid or missing date strings, guarding against NaN Date objects. */
function parseDate(param: string | null): Date | null {
  if (!param) return null;
  const d = new Date(param);
  return isNaN(d.getTime()) ? null : d;
}

export type SortOption = 'activity-desc' | 'name-asc' | 'tickets-desc' | 'blocked-desc';
export type ViewMode = 'grid' | 'list';

interface ReviewQaSummary {
  linting_passed: boolean;
  tests_passed: boolean;
  test_coverage: number;
  quality_score: number;
}

interface ReviewDiff {
  fileName: string;
  oldCode: string;
  newCode: string;
}

export function Dashboard() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { socket, connected } = useSocket();
  useProjectUpdates(socket, setProjects);

  // M3: React Query with staleTime: 60s per Technical Guardrails
  const { data: summaryData, refetch: refetchSummary } = useQuery<DashboardSummary>({
    queryKey: ['pm-dashboard-summary', user?.id],
    queryFn: () => apiClient.get('/pm-dashboard/summary').then((r) => r.data as DashboardSummary),
    staleTime: 60_000,
    enabled: !!user?.id,
  });
  const summary = summaryData ?? null;

  const [sortPreference, setSortPreference] = useState<SortOption>(() => {
    return (localStorage.getItem('dsf_project_sort') as SortOption) || 'activity-desc';
  });
  
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('dsf_project_view_mode') as ViewMode) || 'grid';
  });

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    localStorage.setItem('dsf_project_sort', sortPreference);
  }, [sortPreference]);

  useEffect(() => {
    localStorage.setItem('dsf_project_view_mode', viewMode);
  }, [viewMode]);


  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const filters = useMemo<ProjectFilters>(
    () => ({
      statuses: searchParams.getAll('status'),
      clientName: searchParams.get('client') || '',
      dateRange: {
        startDate: parseDate(searchParams.get('start')),
        endDate: parseDate(searchParams.get('end')),
      },
    }),
    [searchParams],
  );

  const activeFilterCount =
    filters.statuses.length +
    (filters.clientName ? 1 : 0) +
    (filters.dateRange.startDate || filters.dateRange.endDate ? 1 : 0);

  // Memoised to stabilise the reference passed to ProjectFilterSheet's debounce useEffect
  const handleFilterChange = useCallback(
    (newFilters: ProjectFilters) => {
      const params = new URLSearchParams();
      newFilters.statuses.forEach((status) => params.append('status', status));
      if (newFilters.clientName) params.set('client', newFilters.clientName);
      if (newFilters.dateRange.startDate)
        params.set('start', newFilters.dateRange.startDate.toISOString());
      if (newFilters.dateRange.endDate)
        params.set('end', newFilters.dateRange.endDate.toISOString());
      setSearchParams(params);
    },
    [setSearchParams],
  );

  const handleClearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const filteredProjects = useMemo(
    () => filterProjects(projects, filters),
    [projects, filters],
  );

  const sortedProjects = useMemo(
    () => sortProjects(filteredProjects, sortPreference),
    [filteredProjects, sortPreference],
  );


  const handleShortcutAction = async (decision: 'APPROVE' | 'REJECT' | 'REWORK', label: string) => {
    if (!reviewState.isOpen) return;

    try {
      await apiClient.post(`/executions/${reviewState.executionId}/approve`, {
        decision,
        reasoning: `Action triggered via keyboard shortcut (${label})`,
      });

      toast.success(`${label} successful!`);
      setReviewState((prev) => ({ ...prev, isOpen: false }));
      fetchData();
    } catch (err: unknown) {
      console.error(`Failed to ${label}:`, err);
      toast.error(`Failed to ${label}`);
    }
  };

  useHotkeys(
    'mod+k, /',
    (e) => {
      e.preventDefault();
      setIsPaletteOpen((prev) => !prev);
      recordShortcutUsage(e.key === '/' ? 'search' : 'cmdk');
    },
    { enableOnFormTags: true },
  );

  useHotkeys('shift+?', (e) => {
    e.preventDefault();
    setIsHelpOpen(true);
    recordShortcutUsage('help');
  });

  useHotkeys('n', (e) => {
    e.preventDefault();
    if (isPaletteOpen || isHelpOpen || reviewState.isOpen) return;
    setIsNewProjectOpen(true);
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
    if (reviewState.isOpen) setReviewState((prev) => ({ ...prev, isOpen: false }));
  });

  const recordShortcutUsage = async (shortcut: string) => {
    try {
      await apiClient.post('/telemetry/shortcut', { shortcut });
    } catch (err) {
      console.error('Failed to log shortcut usage:', err);
    }
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectsRes = await apiClient.get('/pm-dashboard/projects');
      setProjects(projectsRes.data.data);
      void refetchSummary();
    } catch (err: unknown) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, [refetchSummary]);

  const [reviewState, setReviewState] = useState<{
    isOpen: boolean;
    projectName: string;
    ticketTitle: string;
    executionId: string;
    qaSummary: ReviewQaSummary | null;
    diffs: ReviewDiff[];
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
    confidenceScore: 0,
  });

  const handleReview = async (project: Project) => {
    setReviewState({
      isOpen: true,
      projectName: project.name,
      ticketTitle: 'Update Dashboard Components',
      executionId: 'exec-12345',
      ticketRequirements:
        '1. Update the layout to use a darker theme.\n2. Ensure responsiveness for mobile devices.\n3. Add a new ProjectCard component for displaying project details.',
      confidenceScore: 0.89,
      qaSummary: {
        linting_passed: true,
        tests_passed: true,
        test_coverage: 85,
        quality_score: 92,
      },
      diffs: [
        {
          fileName: 'src/components/Dashboard.tsx',
          oldCode: 'const Dashboard = () => { return <div>Old Dashboard</div> }',
          newCode:
            'const Dashboard = () => { return <div className="bg-slate-900">New Premium Dashboard</div> }',
        },
      ],
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData, user?.id]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-foreground tracking-tight">PM Dashboard</h1>
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                connected
                  ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20 '
              }`}
            >
              <div
                className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`}
              ></div>
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
          <button
            onClick={() => setIsNewProjectOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0"
          >
            <Plus className="w-5 h-5" />
            New Project
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-6 mb-8 text-destructive flex items-center justify-between">
          <p className="font-semibold">{error}</p>
          <button
            onClick={fetchData}
            className="px-4 py-2 bg-destructive text-destructive-foreground rounded-xl text-sm font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {summary && <ExecutionKPISection summary={summary} />}
      <FinancialKPISection />
      {summary && <StatsGrid summary={summary} />}
      {summary && <ProviderDistributionChart summary={summary} />}

      {/* Recent Conversations Widget */}
      <div className="mb-8">
        <ConversationListWidget
          onConversationClick={(id) => navigate(`/conversations/${id}`)}
          onViewAll={() => navigate('/conversations')}
        />
      </div>

      {/* Financial Metrics Section (Manager/Admin only) - Story 6-R-3 */}
      {canAccess(user?.role || 'VIEWER', 'MANAGER') && (
        <FinancialMetricsSection projectId={projects[0]?.id} />
      )}

      <div className="bg-card/40 border border-border rounded-2xl p-4 mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div role="group" aria-label="View mode" className="flex items-center bg-secondary/50 rounded-lg p-1 border border-border/50">
            <button
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title="Grid View"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              disabled={isMobile}
              aria-pressed={viewMode === 'list' && !isMobile}
              className={`p-1.5 rounded-md transition-all ${
                isMobile ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                viewMode === 'list' && !isMobile
                  ? 'bg-background text-primary shadow-sm ring-1 ring-border'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
              title={isMobile ? 'List view unavailable on mobile' : 'List View'}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
          <div className="h-6 w-px bg-border mx-2"></div>
          <div className="text-sm font-bold text-muted-foreground">
            Sorted by <span className="text-foreground">
              {sortPreference === 'activity-desc' && 'Last Activity'}
              {sortPreference === 'name-asc' && 'Name A-Z'}
              {sortPreference === 'tickets-desc' && 'Ticket Count'}
              {sortPreference === 'blocked-desc' && 'Blocked Count'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsFilterOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 ${
              activeFilterCount > 0
                ? 'bg-primary/20 hover:bg-primary/30 text-primary border-primary/30'
                : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground border-border/50'
            } text-sm font-semibold rounded-xl border transition-all`}
          >
            <Filter className="w-4 h-4" />
            Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-4 py-2 bg-secondary hover:bg-secondary/80 text-secondary-foreground text-sm font-semibold rounded-xl border border-border/50 transition-all">
                <SortAsc className="w-4 h-4" />
                Sort
                <ChevronDown className="w-3.5 h-3.5 ml-1 opacity-70" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {[
                { value: 'activity-desc', label: 'Last Activity' },
                { value: 'name-asc', label: 'Name A-Z' },
                { value: 'tickets-desc', label: 'Ticket Count' },
                { value: 'blocked-desc', label: 'Blocked Count' },
              ].map(option => (
                <DropdownMenuItem 
                  key={option.value} 
                  onClick={() => setSortPreference(option.value as SortOption)}
                  className="flex items-center justify-between font-medium py-2 cursor-pointer"
                >
                  {option.label}
                  {sortPreference === option.value && <Check className="w-4 h-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-64 bg-card/50 border border-border animate-pulse rounded-2xl"
            ></div>
          ))}
        </div>
      ) : sortedProjects.length > 0 ? (
        <div className="pb-12">
          {viewMode === 'list' && !isMobile ? (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200">
              <ProjectCardListView projects={sortedProjects} onReview={handleReview} />
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-top-1 duration-200 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 pb-12">
              {sortedProjects.map((project) => (
                <ProjectCard key={project.id} project={project} onReview={handleReview} />
              ))}
            </div>
          )}
        </div>
      ) : !error ? (
        projects.length === 0 ? (
          <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-3xl">
            <p className="text-muted-foreground text-xl font-medium">
              No projects found. Create your first one!
            </p>
          </div>
        ) : (
          <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-3xl flex flex-col items-center justify-center">
            <XCircle className="w-12 h-12 text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground text-xl font-medium mb-4">
              No projects match your filters.
            </p>
            <button
              onClick={handleClearFilters}
              className="px-6 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              Clear Filters
            </button>
          </div>
        )
      ) : null}

      <ReviewModal
        isOpen={reviewState.isOpen}
        onClose={() => setReviewState((prev) => ({ ...prev, isOpen: false }))}
        executionId={reviewState.executionId}
        projectName={reviewState.projectName}
        ticketTitle={reviewState.ticketTitle}
        ticketRequirements={reviewState.ticketRequirements}
        confidenceScore={reviewState.confidenceScore}
        qaSummary={reviewState.qaSummary}
        diffs={reviewState.diffs}
        onActionComplete={fetchData}
      />

      <NewProjectDialog
        isOpen={isNewProjectOpen}
        onOpenChange={setIsNewProjectOpen}
        onSuccess={fetchData}
      />

      <ProjectFilterSheet
        isOpen={isFilterOpen}
        onOpenChange={setIsFilterOpen}
        filters={filters}
        onFilterChange={handleFilterChange}
        onClearFilters={handleClearFilters}
      />

      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onOpenHelp={() => setIsHelpOpen(true)}
      />
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </>
  );
}
