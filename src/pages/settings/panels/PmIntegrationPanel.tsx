import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Boxes, Link2, Unlink2, CheckCircle2, Loader2, AlertTriangle, Zap, RefreshCw, Copy, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { getPmIntegrations, getPmConnectUrl, deletePmIntegration, updateSyncSettings, type PmIntegration, type SyncSettingsUpdate } from '@/api/integrationsApi';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { formatDistanceToNow } from 'date-fns';

interface IntegrationProvider {
    id: string;
    name: string;
    icon: React.ElementType;
    description: string;
}

const PROVIDERS: IntegrationProvider[] = [
    {
        id: 'CLICKUP',
        name: 'ClickUp',
        icon: Boxes,
        description: 'Connect to ClickUp to sync tasks, statuses, and comments.',
    },
    {
        id: 'JIRA',
        name: 'Jira',
        icon: Link2,
        description: 'Sync with Jira projects and issues (Coming Soon).',
    },
    {
        id: 'ASANA',
        name: 'Asana',
        icon: Link2,
        description: 'Integrate with Asana workspaces and projects (Coming Soon).',
    },
];

// FIX M1: Moved SyncSettingsSection to module scope to prevent recreation on every parent render
const SyncSettingsSection: React.FC<{ integration: PmIntegration; projectId: string }> = ({ integration, projectId }) => {
    const queryClient = useQueryClient();
    const [pollingEnabled, setPollingEnabled] = useState(integration.pollingEnabled ?? false);
    const [pollingInterval, setPollingInterval] = useState(String(integration.pollingIntervalMin ?? 15));
    const [webhookEnabled, setWebhookEnabled] = useState(integration.webhookEnabled ?? false);

    // FIX H2: Implemented optimistic updates with onMutate + rollback on error
    const updateMutation = useMutation({
        mutationFn: (data: SyncSettingsUpdate) => updateSyncSettings(integration.id, data),
        onMutate: async (newData) => {
            await queryClient.cancelQueries({ queryKey: ['pm-integrations', projectId] });
            const previousIntegrations = queryClient.getQueryData<PmIntegration[]>(['pm-integrations', projectId]);
            queryClient.setQueryData<PmIntegration[]>(['pm-integrations', projectId], (old) =>
                old?.map(i =>
                    i.id === integration.id
                        ? {
                            ...i,
                            pollingEnabled: newData.polling_enabled,
                            pollingIntervalMin: newData.polling_interval_min,
                            webhookEnabled: newData.webhook_enabled,
                          }
                        : i
                ) ?? []
            );
            return { previousIntegrations };
        },
        onError: (_err, _newData, context) => {
            queryClient.setQueryData(['pm-integrations', projectId], context?.previousIntegrations);
            toast.error('Failed to update sync settings');
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pm-integrations', projectId] });
            toast.success('Sync settings updated');
        },
    });

    // FIX M2: Added error handling for clipboard API failures
    const copyWebhookUrl = () => {
        const publicUrl = import.meta.env.VITE_DSF_PUBLIC_URL || window.location.origin;
        const provider = integration.provider.toLowerCase();
        const url = `${publicUrl}/api/v1/webhooks/${provider}`;
        navigator.clipboard.writeText(url)
            .then(() => toast.success('Webhook URL copied to clipboard'))
            .catch(() => toast.error('Failed to copy URL — please copy it manually'));
    };

    const hasNoSyncMethod = !pollingEnabled && !webhookEnabled;

    const handleSave = () => {
        updateMutation.mutate({
            polling_enabled: pollingEnabled,
            polling_interval_min: Number(pollingInterval),
            webhook_enabled: webhookEnabled,
        });
    };

    return (
        <div className="space-y-6 pt-4 border-t border-[var(--card-border)] mt-4 text-left">
            {hasNoSyncMethod && (
                <Alert variant="default" className="bg-warning/10 border-warning/20 text-warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>No sync method active</AlertTitle>
                    <AlertDescription>
                        DSF will not receive updates from {integration.provider}.
                    </AlertDescription>
                </Alert>
            )}

            {/* Polling Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Polling Configuration</Label>
                    </div>
                    <Switch
                        checked={pollingEnabled}
                        onCheckedChange={setPollingEnabled}
                    />
                </div>

                {pollingEnabled && (
                    <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="space-y-1.5 text-left">
                            <Label className="text-xs text-muted-foreground">Interval</Label>
                            <Select value={pollingInterval} onValueChange={setPollingInterval}>
                                <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Select interval" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 minutes</SelectItem>
                                    <SelectItem value="10">10 minutes</SelectItem>
                                    <SelectItem value="15">15 minutes</SelectItem>
                                    <SelectItem value="30">30 minutes</SelectItem>
                                    <SelectItem value="60">60 minutes</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5 text-left">
                            <Label className="text-xs text-muted-foreground">Last Run</Label>
                            <div className="h-9 flex items-center px-3 rounded-md bg-muted/50 text-xs font-mono">
                                {integration.pollingLastRunAt
                                    ? formatDistanceToNow(new Date(integration.pollingLastRunAt), { addSuffix: true })
                                    : 'Never'
                                }
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Webhook Section */}
            {/* FIX M3: Status badge and URL are always visible (not gated by the webhook toggle) */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-muted-foreground" />
                        <Label className="text-sm font-medium">Webhook Configuration</Label>
                    </div>
                    <Switch
                        checked={webhookEnabled}
                        onCheckedChange={setWebhookEnabled}
                    />
                </div>

                <div className="space-y-3 text-left">
                    <div className="flex items-center justify-between">
                        <Label className="text-xs text-muted-foreground">Status</Label>
                        <Badge
                            variant="outline"
                            className={integration.webhookId
                                ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                                : "bg-warning/10 text-warning border-warning/20"
                            }
                        >
                            {integration.webhookId ? 'Active' : 'Not Registered'}
                        </Badge>
                    </div>
                    <div className="flex gap-2 text-left">
                        <Input
                            readOnly
                            value={`${import.meta.env.VITE_DSF_PUBLIC_URL || window.location.origin}/api/v1/webhooks/${integration.provider.toLowerCase()}`}
                            className="h-9 text-xs font-mono bg-muted/50"
                        />
                        <Button variant="outline" size="icon" className="h-9 w-9 shrink-0" onClick={copyWebhookUrl}>
                            <Copy className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <Button
                className="w-full bg-[var(--brand-500)] hover:bg-[var(--brand-600)]"
                size="sm"
                onClick={handleSave}
                disabled={updateMutation.isPending}
            >
                {updateMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                    <Save className="w-4 h-4 mr-2" />
                )}
                Save Settings
            </Button>
        </div>
    );
};

