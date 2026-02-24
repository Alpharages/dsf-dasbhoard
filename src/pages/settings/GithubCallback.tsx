import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2, Github } from 'lucide-react';
import { saveGithubCallback } from '@/api/githubApi';
import { githubKeys } from '@/hooks/queries/useGithubAccounts';
import { toast } from 'react-hot-toast';

export const GithubCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        // `cancelled` prevents the double-invocation in React StrictMode (dev)
        // from sending the one-time-use GitHub code twice.
        let cancelled = false;

        const processCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            if (error) {
                if (cancelled) return;
                const message = errorDescription || error;
                const formattedMessage = message === 'access_denied'
                    ? 'GitHub access request was declined.'
                    : message;

                toast.error(formattedMessage);
                navigate('/profile', { replace: true });
                return;
            }

            if (!code) {
                if (cancelled) return;
                toast.error('Authorization code is missing from GitHub.');
                navigate('/profile', { replace: true });
                return;
            }

            try {
                const response = await saveGithubCallback({ code, error: error || undefined, error_description: errorDescription || undefined });

                if (cancelled) return;

                if (response?.success) {
                    // Invalidate the accounts cache so the profile page shows the
                    // newly connected account immediately without requiring a refresh.
                    await queryClient.invalidateQueries({ queryKey: githubKeys.accounts() });
                    toast.success('GitHub account connected successfully!');
                    navigate('/profile', { replace: true });
                } else {
                    const errMsg = response?.error || 'Failed to connect GitHub account.';
                    toast.error(errMsg);
                    navigate('/profile', { replace: true });
                }
            } catch (err: any) {
                if (cancelled) return;
                const message = err.response?.data?.message || err.message || 'Unknown error occurred.';
                toast.error(`Error connecting GitHub account: ${message}`);
                navigate('/profile', { replace: true });
            } finally {
                if (!cancelled) setIsProcessing(false);
            }
        };

        processCallback();

        return () => {
            cancelled = true;
        };
    }, [searchParams, navigate, queryClient]);

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
            <Github className="w-12 h-12 text-muted-foreground animate-pulse" />
            <h2 className="text-xl font-semibold text-foreground">
                {isProcessing ? 'Connecting to GitHub...' : 'Redirecting...'}
            </h2>
            <p className="text-muted-foreground text-sm">
                Please wait while we securely connect your account.
            </p>
            {isProcessing && <Loader2 className="w-6 h-6 animate-spin text-primary mt-4" />}
        </div>
    );
};
