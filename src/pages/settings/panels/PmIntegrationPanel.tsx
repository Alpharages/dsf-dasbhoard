import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Boxes, Link2, Unlink2, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getPmIntegrations, getPmConnectUrl, deletePmIntegration } from '@/api/integrationsApi';
import { toast } from 'react-hot-toast';
import { useParams } from 'react-router-dom';

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
        const isConnected = !!integration;
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

            {isLoading ? (
                <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--brand-500)]" />
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
