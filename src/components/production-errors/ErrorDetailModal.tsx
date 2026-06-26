/**
 * Error Detail Modal
 * Story 9-U-5: Production Error Dashboard - AC#3
 *
 * Detailed error view with stack trace, deployment context, and actions.
 * 
 * Optimizations:
 * - useCallback for event handlers
 * - React.memo to prevent unnecessary re-renders
 */

import { useProductionErrorDetail, useAcknowledgeError } from '@/hooks/useProductionErrors';
import { useTrackErrorView } from '@/hooks/useProductionErrors';
import { useEffect, useCallback, memo } from 'react';
import { format } from 'date-fns';
import { X, ExternalLink, Ticket, CheckCircle, GitCommit, Server, Users } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { ErrorSeverity, ErrorListItem } from '@/api/production-errors';
import { toast } from 'react-hot-toast';

interface ErrorDetailModalProps {
  error: ErrorListItem | null;
  isOpen: boolean;
  onClose: () => void;
  onCreateTicket?: (errorId: string) => void;
  canCreateTicket: boolean;
}

const severityColors: Record<ErrorSeverity, string> = {
  CRITICAL: 'bg-red-500/20 text-red-400 border-red-500/50',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
  MEDIUM: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
  LOW: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
};

function ErrorDetailModalComponent({
  error,
  isOpen,
  onClose,
  onCreateTicket,
  canCreateTicket,
}: ErrorDetailModalProps) {
  const { data: detail, isLoading } = useProductionErrorDetail(error?.id || null);
  const { mutate: acknowledge } = useAcknowledgeError();
  const { mutate: trackView } = useTrackErrorView();

  // Track view when modal opens
  useEffect(() => {
    if (isOpen && error?.id) {
      trackView(error.id);
    }
  }, [isOpen, error?.id, trackView]);

  // useCallback for stable function references
  const handleAcknowledge = useCallback(() => {
    if (!error) return;
    acknowledge(
      { errorId: error.id },
      {
        onSuccess: () => {
          toast.success('Error acknowledged');
        },
        onError: () => {
          toast.error('Failed to acknowledge error');
        },
      }
    );
  }, [acknowledge, error]);

  const handleCreateTicket = useCallback(() => {
    if (!error || !onCreateTicket) return;
    onCreateTicket(error.id);
  }, [error, onCreateTicket]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-card border-border text-foreground">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl font-bold text-foreground">
                Error Details
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{error?.application}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {isLoading || !error ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Error Info Header */}
            <div className="flex items-start justify-between p-4 bg-muted rounded-lg">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={`${severityColors[error.severity]} font-semibold`}
                  >
                    {error.severity}
                  </Badge>
                  <span className="text-muted-foreground">{error.error_type}</span>
                </div>
                <p className="text-foreground font-medium">{error.error_message}</p>
                <p className="text-sm text-muted-foreground">
                  Occurred: {format(new Date(error.occurred_at), 'PPpp')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Affected Users</p>
                <p className="text-2xl font-semibold text-foreground data-figure tabular-nums">{error.affected_users}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {canCreateTicket && !error.fix_ticket_id && (
                <Button onClick={handleCreateTicket} className="gap-2">
                  <Ticket className="w-4 h-4" />
                  Create Fix Ticket
                </Button>
              )}
              {error.fix_ticket_url && (
                <Button variant="outline" asChild className="gap-2">
                  <a href={error.fix_ticket_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                    View Ticket
                  </a>
                </Button>
              )}
              {!error.acknowledged_at && (
                <Button variant="outline" onClick={handleAcknowledge} className="gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Acknowledge
                </Button>
              )}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="stacktrace">
              <TabsList className="bg-muted">
                <TabsTrigger value="stacktrace">Stack Trace</TabsTrigger>
                <TabsTrigger value="deployment">Deployment</TabsTrigger>
                <TabsTrigger value="commits">Related Commits</TabsTrigger>
                <TabsTrigger value="users">User Context</TabsTrigger>
              </TabsList>

              {/* Stack Trace Tab */}
              <TabsContent value="stacktrace" className="mt-4">
                {detail?.stack_trace ? (
                  <pre className="p-4 bg-background rounded-lg overflow-x-auto text-sm text-foreground font-mono whitespace-pre-wrap">
                    {detail.stack_trace}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No stack trace available</p>
                )}
              </TabsContent>

              {/* Deployment Tab */}
              <TabsContent value="deployment" className="mt-4">
                {detail?.deployment_context ? (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Server className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">Deployment Info</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Deployment ID:</span>
                        <p className="text-foreground font-mono">{detail.deployment_context.deployment_id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Commit SHA:</span>
                        <p className="text-foreground font-mono">{detail.deployment_context.commit_sha}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Branch:</span>
                        <p className="text-foreground">{detail.deployment_context.branch}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Deployed At:</span>
                        <p className="text-foreground">
                          {format(new Date(detail.deployment_context.deployed_at), 'PPpp')}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No deployment context available</p>
                )}
              </TabsContent>

              {/* Commits Tab */}
              <TabsContent value="commits" className="mt-4">
                {detail?.related_commits && detail.related_commits.length > 0 ? (
                  <div className="space-y-3">
                    {detail.related_commits.map((commit) => (
                      <div
                        key={commit.sha}
                        className="p-3 bg-muted rounded-lg flex items-start gap-3"
                      >
                        <GitCommit className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{commit.message}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{commit.author}</span>
                            <span>•</span>
                            <span>{format(new Date(commit.committed_at), 'MMM dd, HH:mm')}</span>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="shrink-0">
                          <a href={commit.github_url} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No related commits found</p>
                )}
              </TabsContent>

              {/* User Context Tab */}
              <TabsContent value="users" className="mt-4">
                {detail?.user_context ? (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-muted-foreground" />
                      <span className="font-medium">User Context</span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Affected Users ({detail.user_context.user_ids.length}):</span>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {detail.user_context.user_ids.slice(0, 10).map((userId) => (
                            <code key={userId} className="px-2 py-1 bg-background rounded text-xs">
                              {userId.substring(0, 8)}...
                            </code>
                          ))}
                          {detail.user_context.user_ids.length > 10 && (
                            <span className="text-muted-foreground">+{detail.user_context.user_ids.length - 10} more</span>
                          )}
                        </div>
                      </div>
                      {detail.user_context.user_agents.length > 0 && (
                        <div>
                          <span className="text-muted-foreground">User Agents:</span>
                          <ul className="mt-1 space-y-1">
                            {detail.user_context.user_agents.slice(0, 3).map((ua, i) => (
                              <li key={i} className="text-muted-foreground text-xs truncate">{ua}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No user context available</p>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Memoize to prevent re-renders when parent updates but props don't change
export const ErrorDetailModal = memo(ErrorDetailModalComponent);
