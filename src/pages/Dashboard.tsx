import { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Filter, Grid, List, SortAsc, Plus, RefreshCw, XCircle, ChevronDown, Check, Zap, LayoutDashboard } from 'lucide-react';
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
import { motion } from 'framer-motion';
import { DashboardSection } from '../components/dashboard/layout';
import { EmptyState, ErrorState, KpiSkeleton, ChartSkeleton } from '../components/dashboard/feedback';

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
  const { socket, connected, isConnecting } = useSocket();
  useProjectUpdates(socket, setProjects);

  // CS3-4: Toast alert when PM tool sync fails (best-effort, separate from state update in useProjectUpdates)
  useEffect(() => {
    if (!socket) return;
    socket.on('pm-sync-failed', (data: { provider: string }) => {
      toast(`PM tool update needed — ${data.provider} sync failed`, {
        icon: '⚠️',
        style: { background: '#92400e', color: '#fef3c7' },
      });
    });
    return () => {
      socket.off('pm-sync-failed');
    };
  }, [socket]);

  // M3: React Query with staleTime: 60s per Technical Guardrails
  const { data: summaryData, refetch: refetchSummary, isLoading: summaryLoading } = useQuery<DashboardSummary>({
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

  useHotkeys('mod+k, /', (e) => {
    e.preventDefault();
    setIsPaletteOpen((prev) => !prev);
  }, { enableOnFormTags: true });

  useHotkeys('shift+?', (e) => {
    e.preventDefault();
    setIsHelpOpen(true);
  });

  useHotkeys('n', (e) => {
    e.preventDefault();
    if (isPaletteOpen || isHelpOpen || reviewState.isOpen) return;
    setIsNewProjectOpen(true);
  });

  useHotkeys('esc', (e) => {
    e.preventDefault();
    if (isPaletteOpen) setIsPaletteOpen(false);
    if (isHelpOpen) setIsHelpOpen(false);
    if (reviewState.isOpen) setReviewState((prev) => ({ ...prev, isOpen: false }));
  });

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
      ticketRequirements: '1. Update the layout to use a darker theme.\n2. Ensure responsiveness for mobile devices.',
      confidenceScore: 0.89,
      qaSummary: {
        linting_passed: true,
        tests_passed: true,
        test_coverage: 85,
        quality_score: 92,
      },
      diffs: [{
        fileName: 'src/components/Dashboard.tsx',
        oldCode: 'const Dashboard = () => { return <div>Old Dashboard</div> }',
        newCode: 'const Dashboard = () => { return <div className="bg-card">New Premium Dashboard</div> }',
      }],
    });
  };

  useEffect(() => {
    fetchData();
  }, [fetchData, user?.id]);

  return (
    <>
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
      >
        <div>
          <div className="flex items-center gap-4 mb-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground tracking-tight">PM Dashboard</h1>
                <p className="text-sm text-muted-foreground">Monitor your project portfolio and AI metrics</p>
              </div>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-sm ${
              connected
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : isConnecting
                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  : 'bg-destructive/10 text-destructive border-destructive/20'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : isConnecting ? 'bg-amber-400 animate-pulse' : 'bg-destructive'}`} />
              {connected ? 'Live' : isConnecting ? 'Connecting...' : 'Offline'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={fetchData}
            className="p-3 rounded-xl bg-[var(--surface-2)] border border-[var(--card-border)] text-muted-foreground hover:text-foreground transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setIsNewProjectOpen(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-semibold py-3 px-5 rounded-xl transition-all"
          >
            <Plus className="w-5 h-5" />
            New Project
          </motion.button>
        </div>
      </motion.div>

      {/* Error State */}
      {error && (
        <ErrorState
          title="Failed to load dashboard"
          description={error}
          onRetry={fetchData}
          size="md"
          className="mb-6"
        />
      )}

      {/* KPI Sections */}
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : summary ? (
        <ExecutionKPISection summary={summary} />
      ) : null}
      
      <FinancialKPISection />
      
      {summaryLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
          <KpiSkeleton />
        </div>
      ) : summary ? (
        <StatsGrid summary={summary} />
      ) : null}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {summaryLoading ? (
          <div className="lg:col-span-2">
            <ChartSkeleton />
          </div>
        ) : summary ? (
          <motion.div className="lg:col-span-2" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
            <ProviderDistributionChart summary={summary} />
          </motion.div>
        ) : (
          <div className="lg:col-span-2">
            <EmptyState
              icon={Zap}
              title="No provider data"
              description="Run your first AI execution to see provider distribution"
              variant="minimal"
              size="md"
            />
          </div>
        )}
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <ConversationListWidget
            onConversationClick={(id) => navigate(`/conversations/${id}`)}
            onViewAll={() => navigate('/conversations')}
          />
        </motion.div>
      </div>

      {/* Financial Metrics Section */}
      {canAccess(user?.role || 'VIEWER', 'MANAGER') && (
        <DashboardSection
          title="Financial Metrics"
          icon={Zap}
          iconGradient="emerald"
          badge={{ text: 'MANAGER/ADMIN', variant: 'success' }}
          delay={0.35}
        >
          <FinancialMetricsSection projectId={projects[0]?.id} />
        </DashboardSection>
      )}

      {/* Projects Section */}
      <DashboardSection
        title="Projects"
        delay={0.4}
        headerAction={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg border transition-all ${
                activeFilterCount > 0
                  ? 'bg-primary/10 text-primary border-primary/30'
                  : 'bg-[var(--surface-2)] text-foreground border-[var(--card-border)] hover:border-[var(--border-hover)]'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter
              {activeFilterCount > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-primary text-primary-foreground rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-2)] text-foreground text-sm font-medium rounded-lg border border-[var(--card-border)] hover:border-[var(--border-hover)] transition-all">
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
        }
      >
        {/* View Mode Toggle */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center bg-[var(--surface-2)] rounded-lg p-1 border border-[var(--card-border)]">
            <button
              onClick={() => setViewMode('grid')}
              aria-pressed={viewMode === 'grid'}
              className={`p-2 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-[var(--background)] text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              disabled={isMobile}
              className={`p-2 rounded-md transition-all ${
                isMobile ? 'opacity-50 cursor-not-allowed' : ''
              } ${
                viewMode === 'list' && !isMobile
                  ? 'bg-[var(--background)] text-primary shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <div className="h-6 w-px bg-[var(--border)]" />
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">Sorted by</span>
            <span className="font-semibold text-foreground">
              {sortPreference === 'activity-desc' && 'Last Activity'}
              {sortPreference === 'name-asc' && 'Name A-Z'}
              {sortPreference === 'tickets-desc' && 'Ticket Count'}
              {sortPreference === 'blocked-desc' && 'Blocked Count'}
            </span>
          </div>
        </div>

        {/* Projects Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-lg border border-[var(--card-border)] bg-[var(--surface-1)] animate-pulse" />
            ))}
          </div>
        ) : sortedProjects.length > 0 ? (
          <div className="pb-4">
            {viewMode === 'list' && !isMobile ? (
              <ProjectCardListView projects={sortedProjects} onReview={handleReview} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedProjects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <ProjectCard project={project} onReview={handleReview} />
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        ) : !error ? (
          projects.length === 0 ? (
            <EmptyState
              icon={Zap}
              title="No projects found"
              description="Create your first project to get started"
              action={{
                label: 'New Project',
                onClick: () => setIsNewProjectOpen(true),
                icon: Plus,
              }}
              size="lg"
            />
          ) : (
            <EmptyState
              icon={XCircle}
              title="No projects match your filters"
              description="Try adjusting your filter criteria"
              action={{
                label: 'Clear Filters',
                onClick: handleClearFilters,
              }}
              size="md"
            />
          )
        ) : null}
      </DashboardSection>

      <ReviewModal
        isOpen={reviewState.isOpen}
        onClose={() => setReviewState((prev) => ({ ...prev, isOpen: false }))}
        executionId={reviewState.executionId}
        projectName={reviewState.projectName}
        ticketTitle={reviewState.ticketTitle}
        ticketRequirements={reviewState.ticketRequirements}
        confidenceScore={reviewState.confidenceScore}
        // qaSummary is null only while the modal is closed (it is populated when a
        // review is opened); fall back to an empty summary to satisfy the required prop.
        qaSummary={
          reviewState.qaSummary ?? {
            linting_passed: false,
            tests_passed: false,
            test_coverage: 0,
            quality_score: 0,
          }
        }
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
