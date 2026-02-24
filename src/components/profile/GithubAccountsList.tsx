import React, { useState } from 'react';
import { useGithubAccounts, useDeleteGithubAccount } from '@/hooks/queries/useGithubAccounts';
import { Card, CardContent, CardDescription, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Github, ExternalLink, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import type { GitHubAccount } from '@/api/githubApi';

export const GithubAccountsList: React.FC = () => {
    const { data: accounts, isLoading, error } = useGithubAccounts();
    const deleteMutation = useDeleteGithubAccount();
    const [pendingDeleteAccount, setPendingDeleteAccount] = useState<GitHubAccount | null>(null);

    const handleConfirmDisconnect = () => {
        if (!pendingDeleteAccount) return;
        const username = pendingDeleteAccount.username;
        deleteMutation.mutate(pendingDeleteAccount.id, {
            onSuccess: (result) => {
                const projectMsg = result.affectedProjects > 0
                    ? `${result.affectedProjects} project(s) affected.`
                    : 'No projects were affected.';
                toast.success(`@${username} disconnected. ${projectMsg}`);
                setPendingDeleteAccount(null);
            },
            onError: (err) => {
                const serverMsg = err.response?.data?.message;
                toast.error(serverMsg || err.message || 'Failed to disconnect account. Please try again.');
            },
        });
    };

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
        <>
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
                            <Card
                                key={account.id}
                                className="overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-colors"
                            >
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
                                        <div className="flex items-center gap-2">
                                            <a
                                                href={`https://github.com/${account.username}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="p-2 hover:bg-secondary rounded-full transition-colors"
                                            >
                                                <ExternalLink className="h-4 w-4 text-muted-foreground" />
                                            </a>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => setPendingDeleteAccount(account)}
                                                disabled={deleteMutation.isPending}
                                                aria-label={`Disconnect ${account.username}`}
                                            >
                                                {deleteMutation.isPending && pendingDeleteAccount?.id === account.id ? (
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            <AlertDialog
                open={!!pendingDeleteAccount}
                onOpenChange={(open) => { if (!open && !deleteMutation.isPending) setPendingDeleteAccount(null); }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Disconnect @{pendingDeleteAccount?.username}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove DSF&apos;s access to the{' '}
                            <span className="font-semibold">@{pendingDeleteAccount?.username}</span> GitHub account.
                            Any projects linked to this account will lose their GitHub connection and must be
                            reconfigured.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={deleteMutation.isPending}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={handleConfirmDisconnect}
                            disabled={deleteMutation.isPending}
                        >
                            {deleteMutation.isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Disconnecting…</>
                            ) : (
                                'Disconnect'
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
};
