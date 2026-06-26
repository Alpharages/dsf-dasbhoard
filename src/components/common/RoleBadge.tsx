import { Badge } from '@/components/ui/badge';
import { Shield, Users, UserCheck, UsersRound, Eye, Wrench } from 'lucide-react';

export interface RoleBadgeProps {
    role: string;
}

export function RoleBadge({ role }: RoleBadgeProps) {
    const getRoleConfig = (r: string) => {
        switch (r) {
            case 'ADMIN':
                return {
                    className: 'bg-rose-500/10 text-rose-400 border-0',
                    icon: Shield,
                    label: 'ADMIN'
                };
            case 'MANAGER':
                return {
                    className: 'bg-violet-500/10 text-violet-400 border-0',
                    icon: Users,
                    label: 'MANAGER'
                };
            case 'TL':
                return {
                    className: 'bg-primary/10 text-primary border-0',
                    icon: UsersRound,
                    label: 'TEAM LEAD'
                };
            case 'PM':
                return {
                    className: 'bg-emerald-500/10 text-emerald-400 border-0',
                    icon: UserCheck,
                    label: 'PRODUCT'
                };
            case 'QA':
                return {
                    className: 'bg-amber-500/10 text-amber-400 border-0',
                    icon: Wrench,
                    label: 'QA'
                };
            case 'VIEWER':
                return {
                    className: 'bg-muted text-muted-foreground border-0',
                    icon: Eye,
                    label: 'VIEWER'
                };
            default:
                return {
                    className: 'bg-muted text-muted-foreground border-0',
                    icon: Users,
                    label: r
                };
        }
    };

    const config = getRoleConfig(role);
    const IconComponent = config.icon;

    return (
        <Badge className={`${config.className} font-semibold text-xs px-2.5 py-1 rounded-full flex items-center gap-1.5 w-fit`}>
            <IconComponent className="h-3 w-3" />
            {config.label}
        </Badge>
    );
}