export const PmIntegrationPanel: React.FC = () => {
    const { id: projectId } = useParams<{ id: string }>();
    const queryClient = useQueryClient();

    const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
    const [disconnectingProvider, setDisconnectingProvider] = useState<string | null>(null);

    const { data: integrations, isLoading, isError } = useQuery({
        queryKey: ['pm-integrations', projectId],
        queryFn: () => getPmIntegrations(projectId!),
        enabled: !!projectId,
        staleTime: 60000,
    });

    const connectMutation = useMutation({
        mutationFn: (provider: string) => getPmConnectUrl(provider, projectId!),
        onSuccess: (data) => {
            if (data.url) {
                window.location.href = data.url;
            } else {
                toast.error('Failed to get connection URL');
                setConnectingProvider(null);
            }
        },
        onError: () => {
            toast.error('Failed to initiate connection');
            setConnectingProvider(null);
        }
    });

    const disconnectMutation = useMutation({
        mutationFn: (provider: string) => deletePmIntegration(projectId!, provider),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['pm-integrations', projectId] });
            toast.success('Integration disconnected');
            setDisconnectingProvider(null);
        },
        onError: () => {
            toast.error('Failed to disconnect integration');
            setDisconnectingProvider(null);
        }
    });

    const renderProviderCard = (provider: IntegrationProvider) => {
        const integration = integrations?.find(i => i.provider === provider.id);
        // FIX H1: Only consider connected if integration exists AND is ACTIVE
        const isConnected = !!integration && integration.status === 'ACTIVE';
        const isComingSoon = provider.id !== 'CLICKUP';
        const isConnecting = connectingProvider === provider.id;
        const isDisconnecting = disconnectingProvider === provider.id;

        return (
            <Card key={provider.id} className="glass-card overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <div className="flex items-center gap-2">
                        <div className={`p-2 rounded-lg ${isConnected ? 'bg-emerald-500/10 text-emerald-500' : 'bg-muted text-muted-foreground'}`}>
                            <provider.icon className="w-5 h-5" />
                        </div>
                        <CardTitle className="text-lg font-bold tracking-tight">{provider.name}</CardTitle>
                    </div>
                    {isConnected && (
                        <Badge variant="outline" className="status-badge-success border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Connected
                        </Badge>
                    )}
                </CardHeader>
                <CardContent>
                    <CardDescription className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {provider.description}
                    </CardDescription>

                    {isConnected ? (
                        <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-[var(--surface-1)] border border-[var(--card-border)] text-sm">
                                <div className="flex justify-between mb-1">
                                    <span className="text-muted-foreground">Workspace:</span>
                                    <span className="font-medium">{integration.workspaceName || 'Unknown'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Bot User:</span>
                                    <span className="font-medium">@{integration.botUsername || 'Unknown'}</span>
                                </div>
                            </div>
                            <Button
                                variant="destructive"
                                className="w-full transition-all duration-300 ease-out"
                                onClick={() => { setDisconnectingProvider(provider.id); disconnectMutation.mutate(provider.id); }}
                                disabled={isDisconnecting}
                            >
                                {isDisconnecting ? (
                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                ) : (
                                    <Unlink2 className="w-4 h-4 mr-2" />
                                )}
                                Disconnect
                            </Button>
                            <SyncSettingsSection integration={integration} projectId={projectId!} />
                        </div>
                    ) : (
                        <Button
                            variant="default"
                            className={`w-full bg-[var(--brand-500)] hover:bg-[var(--brand-600)] transition-all duration-300 ease-out ${isComingSoon ? 'opacity-50 cursor-not-allowed' : ''}`}
                            onClick={() => { if (!isComingSoon) { setConnectingProvider(provider.id); connectMutation.mutate(provider.id); } }}
                            disabled={isConnecting || isComingSoon}
                        >
                            {isConnecting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Link2 className="w-4 h-4 mr-2" />
                            )}
                            {isComingSoon ? 'Coming Soon' : 'Connect'}
                        </Button>
                    )}
                </CardContent>
            </Card>
        );
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[var(--brand-500)]/10 rounded-xl text-[var(--brand-500)]">
                    <Boxes className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-foreground tracking-tight">PM Tool Integrations</h1>
                    <p className="text-muted-foreground leading-relaxed">Connect and manage external project management tools.</p>
                </div>
            </div>

            {/* FIX H3: Use Skeleton component for loading state instead of spinner */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((n) => (
                        <Card key={n} className="glass-card overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-6 w-20" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-3/4 mb-4" />
                                <Skeleton className="h-9 w-full" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : isError ? (
                <div className="flex items-center gap-3 p-4 border border-error/50 rounded-xl bg-error/10 text-error">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <p className="text-sm">Failed to load integration status. Please try again later.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {PROVIDERS.map(renderProviderCard)}
                </div>
            )}
        </div>
    );
};
