import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { getProject, updateProject } from '@/api/projectsApi';
import { projectKeys } from '@/hooks/queries/useProjects';
import { GithubRepoSelector } from '@/features/projects/components/GithubRepoSelector';

export function GeneralSettingsPanel() {
  const { id: projectId } = useParams<{ id: string }>();

  const queryClient = useQueryClient();

  const { data: project, isLoading, isError } = useQuery({
    queryKey: [...projectKeys.all, projectId],
    queryFn: () => getProject(projectId!),
    enabled: !!projectId,
    staleTime: 60_000,
  });

  const [name, setName] = useState('');
  const [clientName, setClientName] = useState('');
  const [defaultBranch, setDefaultBranch] = useState('');
  // Kept as a string so a blank input is distinguishable from 0 — blank means "inherit".
  const [concurrencyLimit, setConcurrencyLimit] = useState('');

  useEffect(() => {
    if (project) {
      setName(project.name);
      setClientName(project.client_name ?? '');
      setDefaultBranch(project.default_branch ?? 'main');
      setConcurrencyLimit(
        project.execution_concurrency_limit == null ? '' : String(project.execution_concurrency_limit),
      );
    }
  }, [project]);

  const savedConcurrency =
    project?.execution_concurrency_limit == null ? '' : String(project.execution_concurrency_limit);
  const parsedConcurrency = concurrencyLimit.trim() === '' ? null : Number(concurrencyLimit);
  const concurrencyValid =
    parsedConcurrency === null || (Number.isInteger(parsedConcurrency) && parsedConcurrency >= 1);

  const hasChanges =
    project &&
    (name !== project.name ||
      clientName !== (project.client_name ?? '') ||
      defaultBranch !== (project.default_branch ?? 'main') ||
      concurrencyLimit.trim() !== savedConcurrency);

  const updateMutation = useMutation({
    mutationFn: () =>
      updateProject(projectId!, {
        name,
        client_name: clientName,
        default_branch: defaultBranch,
        execution_concurrency_limit: parsedConcurrency,
      }),
    onSuccess: () => {
      toast.success('Project settings saved');
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || error.message || 'Failed to save settings');
    },
  });

  if (isError) {
    return (
      <div className="p-6 text-sm text-destructive">Failed to load project settings.</div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Project Details */}
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="p-1.5 rounded-md bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            Project Details
          </CardTitle>
          <CardDescription className="text-xs">
            Basic information about this project.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label htmlFor="project-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Project Name
                </Label>
                <Input
                  id="project-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-background/50 h-9 text-sm"
                  maxLength={255}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="client-name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Client Name
                </Label>
                <Input
                  id="client-name"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="default-branch" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Default Branch
                </Label>
                <Input
                  id="default-branch"
                  value={defaultBranch}
                  onChange={(e) => setDefaultBranch(e.target.value)}
                  className="bg-background/50 h-9 text-sm"
                  placeholder="main"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="execution-concurrency-limit" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Max Concurrent Executions
                </Label>
                <Input
                  id="execution-concurrency-limit"
                  type="number"
                  min={1}
                  step={1}
                  value={concurrencyLimit}
                  onChange={(e) => setConcurrencyLimit(e.target.value)}
                  className="bg-background/50 h-9 text-sm"
                  placeholder="Inherit global default"
                />
                <p className="text-xs text-muted-foreground">
                  Leave blank to inherit the global default from Settings → Cost &amp; AI Models.
                  Enter a number (minimum 1) to override it for this project only.
                </p>
                {!concurrencyValid && (
                  <p className="text-xs text-destructive">Must be a whole number of 1 or greater, or blank to inherit.</p>
                )}
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  size="sm"
                  className="h-9"
                  disabled={!hasChanges || updateMutation.isPending || !name.trim() || !concurrencyValid}
                  onClick={() => updateMutation.mutate()}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-3.5 w-3.5" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* GitHub Repository */}
      {project && (
        <GithubRepoSelector project={project} />
      )}
      {isLoading && (
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
