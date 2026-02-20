import React from 'react';
import { useGithubAccounts } from '@/hooks/queries/useGithubAccounts';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Github, ExternalLink, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const GithubAccountsList: React.FC = () => {
    const { data: accounts, isLoading, error } = useGithubAccounts();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                Failed to load connected accounts.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                Connected GitHub Accounts
            </h4>
            
            {accounts?.length === 0 ? (
                <Card className="border-dashed bg-muted/30">
                    <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                        <Github className="w-10 h-10 text-muted-foreground mb-4 opacity-50" />
                        <CardTitle className="text-sm font-medium">No accounts connected</CardTitle>
                        <CardDescription className="text-xs">
                            Personal access tokens are no longer supported for multi-account management.
                        </CardDescription>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {accounts?.map((account) => (
                        <Card key={account.id} className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="h-10 w-10 border border-border shadow-sm">
                                            <AvatarImage src={account.avatarUrl} alt={account.username} />
                                            <AvatarFallback>{account.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-foreground">{account.username}</p>
                                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-primary/10 text-primary font-bold uppercase">App v1</span>
                                            </div>
                                            <p className="text-xs text-muted-foreground">
                                                Connected {formatDistanceToNow(new Date(account.updatedAt))} ago
                                            </p>
                                        </div>
                                    </div>
                                    <a 
                                        href={`https://github.com/${account.username}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="p-2 hover:bg-secondary rounded-full transition-colors"
                                    >
                                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};
