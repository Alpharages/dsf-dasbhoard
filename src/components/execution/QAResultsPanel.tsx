import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronRight,
  Clock,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { QAAttempt } from '@/types/execution';

interface QAResultsPanelProps {
  /** QA attempts data from execution detail API. Null/undefined = no data available. */
  qaAttempts: QAAttempt[] | null | undefined;
  /** When true, adds aria-live="polite" for screen reader announcement of live updates */
  isLive?: boolean;
}

function getAttemptBadge(
  attempt: QAAttempt,
  isLastAttempt: boolean,
  hasPriorFailures: boolean,
): { label: string; className: string } {
  // P9: all-skipped gets a neutral badge, not green "Passed"
  if (attempt.lintStatus === 'skipped' && attempt.testStatus === 'skipped') {
    return {
      label: 'Skipped',
      className: 'border-slate-500/30 text-slate-400 bg-slate-500/10',
    };
  }

  const passed = attempt.lintStatus !== 'failed' && attempt.testStatus !== 'failed';

  if (passed) {
    // Last attempt passed and there were prior failures → self-healed
    if (isLastAttempt && hasPriorFailures) {
      return {
        label: 'Self-healed',
        className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
      };
    }
    return {
      label: 'Passed',
      className: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10',
    };
  }

  return {
    label: 'Failed',
    className: 'border-rose-500/30 text-rose-400 bg-rose-500/10',
  };
}

// P3: safe serializer for unknown detail values
function safeStringify(value: unknown): string {
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return '[unserializable]';
  }
}

function formatDuration(ms: number): string {
  if (ms <= 0) return '—'; // P5: guard corrupt/missing timestamps
  if (ms < 1000) return `${Math.round(ms)}ms`; // P8: round sub-second values
  return `${(ms / 1000).toFixed(1)}s`;
}

export function QAResultsPanel({ qaAttempts }: QAResultsPanelProps) {
  const [expandedAttempts, setExpandedAttempts] = useState<Set<number>>(new Set());

  const toggleExpand = (attemptNumber: number) => {
    setExpandedAttempts((prev) => {
      const next = new Set(prev);
      if (next.has(attemptNumber)) next.delete(attemptNumber);
      else next.add(attemptNumber);
      return next;
    });
  };

  if (!qaAttempts || qaAttempts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-slate-500 gap-3">
        <ShieldCheck className="w-8 h-8 opacity-40" />
        <p className="text-sm">No QA attempt data available for this execution.</p>
      </div>
    );
  }

  // P1: sort by attemptNumber so isLast and hasPriorFailures are correct regardless of server order
  const sorted = [...qaAttempts].sort((a, b) => a.attemptNumber - b.attemptNumber);

  // Determine whether any attempt failed — used for "Self-healed" badge logic
  const failedAttemptNumbers = new Set(
    sorted
      .filter((a) => a.lintStatus === 'failed' || a.testStatus === 'failed')
      .map((a) => a.attemptNumber),
  );

  return (
    <div
      className="space-y-3"
      aria-live="polite"
      aria-label="QA attempt results"
    >
      {sorted.map((attempt, index) => {
        const isLast = index === sorted.length - 1;
        const hasPriorFailures =
          failedAttemptNumbers.size > 0 &&
          Array.from(failedAttemptNumbers).some((n) => n < attempt.attemptNumber);
        const badge = getAttemptBadge(attempt, isLast, hasPriorFailures);
        const isExpanded = expandedAttempts.has(attempt.attemptNumber);
        const hasDetails =
          (attempt.lintErrors?.details?.length ?? 0) > 0 ||
          (attempt.testResults?.details?.length ?? 0) > 0;

        return (
          <div
            key={index} // P6: use index to avoid React key collision on duplicate attemptNumbers
            className="rounded-lg border border-slate-700/50 bg-slate-800/40 overflow-hidden"
          >
            {/* Attempt header row */}
            <div className="flex items-center gap-3 px-4 py-3">
              <span className="text-xs font-semibold text-slate-400 min-w-[70px]">
                Attempt {attempt.attemptNumber}
              </span>

              {/* Lint status */}
              <div className="flex items-center gap-1.5 min-w-[110px]">
                {attempt.lintStatus === 'passed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : attempt.lintStatus === 'skipped' ? (
                  <span className="w-3.5 h-3.5 text-slate-500 text-[10px] font-bold">—</span>
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="text-xs text-slate-300">Lint</span>
                {attempt.lintStatus === 'failed' && attempt.lintErrors && (
                  <Badge
                    variant="outline"
                    className="text-[10px] px-1.5 py-0 border-rose-500/30 text-rose-400 bg-rose-500/10"
                  >
                    {attempt.lintErrors.count} err
                  </Badge>
                )}
              </div>

              {/* Test status */}
              <div className="flex items-center gap-1.5 flex-1">
                {attempt.testStatus === 'passed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : attempt.testStatus === 'skipped' ? (
                  <span className="w-3.5 h-3.5 text-slate-500 text-[10px] font-bold">—</span>
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                )}
                <span className="text-xs text-slate-300">Tests</span>
                {attempt.testResults && attempt.testStatus !== 'skipped' && (
                  <span className="text-xs text-slate-500">
                    {attempt.testResults.passed} passed / {attempt.testResults.failed} failed
                  </span>
                )}
              </div>

              {/* Duration */}
              <div className="flex items-center gap-1 text-slate-500 min-w-[50px]">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{formatDuration(attempt.durationMs)}</span>
              </div>

              {/* Outcome badge */}
              <Badge variant="outline" className={`text-xs ${badge.className}`}>
                {badge.label}
              </Badge>

              {/* Expand toggle — only when there are details to show */}
              {hasDetails && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 text-slate-400 hover:text-slate-200"
                  onClick={() => toggleExpand(attempt.attemptNumber)}
                  aria-label={`${isExpanded ? 'Collapse' : 'Expand'} details for attempt ${attempt.attemptNumber}`}
                  aria-expanded={isExpanded}
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </Button>
              )}
            </div>

            {/* Collapsible detail section */}
            {hasDetails && isExpanded && (
              <div className="border-t border-slate-700/50 px-4 py-3 space-y-3 bg-slate-900/30">
                {attempt.lintErrors?.details && attempt.lintErrors.details.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      Lint errors
                    </p>
                    <div className="space-y-1">
                      {attempt.lintErrors.details.map((detail, i) => (
                        <pre
                          key={i}
                          className="text-[11px] text-rose-300 font-mono bg-rose-500/5 rounded px-2 py-1 overflow-x-auto"
                        >
                          {typeof detail === 'string' ? detail : safeStringify(detail)}
                        </pre>
                      ))}
                    </div>
                  </div>
                )}
                {attempt.testResults?.details && attempt.testResults.details.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3 text-rose-400" />
                      Test failures
                    </p>
                    <div className="space-y-1">
                      {attempt.testResults.details.map((detail, i) => (
                        <pre
                          key={i}
                          className="text-[11px] text-rose-300 font-mono bg-rose-500/5 rounded px-2 py-1 overflow-x-auto"
                        >
                          {typeof detail === 'string' ? detail : safeStringify(detail)}
                        </pre>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
