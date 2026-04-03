import { useState, useCallback, useRef, useEffect } from 'react';
import { ExternalLink, ShieldAlert, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { resolveQaFailure } from '@/api/executionsApi';
import type { QAResolutionResult } from '@/types/execution';

interface PMResolutionModalProps {
  isOpen: boolean;
  executionId: string;
  branchName: string | null;
  /** Full GitHub URL: project.github_repository_url + '/tree/' + branchName. Null if repo URL unknown. */
  branchUrl: string | null;
  errorMessage: string;
  onClose: () => void;
  /** Parent callback — called with the API result so parent can update execution cache and status. */
  onResolved: (result: QAResolutionResult) => void;
}

type ModalStep =
  | 'idle' // default: showing branch/error + action buttons
  | 'confirming' // "Open PR Anyway" clicked — showing confirmation
  | 'submitting' // API call in-flight
  | 'success_cancel' // cancel succeeded — showing confirmation message
  | 'error'; // API error — showing error message

export function PMResolutionModal({
  isOpen,
  executionId,
  branchName,
  branchUrl,
  errorMessage,
  onClose,
  onResolved,
}: PMResolutionModalProps) {
  const [step, setStep] = useState<ModalStep>('idle');
  const [errorText, setErrorText] = useState<string | null>(null);

  const isSubmitting = step === 'submitting';
  const isBlocked = isSubmitting || step === 'confirming'; // P0: also block during confirmation

  // P4: ref guard to prevent double-submit from rapid clicks
  const submittingRef = useRef(false);

  // P2: store timer IDs so they can be cleared on unmount or early dismiss
  const cancelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const errorTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // P2: clear all pending timers on unmount
  useEffect(() => {
    return () => {
      if (cancelTimerRef.current != null) clearTimeout(cancelTimerRef.current);
      if (errorTimerRef.current != null) clearTimeout(errorTimerRef.current);
    };
  }, []);

  // P0 + P2: block dismiss during confirming AND submitting; clear timers on close
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !isBlocked) {
        if (cancelTimerRef.current != null) clearTimeout(cancelTimerRef.current);
        if (errorTimerRef.current != null) clearTimeout(errorTimerRef.current);
        setStep('idle');
        setErrorText(null);
        onClose();
      }
    },
    [isBlocked, onClose],
  );

  const handleOpenPrClick = () => setStep('confirming');
  const handleBackFromConfirm = () => setStep('idle');

  const submitAction = useCallback(
    async (action: 'open_pr' | 'cancel') => {
      // P4: guard against double-submit from rapid clicks before re-render
      if (submittingRef.current) return;
      submittingRef.current = true;

      setStep('submitting');
      setErrorText(null);
      try {
        const result = await resolveQaFailure(executionId, action);
        if (action === 'open_pr') {
          // P3: guard against undefined prNumber/prUrl (type marks them optional)
          const prLabel = result.prNumber != null ? `PR #${result.prNumber}` : 'PR';
          const prLink = result.prUrl ?? '(no URL)';
          // Toast FIRST (while card is still visible), then cache update removes the card
          toast.success(`${prLabel} opened — ${prLink}`, { duration: 5000, position: 'bottom-right' });
          onResolved(result); // triggers cache update → card transitions to COMPLETED
          setStep('idle');
          onClose();
        } else {
          // cancel: notify parent to update cache to FAILED, then show inline message
          onResolved(result);
          setStep('success_cancel');
          // P2: store ref so we can cancel on early dismiss or unmount
          cancelTimerRef.current = setTimeout(() => {
            setStep('idle');
            onClose();
          }, 2000);
        }
      } catch (err: unknown) {
        const response = (err as { response?: { status?: number } })?.response;
        const status = response?.status;
        if (status === 404) {
          setErrorText('Execution not found.');
          setStep('error');
        } else if (status === 409) {
          setErrorText(
            'This execution is no longer in QA Failed state — it may have already been resolved.',
          );
          setStep('error');
          // P2: store ref so we can cancel on early dismiss or unmount
          // Auto-close after 3s (FR-EXT13): onClose() → parent's handleModalClose → setResolvingExecution(null)
          errorTimerRef.current = setTimeout(() => {
            setStep('idle');
            setErrorText(null);
            onClose();
          }, 3000);
        } else if (status === 422) {
          setErrorText('Invalid action. Please refresh and try again.');
          setStep('error');
        } else if (status && status >= 500) {
          setErrorText('Server error. Please try again later.');
          setStep('error');
        } else {
          // Network error: no response object (timeout, connection refused, etc.)
          setErrorText('Network error. Check your connection and try again.');
          setStep('error');
        }
      } finally {
        submittingRef.current = false; // P4: release guard after completion
      }
    },
    [executionId, onClose, onResolved],
  );

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-lg"
        onInteractOutside={(e) => {
          // P0: Prevent close while submitting or confirming (NFR-EXT4)
          if (isBlocked) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          // P0: Prevent close while submitting or confirming (NFR-EXT4)
          if (isBlocked) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-400">
            <ShieldAlert className="w-5 h-5 shrink-0" aria-hidden="true" />
            QA Failure — Resolution Required
          </DialogTitle>
          <DialogDescription>
            QA retries exhausted. Choose how to proceed with this execution.
          </DialogDescription>
        </DialogHeader>

        {/* Branch info */}
        <div className="space-y-4 py-2">
          <div className="rounded-lg bg-slate-800/50 border border-slate-700/50 p-4 space-y-1">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">
              Pushed Branch
            </p>
            {branchName ? (
              branchUrl ? (
                <a
                  href={branchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 hover:underline break-all"
                  aria-label={`Open branch ${branchName} on GitHub`}
                >
                  {branchName}
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
              ) : (
                <p className="text-sm text-slate-300 font-mono break-all">{branchName}</p>
              )
            ) : (
              <p className="text-sm text-slate-500 italic">No branch pushed</p>
            )}
          </div>

          {/* Last QA error */}
          <div className="rounded-lg bg-rose-500/5 border border-rose-500/20 p-4 space-y-1">
            <p className="text-xs font-semibold text-rose-400 uppercase tracking-widest">
              Last QA Error
            </p>
            <pre className="text-xs text-slate-300 whitespace-pre-wrap break-all max-h-40 overflow-y-auto font-mono leading-relaxed">
              {errorMessage || 'No error details available.'}
            </pre>
          </div>

          {/* Error message */}
          {step === 'error' && errorText && (
            <div
              className="flex items-start gap-2 rounded-lg bg-rose-500/10 border border-rose-500/30 p-3 text-rose-400 text-sm"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{errorText}</span>
            </div>
          )}

          {/* Cancel success message */}
          {step === 'success_cancel' && (
            <div
              className="flex items-start gap-2 rounded-lg bg-slate-700/50 border border-slate-600 p-3 text-slate-300 text-sm"
              role="status"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" aria-hidden="true" />
              <span>
                Execution cancelled — ticket moved to manual review.
                {branchName && (
                  <> Branch <span className="font-mono text-slate-200">{branchName}</span> is available for a developer to continue.</>
                )}
              </span>
            </div>
          )}

          {/* Confirmation step for "Open PR Anyway" */}
          {step === 'confirming' && (
            <div
              className="flex items-start gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 text-amber-300 text-sm"
              role="alert"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" aria-hidden="true" />
              <span>Are you sure? This will open a PR with failing QA.</span>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-2">
          {step === 'confirming' ? (
            <>
              <Button
                variant="outline"
                onClick={handleBackFromConfirm}
                disabled={isSubmitting} // P5: block Back during in-flight submit
                className="min-h-[44px]"
                aria-label="Go back to resolution options"
              >
                Back
              </Button>
              <Button
                variant="destructive"
                onClick={() => submitAction('open_pr')}
                disabled={isSubmitting}
                className="min-h-[44px]"
                aria-label="Confirm opening a PR with failing QA"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                ) : null}
                Confirm — Open PR
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={() => submitAction('cancel')}
                disabled={isSubmitting || step === 'success_cancel'}
                className="min-h-[44px]"
                aria-label="Cancel this execution and move ticket to manual review"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" aria-hidden="true" />
                ) : null}
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleOpenPrClick}
                disabled={isSubmitting || step === 'success_cancel'}
                className="min-h-[44px]"
                aria-label="Open a pull request despite failing QA"
              >
                Open PR Anyway
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
