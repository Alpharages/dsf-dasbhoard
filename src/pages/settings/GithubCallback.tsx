import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Github } from 'lucide-react';
import { saveGithubCallback } from '@/api/githubApi';
import { toast } from 'react-hot-toast';

export const GithubCallback: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [isProcessing, setIsProcessing] = useState(true);

    useEffect(() => {
        const processCallback = async () => {
            const code = searchParams.get('code');
            const error = searchParams.get('error');
            const errorDescription = searchParams.get('error_description');

            if (error) {
                const message = errorDescription || error;
                const formattedMessage = message === 'access_denied' 
                    ? 'GitHub access request was declined.' 
                    : message;
                
                toast.error(formattedMessage);
                navigate(`/profile?error=${encodeURIComponent(formattedMessage)}`);
                return;
            }

            if (!code) {
                toast.error('Authorization code is missing from GitHub.');
                navigate('/profile?error=missing_code');
                return;
            }

            try {
                const response = await saveGithubCallback({ code, error: error || undefined, error_description: errorDescription || undefined });
                
                if (response?.success) {
                    toast.success('GitHub account connected successfully!');
                    navigate('/profile?success=true');
                } else {
                    const errMsg = response?.error || 'Failed to connect GitHub account.';
                    toast.error(errMsg);
                    navigate(`/profile?error=${encodeURIComponent(errMsg)}`);
                }
            } catch (err: any) {
                const message = err.response?.data?.message || err.message || 'Unknown error occurred.';
                toast.error(`Error connecting GitHub account: ${message}`);
                navigate(`/profile?error=${encodeURIComponent(message)}`);
            } finally {
                setIsProcessing(false);
            }
        };

        processCallback();
    }, [searchParams, navigate]);

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
