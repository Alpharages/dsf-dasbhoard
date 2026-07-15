/**
 * PM Approval Dashboard Page
 * Lists all executions awaiting PM approval and allows review, approve, reject, rework
 */

import React, { useState } from 'react';
import { useApprovals } from '../hooks/useApprovals';
import { ApprovalQueueTable } from '../components/approval/ApprovalQueueTable';
import { ApprovalDecisionPanel } from '../components/approval/ApprovalDecisionPanel';
import type { ApprovalExecution, ApprovalDecision } from '../types/approval';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import {
  ShieldCheck,
  Clock,
  CheckCircle,
  ArrowLeft,
  ChevronRight,
  Search,
  RefreshCw,
  FileCode,
  Cpu,
  AlertCircle,
  Inbox,
} from 'lucide-react';

export const PmApprovalDashboardPage: React.FC = () => {
  const {
    useApprovalQueue,
    useApprovalSummary,
    useSubmitDecision,
  } = useApprovals();

  const { data: queue = [], isLoading: isQueueLoading, refetch } = useApprovalQueue();
  const { data: summary } = useApprovalSummary();
  const submitDecision = useSubmitDecision();

  const [selectedExecution, setSelectedExecution] =
    useState<ApprovalExecution | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleReview = (execution: ApprovalExecution) => {
    setSelectedExecution(execution);
  };

  const handleBack = () => {
    setSelectedExecution(null);
  };

  const handleDecision = async (
    decision: ApprovalDecision,
    reasoning: string,
  ) => {
    if (!selectedExecution) return;
    await submitDecision.mutateAsync({
      executionId: selectedExecution.id,
      payload: { decision, reasoning: reasoning || undefined },
    });
    setSelectedExecution(null);
  };

  // Filter queue
  const filteredQueue = queue.filter(
    (item) =>
      item.ticketId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ticketTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.projectName?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ─── Detail View ───────────────────────────────────────────────
  if (selectedExecution) {
    const exec = selectedExecution;
    const qaResult = exec.qaResult;

    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        {/* Detail Header */}
        <div className="flex items-center justify-between border-b border-border/50 pb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={handleBack}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                  {exec.projectName || 'Unknown Project'}
                </span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-primary">
                  {exec.ticketId}
                </span>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                {exec.ticketTitle || 'Untitled Ticket'}
              </h1>
            </div>
          </div>

          {/* Confidence badge */}
          <div className="flex gap-3">
            {exec.confidenceScore !== null && exec.confidenceScore !== undefined && (
              <div className="px-4 py-2 bg-card border border-border rounded-xl flex items-center gap-3">
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  AI Confidence
                </span>
                <span
                  className={`text-xl font-mono font-semibold ${
                    (exec.confidenceScore ?? 0) >= 0.85
                      ? 'text-emerald-500'
                      : (exec.confidenceScore ?? 0) >= 0.7
                        ? 'text-amber-500'
                        : 'text-rose-500'
                  }`}
                >
                  {Math.round((exec.confidenceScore ?? 0) * 100)}%
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          {/* Left Column: Info */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            {/* Ticket Description */}
            {exec.ticketDescription && (
              <Card className="bg-card/50 border-border rounded-lg overflow-hidden">
                <CardHeader className="border-b border-border/50 py-4 px-6">
                  <CardTitle className="text-sm font-bold text-card-foreground">
                    Ticket Requirements
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {exec.ticketDescription}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Execution Info */}
            <Card className="bg-card/50 border-border rounded-lg overflow-hidden">
              <CardHeader className="border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />
                  Execution Details
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    AI Provider
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {exec.aiProvider?.replace('_', ' ') || '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Complexity
                  </span>
                  <span className="text-sm font-mono font-bold text-foreground">
                    {exec.complexityScore ?? '—'}/100
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Files Changed
                  </span>
                  <span className="text-sm font-mono font-bold text-foreground flex items-center gap-1">
                    <FileCode className="w-3.5 h-3.5 text-muted-foreground" />
                    {Array.isArray(exec.filesChanged)
                      ? exec.filesChanged.length
                      : 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Retries
                  </span>
                  <span className="text-sm font-mono font-bold text-foreground">
                    {exec.retryCount ?? 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Execution ID
                  </span>
                  <span className="text-[11px] font-mono text-muted-foreground">
                    {exec.id?.substring(0, 12)}...
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* QA Results */}
            <Card className="bg-card/50 border-border rounded-lg overflow-hidden">
              <CardHeader className="border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Automated QA Results
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Linting
                  </span>
                  <QaStatusBadge passed={qaResult?.linting_passed} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Unit Tests
                  </span>
                  <QaStatusBadge passed={qaResult?.tests_passed} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Coverage
                  </span>
                  <span className="text-sm font-mono font-bold text-foreground">
                    {qaResult?.test_coverage != null
                      ? `${qaResult.test_coverage}%`
                      : '—'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Security
                  </span>
                  <span className="text-sm font-mono font-bold text-foreground">
                    {qaResult?.security_score != null
                      ? `${qaResult.security_score}/100`
                      : '—'}
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            {Array.isArray(exec.filesChanged) &&
              exec.filesChanged.length > 0 && (
                <Card className="bg-card/50 border-border rounded-lg overflow-hidden">
                  <CardHeader className="border-b border-border/50 py-4 px-6">
                    <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                      <FileCode className="w-4 h-4 text-blue-400" />
                      Changed Files ({exec.filesChanged.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="space-y-1 max-h-[300px] overflow-y-auto">
                      {exec.filesChanged.map((file, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-2 text-xs font-mono text-muted-foreground bg-background/50 rounded-lg hover:bg-accent/30 transition-colors truncate"
                          title={file}
                        >
                          {file}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
          </div>

          {/* Right Column: Review evidence + decision */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <Card className="bg-card/50 border-border rounded-lg">
              <CardHeader className="border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm font-bold text-card-foreground">
                  Persisted Review Evidence
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-3 text-sm">
                <div><span className="text-muted-foreground">Branch: </span>{exec.branchName || '—'}</div>
                <div><span className="text-muted-foreground">Commit: </span><span className="font-mono">{exec.commitSha || '—'}</span></div>
                {exec.reviewUrl && (
                  <a href={exec.reviewUrl} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                    Open code diff on GitHub
                  </a>
                )}
                {!exec.reviewEvidenceAvailable && (
                  <p role="alert" className="text-amber-500">
                    Approval is blocked until DSF persists changed files and a pushed commit.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Decision Form */}
            <div className="pt-6 border-t border-border/50">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                PM Approval Decision
              </h3>
              <ApprovalDecisionPanel
                onSubmit={handleDecision}
                isSubmitting={submitDecision.isPending}
                canApprove={exec.reviewEvidenceAvailable}
                approvalBlockedReason="Approve is unavailable because persisted changed-file and pushed-commit evidence is missing."
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Queue View ────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2 flex items-center gap-3">
            <Inbox className="w-10 h-10 text-primary" />
            PM Approval Queue
          </h1>
          <p className="text-muted-foreground font-medium">
            Review AI-generated code and approve for GitHub push.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
            title="Refresh Queue"
          >
            <RefreshCw
              className={`w-5 h-5 ${isQueueLoading ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-card/40 border-border rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Inbox className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Pending
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {filteredQueue.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting your review
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Oldest
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {summary?.oldestPendingHours || 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              Longest wait time
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Approved
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {summary?.approvedToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Approved today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border rounded-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-rose-500/10 rounded-xl">
                <AlertCircle className="w-5 h-5 text-rose-500" />
              </div>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Rejected
              </span>
            </div>
            <div className="text-3xl font-semibold text-foreground mb-1">
              {summary?.rejectedToday || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Rejected / Reworked today
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search + Table */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-2xl font-extrabold text-foreground">
            Review Queue
          </h2>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search tickets, projects..."
              className="w-full bg-card border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ApprovalQueueTable
          data={filteredQueue}
          onReview={handleReview}
          isLoading={isQueueLoading}
        />
      </div>
    </div>
  );
};

/**
 * Small helper component for QA status badges
 */
const QaStatusBadge: React.FC<{ passed?: boolean | null }> = ({ passed }) => {
  if (passed === null || passed === undefined) {
    return (
      <span className="text-xs font-bold px-2 py-1 rounded-lg bg-muted text-muted-foreground">
        N/A
      </span>
    );
  }
  return (
    <span
      className={`text-xs font-bold px-2 py-1 rounded-lg ${
        passed
          ? 'bg-emerald-500/10 text-emerald-500'
          : 'bg-rose-500/10 text-rose-500'
      }`}
    >
      {passed ? 'PASSED' : 'FAILED'}
    </span>
  );
};
