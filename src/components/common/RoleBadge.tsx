import { Badge } from '@/components/ui/badge';

export interface RoleBadgeProps {
    role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const getRoleBadgeColor = (r: string) => {
        switch (r) {
            case 'ADMIN': return 'bg-red-500 hover:bg-red-600';
            case 'MANAGER': return 'bg-purple-500 hover:bg-purple-600';
            case 'TL': return 'bg-blue-500 hover:bg-blue-600';
            case 'PM': return 'bg-green-500 hover:bg-green-600';
            case 'QA': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'VIEWER': return 'bg-slate-500 hover:bg-slate-600';
            default: return 'bg-slate-500';
        }
    };

    return (
        <Badge className={getRoleBadgeColor(role)}>
            {role}
        </Badge>
    );
}
