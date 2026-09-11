import { Badge } from '@/components/ui/badge';
import {
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Loader2,
    Inbox,
    Github,
    Globe,
    Ban,
    Search,
    PauseCircle,
} from 'lucide-react';

export interface StatusBadgeProps {
    status: string;
}

// One palette for every status so unrelated screens stay visually consistent, and
// so a new status is a one-line addition rather than a fresh set of colours.
const SUCCESS = 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30';
const DANGER = 'bg-rose-500/10 text-rose-600 border-rose-500/30';
const WARN = 'bg-amber-500/10 text-amber-600 border-amber-500/30';
const INFO = 'bg-sky-500/10 text-sky-600 border-sky-500/30';
const RUNNING = 'bg-blue-500/10 text-blue-600 border-blue-500/30';
const ACCENT = 'bg-violet-500/10 text-violet-600 border-violet-500/30';
const NEUTRAL = 'bg-muted text-muted-foreground border-border';

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusConfig = (s: string): { className: string; icon: typeof Clock; label: string; spin?: boolean } => {
        const normalized = s.toUpperCase();
        switch (normalized) {
            case 'PENDING':
                return {
                    className: 'bg-amber-500/10 text-amber-600 border-amber-500/30 hover:bg-amber-500/20',
                    icon: Clock,
                    label: 'Pending'
                };
            case 'ACCEPTED':
            case 'ACTIVE':
                return {
                    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/20',
                    icon: CheckCircle2,
                    label: 'Active'
                };
            case 'EXPIRED':
            case 'INACTIVE':
                return {
                    className: 'bg-rose-500/10 text-rose-600 border-rose-500/30 hover:bg-rose-500/20',
                    icon: XCircle,
                    label: 'Inactive'
                };
            case 'REVOKED':
                return {
                    className: 'bg-muted text-muted-foreground border-border hover:bg-muted',
                    icon: AlertCircle,
                    label: 'Revoked'
                };

            // ---- Ticket lifecycle (TicketStatus). No overlap with the invitation
            // statuses above, so one badge serves both. -------------------------
            case 'RECEIVED':
                return { className: NEUTRAL, icon: Inbox, label: 'Received' };
            case 'VALIDATED':
                return { className: INFO, icon: CheckCircle2, label: 'Validated' };
            case 'QUEUED':
                return { className: NEUTRAL, icon: Clock, label: 'Queued' };
            case 'AI_PROCESSING':
                return { className: RUNNING, icon: Loader2, label: 'AI Processing', spin: true };
            case 'QA_REVIEW':
                return { className: WARN, icon: Search, label: 'QA Review' };
            case 'GITHUB_PUSH':
                return { className: ACCENT, icon: Github, label: 'Pushing' };
            case 'DEPLOYING':
                return { className: ACCENT, icon: Loader2, label: 'Deploying', spin: true };
            case 'DEPLOYED':
                return { className: SUCCESS, icon: Globe, label: 'Deployed' };
            case 'MONITORING':
                return { className: INFO, icon: Search, label: 'Monitoring' };
            case 'COMPLETED':
                return { className: SUCCESS, icon: CheckCircle2, label: 'Completed' };
            case 'APPROVED':
                return { className: SUCCESS, icon: CheckCircle2, label: 'Approved' };
            case 'FAILED':
                return { className: DANGER, icon: XCircle, label: 'Failed' };
            case 'VALIDATION_FAILED':
                return { className: DANGER, icon: XCircle, label: 'Validation Failed' };
            case 'QA_FAILED':
                return { className: DANGER, icon: XCircle, label: 'QA Failed' };
            case 'REJECTED':
                return { className: DANGER, icon: XCircle, label: 'Rejected' };
            case 'BLOCKED_CIRCULAR':
                return { className: DANGER, icon: Ban, label: 'Circular Block' };
            case 'WAITING':
                return { className: WARN, icon: PauseCircle, label: 'Waiting' };
            case 'WAITING_FOR_LOCKS':
                return { className: WARN, icon: PauseCircle, label: 'Waiting (locks)' };
            case 'AWAITING_DEPENDENCY_RELEASE':
                return { className: WARN, icon: PauseCircle, label: 'Awaiting Dependency' };
            case 'AWAITING_APPROVAL':
                return { className: WARN, icon: Inbox, label: 'Awaiting Approval' };
            case 'AWAITING_REWORK':
                return { className: WARN, icon: AlertCircle, label: 'Awaiting Rework' };
            default:
                // Unknown status: still readable — title-cased instead of RAW_ENUM.
                return {
                    className: NEUTRAL,
                    icon: AlertCircle,
                    label: s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()),
                };
        }
    };

    const config = getStatusConfig(status);
    const IconComponent = config.icon;

    return (
        <Badge 
            variant="outline" 
            className={`${config.className} font-medium text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit border`}
        >
            <IconComponent className={`h-3.5 w-3.5 ${config.spin ? 'animate-spin' : ''}`} />
            {config.label}
        </Badge>
    );
}
