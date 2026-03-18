import { useState } from 'react';
import { AppWindow, Link2, Unlink2, Boxes, AlertTriangle } from 'lucide-react';
import { useConnectedApps, useDisconnectConnectedApp } from '@/hooks/queries/useConnectedApps';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
import { formatDistanceToNow } from 'date-fns';
import { connectedAppsApi } from '@/api/connectedAppsApi';
import { toast } from 'react-hot-toast';

const PROVIDERS = [
  { id: 'clickup', name: 'ClickUp', icon: Boxes, comingSoon: false },
  { id: 'jira', name: 'Jira', icon: Boxes, comingSoon: true },
  { id: 'asana', name: 'Asana', icon: Boxes, comingSoon: true },
];

export const ConnectedAppsPanel = () => {
  const { data: apps, isLoading, isError, refetch } = useConnectedApps();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectConnectedApp();
  const [disconnectingApp, setDisconnectingApp] = useState<any>(null);

  const handleConnect = async (provider: string) => {
    if (provider === 'clickup') {
      try {
        const { url } = await connectedAppsApi.getClickUpConnectUrl('settings');
        window.location.href = url;
      } catch (error) {
        toast.error('Failed to initiate ClickUp connection');
      }
    }
  };

  const renderAccountCard = (app: any) => {
    return (
      <div key={app.id} className="glass-card p-4 flex items-center justify-between group transition-all hover:border-primary/30">
        <div className="flex flex-col gap-1">
          <div className="font-bold text-foreground">{app.workspace_name || 'ClickUp Account'}</div>
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {app.bot_username && <span>Bot: {app.bot_username}</span>}
            {app.bot_username && <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />}
            <span>Connected {formatDistanceToNow(new Date(app.created_at), { addSuffix: true })}</span>
          </div>
        </div>
        
        <Button 
          variant="destructive" 
          size="sm" 
          className="opacity-0 group-hover:opacity-100 transition-opacity" 
          disabled={isDisconnecting}
          onClick={() => setDisconnectingApp(app)}
        >
          <Unlink2 className="w-4 h-4 mr-2" />
          Disconnect
        </Button>
      </div>
    );
  };

  const renderProviderSection = (provider: typeof PROVIDERS[0]) => {
    const providerApps = apps?.filter(app => app.provider === provider.id) || [];
    const hasApps = providerApps.length > 0;

    return (
      <div key={provider.id} className="space-y-4">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-muted rounded-lg text-muted-foreground">
              <provider.icon className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-foreground">{provider.name}</h2>
            {provider.comingSoon && (
              <Badge variant="outline" className="text-[10px] uppercase tracking-wider h-5 border-primary/20 bg-primary/5 text-primary">
                Coming Soon
              </Badge>
            )}
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => handleConnect(provider.id)}
            disabled={provider.comingSoon}
            className={provider.comingSoon ? "opacity-50 cursor-not-allowed" : ""}
          >
            <Link2 className="w-4 h-4 mr-2" />
            Connect {provider.name} Account
          </Button>
        </div>

        <div className="grid gap-3">
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : !hasApps && !provider.comingSoon ? (
            <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl bg-muted/5">
              <provider.icon className="w-12 h-12 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground font-medium mb-4">No {provider.name} accounts connected</p>
              <Button variant="secondary" size="sm" onClick={() => handleConnect(provider.id)}>
                <Link2 className="w-4 h-4 mr-2" />
                Connect Your First Account
              </Button>
            </div>
          ) : (
            providerApps.map(renderAccountCard)
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[var(--brand-500)]/10 rounded-xl text-[var(--brand-500)]">
          <AppWindow className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Connected Apps</h1>
          <p className="text-muted-foreground">Manage your third-party account connections for all projects.</p>
        </div>
      </div>

      {isError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load connected apps. Please try again.</span>
            <Button variant="ghost" size="sm" onClick={() => refetch()} className="h-auto p-1 py-0.5">
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-12">
        {PROVIDERS.map(renderProviderSection)}
      </div>

      <AlertDialog open={!!disconnectingApp} onOpenChange={(open) => !open && setDisconnectingApp(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove {disconnectingApp?.workspace_name}?</AlertDialogTitle>
            <AlertDialogDescription>
              Remove {disconnectingApp?.workspace_name} from your connected accounts? Your existing projects will continue syncing. To stop sync on a project, go to that project's settings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDisconnectingApp(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                disconnect(disconnectingApp.id);
                setDisconnectingApp(null);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDisconnecting}
            >
              Disconnect
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
