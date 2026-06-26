import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusConfig = (s: string) => {
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
            default:
                return {
                    className: 'bg-muted text-muted-foreground border-border',
                    icon: AlertCircle,
                    label: s
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
            <IconComponent className="h-3.5 w-3.5" />
            {config.label}
        </Badge>
    );
}
