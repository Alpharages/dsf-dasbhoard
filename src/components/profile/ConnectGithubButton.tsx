import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Github, Loader2, Plus } from 'lucide-react';
import { getGithubLoginUrl } from '@/api/githubApi';
import { toast } from 'react-hot-toast';

export const ConnectGithubButton: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);

    const handleConnect = async () => {
        setIsLoading(true);
        try {
            const { url } = await getGithubLoginUrl();
            window.location.href = url;
        } catch (error) {
            toast.error('Could not initiate GitHub connection. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <Button 
            onClick={handleConnect} 
            disabled={isLoading}
            variant="outline"
            className="w-full flex items-center gap-2"
        >
            {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Plus className="w-4 h-4" />
            )}
            <Github className="w-4 h-4" />
            Connect GitHub Account
        </Button>
    );
};
