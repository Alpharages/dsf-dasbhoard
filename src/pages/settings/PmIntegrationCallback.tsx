import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Boxes, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';

type CallbackStatus = 'processing' | 'connected' | 'error';

export const PmIntegrationCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [status, setStatus] = useState<CallbackStatus>('processing');

    useEffect(() => {
        const integrationStatus = searchParams.get('integration');
        const projectId = searchParams.get('state');

        const handleCallback = async () => {
            if (integrationStatus === 'connected') {
                setStatus('connected');
                toast.success('PM Tool connected successfully!');
                await queryClient.invalidateQueries({ queryKey: ['pm-integrations'] });
                const destination = projectId
                    ? `/projects/${projectId}/settings/integrations`
                    : '/dashboard';
                setTimeout(() => navigate(destination, { replace: true }), 1200);
            } else if (integrationStatus === 'error') {
                setStatus('error');
                toast.error('Failed to connect PM Tool.');
                const destination = projectId
                    ? `/projects/${projectId}/settings/integrations`
                    : '/dashboard';
                setTimeout(() => navigate(destination, { replace: true }), 1500);
            } else {
                toast.error('Invalid integration callback state.');
                navigate('/dashboard', { replace: true });
            }
        };

        handleCallback();
    }, [searchParams, navigate, queryClient]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <div className="relative">
                <Boxes className="w-16 h-16 text-[var(--brand-500)] animate-pulse-glow rounded-full p-4 bg-[var(--surface-2)]" />
                {status === 'processing' && (
                    <Loader2 className="w-20 h-20 animate-spin text-[var(--brand-500)] absolute -inset-2 opacity-50" />
                )}
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight mt-4">
                {status === 'processing' ? 'Finalizing Connection...' : 'Redirecting...'}
            </h2>
            {status === 'connected' && (
                <Badge variant="outline" className="status-badge-success border-emerald-500/20 text-emerald-500 px-4 py-1.5 text-sm">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Connected
                </Badge>
            )}
            <p className="text-muted-foreground text-sm max-w-xs text-center leading-relaxed">
                Please wait while we securely finalize your project management tool integration.
            </p>
        </div>
    );
};
