import { Badge } from '@/components/ui/badge';

export interface StatusBadgeProps {
    status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
    const getStatusBadgeStyles = (s: string) => {
        const normalized = s.toUpperCase();
        switch (normalized) {
            case 'PENDING':
                return 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30';
            case 'ACCEPTED':
            case 'ACTIVE':
                return 'bg-green-500/20 text-green-500 hover:bg-green-500/30';
            case 'EXPIRED':
            case 'INACTIVE':
                return 'bg-red-500/20 text-red-500 hover:bg-red-500/30';
            case 'REVOKED':
                return 'bg-slate-500/20 text-slate-500 hover:bg-slate-500/30';
            default:
                return 'bg-slate-500/20 text-slate-500';
        }
    };

    return (
        <Badge variant="outline" className={`border-0 ${getStatusBadgeStyles(status)}`}>
            {status}
        </Badge>
    );
}
