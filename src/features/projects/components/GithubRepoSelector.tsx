import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { useGithubAccounts, useGithubRepos } from '@/hooks/queries/useGithubAccounts';
import { saveProjectGithubRepo, getGithubLoginUrl } from '@/api/githubApi';
import { projectKeys } from '@/hooks/queries/useProjects';
import { AlertCircle, Lock, Check, ExternalLink, Plus, ChevronsUpDown, RefreshCw, Github } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GithubRepoSelectorProps {
  project: {
    id: string;
    github_account_id?: string | null;
    github_repository_url?: string | null;
  };
}

export function GithubRepoSelector({ project }: GithubRepoSelectorProps) {
  const queryClient = useQueryClient();
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(project.github_account_id || null);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(
    project.github_repository_url ? project.github_repository_url.replace('https://github.com/', '') : null
  );
  const [repoPopoverOpen, setRepoPopoverOpen] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);

  const { data: accounts, isLoading: isLoadingAccounts } = useGithubAccounts();
  const { data: repos, isLoading: isLoadingRepos, isError: isReposError, error: reposError } = useGithubRepos(selectedAccountId);

  // Show reconnect banner when the selected account loads but returns 0 repos
  // (indicates the stored token was created without repo/read:org scope)
  const showReconnectBanner = selectedAccountId && !isLoadingRepos && !isReposError && repos?.length === 0;

  const handleReconnect = async () => {
    setIsReconnecting(true);
    try {
      const { url } = await getGithubLoginUrl();
      window.location.href = url;
    } catch {
      toast.error('Failed to start GitHub reconnect flow');
      setIsReconnecting(false);
    }
  };

  const selectedAccount = accounts?.find(acc => acc.id === selectedAccountId);
  const selectedRepoDetails = repos?.find(repo => repo.fullName === selectedRepo);

  useEffect(() => {
    if (project.github_account_id) {
      setSelectedAccountId(project.github_account_id);
    }
    if (project.github_repository_url) {
      setSelectedRepo(project.github_repository_url.replace('https://github.com/', ''));
    }
  }, [project.github_account_id, project.github_repository_url]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedAccountId || !selectedRepo) throw new Error('Account and repository must be selected');
      return saveProjectGithubRepo(project.id, {
        githubAccountId: selectedAccountId,
        repositoryFullName: selectedRepo,
      });
    },
    onSuccess: () => {
      toast.success('GitHub repository connected successfully');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || 'Failed to save repository');
    },
  });

  const handleSave = () => {
    if (!selectedAccountId || !selectedRepo) {
      toast.error('Please select both an account and a repository');
      return;
    }
    saveMutation.mutate();
  };

  const hasChanges =
    selectedAccountId !== project.github_account_id ||
    (selectedRepo ? `https://github.com/${selectedRepo}` : null) !== project.github_repository_url;

  const hasNoAccounts = !isLoadingAccounts && accounts?.length === 0;

  return (
    <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="p-1.5 rounded-md bg-primary/10">
            <Github className="h-4 w-4 text-primary" />
          </div>
          GitHub Repository
        </CardTitle>
        <CardDescription className="text-xs">
          Select a connected GitHub account and link a repository to this project for code commits.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isReposError && (
          <Alert variant="destructive" className="text-xs">
            <AlertCircle className="h-3.5 w-3.5" />
            <AlertDescription>
              {reposError instanceof Error ? reposError.message : 'Failed to load repositories. Please check your account connection.'}
            </AlertDescription>
          </Alert>
        )}

        {/* Reconnect banner: shows when token lacks repo/read:org scope */}
        {showReconnectBanner && (
          <Alert className="border-amber-500/40 bg-amber-500/10 text-xs">
            <RefreshCw className="h-3.5 w-3.5 text-amber-500" />
            <AlertDescription className="flex items-center justify-between gap-3">
              <span className="text-amber-700 dark:text-amber-400">
                Reconnect your GitHub account to see all repositories and organizations.
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-amber-500/50 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10 shrink-0"
                disabled={isReconnecting}
                onClick={handleReconnect}
              >
                {isReconnecting ? (
                  <><div className="mr-1.5 h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />Connecting…</>
                ) : (
                  <><RefreshCw className="mr-1.5 h-3 w-3" />Reconnect GitHub</>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {hasNoAccounts ? (
          <div className="flex flex-col items-center justify-center py-6 text-center border border-dashed border-border rounded-lg bg-muted/20">
            <div className="p-2 rounded-full bg-muted mb-3">
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-foreground mb-1">No GitHub accounts connected</p>
            <p className="text-xs text-muted-foreground mb-3">Connect a GitHub account to link repositories</p>
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => window.open('/profile', '_blank')}
            >
              Connect Account
              <ExternalLink className="ml-1.5 h-3 w-3" />
            </Button>
          </div>
        ) : (
          <>
            {/* GitHub Account Selection */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  GitHub Account
                </label>
                <button
                  type="button"
                  onClick={() => window.open('/profile', '_blank')}
                  className="text-xs text-primary hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  Connect more accounts
                </button>
              </div>
              {isLoadingAccounts ? (
                <Skeleton className="h-9 w-full" />
              ) : (
                <Select
                  value={selectedAccountId || ''}
                  onValueChange={(value) => {
                    setSelectedAccountId(value);
                    setSelectedRepo(null);
                    setRepoPopoverOpen(false);
                  }}
                >
                  <SelectTrigger className="w-full bg-background/50">
                    <SelectValue placeholder="Select an account">
                      {selectedAccount ? (
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5 border border-border">
                            <AvatarImage src={selectedAccount.avatarUrl} alt={selectedAccount.username} />
                            <AvatarFallback className="text-[10px]">
                              {selectedAccount.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm">{selectedAccount.username}</span>
                        </div>
                      ) : (
                        'Select an account'
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent align="start" className="min-w-[280px]">
                    {accounts?.map((acc) => (
                      <SelectItem key={acc.id} value={acc.id} className="py-2">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-6 w-6 border border-border">
                            <AvatarImage src={acc.avatarUrl} alt={acc.username} />
                            <AvatarFallback className="text-[10px]">
                              {acc.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{acc.username}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Repository Selection — Popover + Command (combobox) */}
            {selectedAccountId && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Repository
                </label>
                {isLoadingRepos ? (
                  <Skeleton className="h-9 w-full" />
                ) : (
                  <Popover open={repoPopoverOpen} onOpenChange={setRepoPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={repoPopoverOpen}
                        disabled={!repos || repos.length === 0}
                        className="w-full justify-between bg-background/50 font-normal h-9 px-3"
                      >
                        {selectedRepo ? (
                          <div className="flex items-center gap-2 min-w-0">
                            {selectedRepoDetails?.private && (
                              <Lock className="h-3 w-3 text-muted-foreground shrink-0" />
                            )}
                            <span className="text-sm truncate">{selectedRepo}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">
                            {repos?.length === 0 ? 'No repositories found' : 'Select a repository'}
                          </span>
                        )}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="p-0 w-[var(--radix-popover-trigger-width)]"
                      align="start"
                      side="bottom"
                      avoidCollisions={false}
                    >
                      <Command>
                        <CommandInput placeholder="Search repositories…" className="h-9 text-sm" />
                        <CommandList className="max-h-[280px]">
                          <CommandEmpty>No repositories match your search.</CommandEmpty>
                          <CommandGroup>
                            {repos?.map((repo) => (
                              <CommandItem
                                key={repo.id}
                                value={repo.fullName}
                                onSelect={(value) => {
                                  setSelectedRepo(value === selectedRepo ? null : value);
                                  setRepoPopoverOpen(false);
                                }}
                                className="py-2.5"
                              >
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                  {repo.private ? (
                                    <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  ) : (
                                    <Github className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                  )}
                                  <span className="text-sm truncate">{repo.fullName}</span>
                                </div>
                                <Check
                                  className={cn(
                                    'ml-2 h-3.5 w-3.5 shrink-0 text-primary',
                                    selectedRepo === repo.fullName ? 'opacity-100' : 'opacity-0'
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}

                {/* Repository Link Preview */}
                {selectedRepo && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                    <ExternalLink className="h-3 w-3" />
                    <span>Will link to:</span>
                    <a
                      href={`https://github.com/${selectedRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline truncate"
                    >
                      github.com/{selectedRepo}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Current Configuration Display */}
            {project.github_repository_url && !hasChanges && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                    Repository connected
                  </p>
                  <p className="text-xs text-emerald-600/70 dark:text-emerald-400/70 truncate">
                    {project.github_repository_url.replace('https://github.com/', '')}
                  </p>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={handleSave}
                disabled={!selectedAccountId || !selectedRepo || !hasChanges || saveMutation.isPending}
                size="sm"
                className="h-9"
              >
                {saveMutation.isPending ? (
                  <>
                    <div className="mr-2 h-3.5 w-3.5 animate-spin rounded-full border-2 border-background border-t-transparent" />
                    Saving...
                  </>
                ) : project.github_repository_url ? (
                  'Update Configuration'
                ) : (
                  'Save Configuration'
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
