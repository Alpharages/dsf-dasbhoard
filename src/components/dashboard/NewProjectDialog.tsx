import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';
import { createProject } from '@/api/projectsApi';
import { useAuth } from '@/contexts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const newProjectSchema = z.object({
  name: z.string().min(1, 'Project Name is required'),
  client_name: z.string().min(1, 'Client Name is required'),
  clickup_list_id: z.string().min(1, 'ClickUp List ID is required'),
  github_repository_url: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return /^https:\/\/github\.com\/[\w-]+\/[\w.-]+(?:\.git)?$/.test(val);
      },
      { message: 'Must be a valid GitHub repository URL (e.g., https://github.com/owner/repo)' }
    ),
});

type NewProjectFormValues = z.infer<typeof newProjectSchema>;

interface NewProjectDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function NewProjectDialog({ isOpen, onOpenChange, onSuccess }: NewProjectDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<NewProjectFormValues>({
    resolver: zodResolver(newProjectSchema),
    defaultValues: {
      name: '',
      client_name: '',
      clickup_list_id: '',
      github_repository_url: '',
    },
  });

  const onSubmit = async (data: NewProjectFormValues) => {
    setIsLoading(true);
    setApiError(null);

    try {
      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      await createProject({
        name: data.name,
        client_name: data.client_name,
        clickup_list_id: data.clickup_list_id,
        pm_id: user.id,
        ...(data.github_repository_url ? { github_repository_url: data.github_repository_url } : {}),
      });

      toast.success('Project created successfully');
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      reset();
      onOpenChange(false);
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Failed to create project:', error);
      const axiosError = error as { response?: { data?: { message?: string | string[] } }; message?: string };
      const message = axiosError.response?.data?.message ?? axiosError.message ?? 'Failed to create project';
      setApiError(Array.isArray(message) ? message.join(', ') : message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      reset();
      setApiError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 overflow-hidden border-0 shadow-2xl shadow-primary/10">
        <div className="flex flex-col sm:flex-row h-full">
          {/* Decorative Sidebar */}
          <div className="hidden sm:flex sm:w-[240px] bg-muted p-6 flex-col justify-between border-r border-border relative overflow-hidden">
            <div className="relative z-10">
              <div className="h-10 w-10 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-4">
                <svg className="w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold tracking-tight text-foreground mb-2">
                Launch Project
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Initialize a new client workspace. Sync lists, assign resources, and start tracking immediately.
              </p>
            </div>
          </div>

          {/* Form Content */}
          <div className="flex-1 p-6 sm:p-8 bg-background">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-semibold tracking-tight">New Project</DialogTitle>
              <DialogDescription className="text-sm mt-1.5 opacity-80">
                Setup the foundation for your new initiative.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {apiError ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md mb-4 flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {apiError}
                </div>
              ) : null}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <Label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Project Name *</Label>
                  <Input
                    id="name"
                    {...register('name')}
                    placeholder="e.g. Acme Corp Redesign"
                    className={`transition-all bg-muted/30 focus:bg-background h-11 ${errors.name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.name ? (
                    <p className="text-sm text-destructive font-medium">{errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_name" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Client Name *</Label>
                  <Input
                    id="client_name"
                    {...register('client_name')}
                    placeholder="e.g. Acme Corporation"
                    className={`transition-all bg-muted/30 focus:bg-background h-11 ${errors.client_name ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.client_name ? (
                    <p className="text-sm text-destructive font-medium">{errors.client_name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clickup_list_id" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">ClickUp List ID *</Label>
                  <Input
                    id="clickup_list_id"
                    {...register('clickup_list_id')}
                    placeholder="e.g. 12345678"
                    className={`transition-all bg-muted/30 focus:bg-background h-11 ${errors.clickup_list_id ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                  {errors.clickup_list_id ? (
                    <p className="text-sm text-destructive font-medium">{errors.clickup_list_id.message}</p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-border/40">
                <Label htmlFor="github_repository_url" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
                  <span>GitHub Repository URL</span>
                  <span className="text-[10px] uppercase font-normal text-muted-foreground/60">Optional</span>
                </Label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  <Input
                    id="github_repository_url"
                    {...register('github_repository_url')}
                    placeholder="https://github.com/owner/repo"
                    className={`pl-9 transition-all bg-muted/30 focus:bg-background h-11 ${errors.github_repository_url ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  />
                </div>
                {errors.github_repository_url ? (
                  <p className="text-sm text-destructive font-medium">
                    {errors.github_repository_url.message}
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-border/40">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => handleOpenChange(false)}
                  disabled={isLoading}
                  className="font-medium hover:bg-muted"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="font-medium transition-all active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
