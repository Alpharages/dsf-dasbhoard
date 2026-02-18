/**
 * Container Activity Timeline
 *
 * A PM-friendly, live timeline showing what's happening inside the
 * execution container. Translates raw container output into clear,
 * icon-tagged, color-coded activity updates — no Docker or terminal
 * knowledge required.
 *
 * Features:
 * - Real-time activity feed via WebSocket
 * - Category-based color coding (AI, Build, Test, Git, etc.)
 * - Animated "currently happening" indicator
 * - Relative timestamps ("12s ago", "just now")
 * - Collapsible detail text
 * - Auto-scroll with manual override
 */

import { useState, useEffect, useRef, useCallback, useMemo, memo } from 'react';
import {
  Package,
  GitBranch,
  GitCommitHorizontal,
  Upload,
  Download,
  Brain,
  Code,
  Hammer,
  TestTube2,
  CheckCircle,
  FileEdit,
  Rocket,
  Settings,
  AlertTriangle,
  Shield,
  ShieldCheck,
  PackageSearch,
  Activity,
  ChevronDown,
  ChevronUp,
  Terminal,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react';
import { useActivityEvents } from '@/lib/socket/useSocketIO';
import { useExecutionActivities } from '@/hooks/queries/useExecutions';
import type { ContainerActivityPayload, ActivityCategory } from '@/lib/socket/socketEvents';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

// ─────────────────────────────────────────────────────────────────
// Category Configuration
// ─────────────────────────────────────────────────────────────────

interface CategoryConfig {
  label: string;
  color: string;       // Text color class
  bgColor: string;     // Background color class
  borderColor: string; // Border color class
  dotColor: string;    // Timeline dot color
}

const CATEGORY_CONFIG: Record<ActivityCategory, CategoryConfig> = {
  SETUP: {
    label: 'Setup',
    color: 'text-slate-400',
    bgColor: 'bg-slate-500/10',
    borderColor: 'border-slate-500/20',
    dotColor: 'bg-slate-400',
  },
  DEPENDENCY: {
    label: 'Dependencies',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
    dotColor: 'bg-amber-400',
  },
  GIT: {
    label: 'Git',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/20',
    dotColor: 'bg-orange-400',
  },
  AI_THINKING: {
    label: 'AI Thinking',
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/10',
    borderColor: 'border-purple-500/20',
    dotColor: 'bg-purple-400',
  },
  AI_CODING: {
    label: 'AI Coding',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    dotColor: 'bg-blue-400',
  },
  BUILD: {
    label: 'Build',
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/20',
    dotColor: 'bg-cyan-400',
  },
  TEST: {
    label: 'Testing',
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
    dotColor: 'bg-emerald-400',
  },
  LINT: {
    label: 'Lint',
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/20',
    dotColor: 'bg-teal-400',
  },
  FILE_OP: {
    label: 'Files',
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
    dotColor: 'bg-indigo-400',
  },
  DEPLOY: {
    label: 'Deploy',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    borderColor: 'border-green-500/20',
    dotColor: 'bg-green-400',
  },
  ERROR: {
    label: 'Error',
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
    dotColor: 'bg-rose-400',
  },
  SYSTEM: {
    label: 'System',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    dotColor: 'bg-gray-400',
  },
};

// ─────────────────────────────────────────────────────────────────
// Icon Mapping
// ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'package': Package,
  'package-search': PackageSearch,
  'shield': Shield,
  'shield-check': ShieldCheck,
  'git-branch': GitBranch,
  'git-commit-horizontal': GitCommitHorizontal,
  'upload': Upload,
  'download': Download,
  'brain': Brain,
  'code': Code,
  'hammer': Hammer,
  'test-tube-2': TestTube2,
  'check-circle': CheckCircle,
  'file-edit': FileEdit,
  'rocket': Rocket,
  'settings': Settings,
  'alert-triangle': AlertTriangle,
  'terminal': Terminal,
};

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatRelativeTime(timestamp: string): string {
  const diff = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

// ─────────────────────────────────────────────────────────────────
// Activity Item
// ─────────────────────────────────────────────────────────────────

interface ActivityItemProps {
  activity: ContainerActivityPayload;
  isLatest: boolean;
}

const ActivityItem = memo(function ActivityItem({ activity, isLatest }: ActivityItemProps) {
  const config = CATEGORY_CONFIG[activity.category] || CATEGORY_CONFIG.SYSTEM;
  const Icon = ICON_MAP[activity.icon] || Activity;
  const [relTime, setRelTime] = useState(formatRelativeTime(activity.timestamp));
  const [showRaw, setShowRaw] = useState(false);

  // Update relative time every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setRelTime(formatRelativeTime(activity.timestamp));
    }, 5000);
    return () => clearInterval(timer);
  }, [activity.timestamp]);

  return (
    <div className={`rounded-lg transition-all duration-300 ${
      isLatest ? `${config.bgColor} border ${config.borderColor}` : 'hover:bg-muted/30'
    }`}>
      <div className="flex gap-3 py-2.5 px-3">
        {/* Timeline dot + line */}
        <div className="flex flex-col items-center pt-0.5">
          <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${config.dotColor} ${
            isLatest ? 'animate-pulse ring-2 ring-offset-1 ring-offset-background' : ''
          }`}
            style={isLatest ? { boxShadow: `0 0 8px ${config.dotColor.replace('bg-', '')}` } : {}}
          />
          <div className="w-px flex-1 bg-border/50 mt-1" />
        </div>

        {/* Icon */}
        <div className={`p-1.5 rounded-md flex-shrink-0 ${config.bgColor}`}>
          <Icon className={`w-3.5 h-3.5 ${config.color}`} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-sm font-semibold ${
              isLatest ? 'text-foreground' : 'text-foreground/80'
            }`}>
              {activity.activity}
            </span>
            <Badge
              variant="outline"
              className={`text-[9px] px-1.5 py-0 h-4 border-transparent ${config.color} ${config.bgColor}`}
            >
              {config.label}
            </Badge>
            {activity.rawContent && (
              <button
                onClick={() => setShowRaw(!showRaw)}
                className="text-muted-foreground hover:text-foreground transition-colors"
                title={showRaw ? 'Hide raw output' : 'Show raw output'}
              >
                {showRaw ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              </button>
            )}
          </div>
          {activity.detail && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate" title={activity.detail}>
              {activity.detail}
            </p>
          )}
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-muted-foreground flex-shrink-0 pt-0.5">
          {relTime}
        </span>
      </div>

      {/* Expandable raw content */}
      {showRaw && activity.rawContent && (
        <div className="mx-3 mb-2 p-2 rounded bg-slate-950/60 border border-border/30">
          <pre className="text-[10px] text-muted-foreground font-mono whitespace-pre-wrap break-all max-h-32 overflow-auto">
            {activity.rawContent}
          </pre>
        </div>
      )}
    </div>
  );
});

