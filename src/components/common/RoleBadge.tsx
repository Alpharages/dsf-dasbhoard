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
                    className: 'bg-gradient-to-r from-rose-500 to-red-500 text-white border-0 shadow-sm shadow-rose-500/25',
                    icon: Shield,
                    label: 'ADMIN'
                };
            case 'MANAGER':
                return {
                    className: 'bg-gradient-to-r from-violet-500 to-purple-500 text-white border-0 shadow-sm shadow-violet-500/25',
                    icon: Users,
                    label: 'MANAGER'
                };
            case 'TL':
                return {
                    className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 shadow-sm shadow-blue-500/25',
                    icon: UsersRound,
                    label: 'TEAM LEAD'
                };
            case 'PM':
                return {
                    className: 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0 shadow-sm shadow-emerald-500/25',
                    icon: UserCheck,
                    label: 'PRODUCT'
                };
            case 'QA':
                return {
                    className: 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0 shadow-sm shadow-amber-500/25',
                    icon: Wrench,
                    label: 'QA'
                };
            case 'VIEWER':
                return {
                    className: 'bg-gradient-to-r from-slate-500 to-slate-400 text-white border-0 shadow-sm shadow-slate-500/25',
                    icon: Eye,
                    label: 'VIEWER'
                };
            default:
                return {
                    className: 'bg-slate-500 text-white border-0',
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