// ─────────────────────────────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────────────────────────────

interface ContainerActivityTimelineProps {
  executionId: string;
  socket: ReturnType<typeof import('@/lib/socket/useSocketIO').useSocketIO>['socket'];
  /** Maximum height (CSS value). Default: '320px' */
  maxHeight?: string;
  /** If true, show in collapsed mode (only latest activity) */
  collapsible?: boolean;
  /** Default collapsed state */
  defaultCollapsed?: boolean;
  /** Whether the execution is currently live (enables WebSocket subscription) */
  isLive?: boolean;
}

export default function ContainerActivityTimeline({
  executionId,
  socket,
  maxHeight = '320px',
  collapsible = true,
  defaultCollapsed = true,
  isLive = true,
}: ContainerActivityTimelineProps) {
  const [realtimeActivities, setRealtimeActivities] = useState<ContainerActivityPayload[]>([]);
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  const scrollRef = useRef<HTMLDivElement>(null);
  // Track IDs of persisted activities to deduplicate against WebSocket events
  const persistedTimestampsRef = useRef<Set<string>>(new Set());

  // Fetch persisted activities from database
  const { data: persistedActivities = [], isLoading } = useExecutionActivities(
    executionId,
    { limit: 500 },
    { enabled: !!executionId },
  );

  // Build dedupe set when persisted data loads
  useEffect(() => {
    const set = new Set<string>();
    for (const a of persistedActivities) {
      set.add(a.timestamp);
    }
    persistedTimestampsRef.current = set;
  }, [persistedActivities]);

  // Convert persisted activities to ContainerActivityPayload shape
  const initialActivities: ContainerActivityPayload[] = useMemo(
    () =>
      persistedActivities.map((a) => ({
        executionId: a.executionId,
        ticketId: '',  // ticketId lives on the Execution record, not on activities
        timestamp: a.timestamp,
        activity: a.activity,
        detail: a.detail ?? undefined,
        rawContent: a.rawContent ?? undefined,
        category: a.category as ActivityCategory,
        icon: a.icon,
        suggestedPercent: a.suggestedPercent ?? undefined,
      })),
    [persistedActivities],
  );

  // Handle incoming real-time activity events (only when live)
  useActivityEvents(
    isLive ? socket : null,
    useCallback(
      (payload: ContainerActivityPayload) => {
        if (payload.executionId === executionId) {
          // Deduplicate: skip if this timestamp already exists in persisted data
          if (persistedTimestampsRef.current.has(payload.timestamp)) return;
          setRealtimeActivities((prev) => [...prev, payload]);
        }
      },
      [executionId],
    ),
  );

  // Merge persisted + real-time activities
  const activities = useMemo(
    () => [...initialActivities, ...realtimeActivities],
    [initialActivities, realtimeActivities],
  );

  // Auto-scroll to bottom when new activities arrive
  useEffect(() => {
    if (!collapsed && scrollRef.current) {
      const el = scrollRef.current;
      el.scrollTop = el.scrollHeight;
    }
  }, [activities, collapsed]);

  const latestActivity = activities[activities.length - 1];

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-xs text-muted-foreground">
        <Loader2 className="w-3 h-3 animate-spin" />
        Loading activity timeline...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center gap-2 py-2 px-3 text-xs text-muted-foreground">
        {isLive ? (
          <>
            <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" />
            Waiting for container activity...
          </>
        ) : (
          <>
            <Activity className="w-3 h-3" />
            No activity recorded
          </>
        )}
      </div>
    );
  }

  // ── Collapsed: show just the latest activity ──────────────
  if (collapsible && collapsed) {
    return (
      <div className="space-y-1">
        <ActivityItem activity={latestActivity} isLatest={true} />
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(false)}
        >
          <ChevronDown className="w-3 h-3 mr-1" />
          Show all {activities.length} activities
        </Button>
      </div>
    );
  }

  // ── Expanded: full timeline ───────────────────────────────
  return (
    <div className="space-y-1">
      {collapsible && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full h-6 text-[10px] text-muted-foreground hover:text-foreground"
          onClick={() => setCollapsed(true)}
        >
          <ChevronUp className="w-3 h-3 mr-1" />
          Collapse timeline
        </Button>
      )}
      <ScrollArea style={{ maxHeight }} className="pr-2">
        <div ref={scrollRef} className="space-y-0.5">
          {activities.map((act, idx) => (
            <ActivityItem
              key={`${act.timestamp}-${idx}`}
              activity={act}
              isLatest={idx === activities.length - 1}
            />
          ))}
        </div>
      </ScrollArea>
      <div className="flex items-center justify-between px-3 pt-1 text-[10px] text-muted-foreground border-t border-border/50">
        <span>{activities.length} activities</span>
        <span>
          {!isLive ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
              Historical
            </span>
          ) : latestActivity.category !== 'ERROR' ? (
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          ) : (
            <span className="flex items-center gap-1 text-rose-400">
              <AlertTriangle className="w-3 h-3" />
              Error detected
            </span>
          )}
        </span>
      </div>
    </div>
  );
}
