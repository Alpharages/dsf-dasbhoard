import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Cloud, Database, ChevronRight, Loader2, FolderOpen, List, Check, Building2, Sparkles, ArrowLeft, Zap, Layers, Boxes } from 'lucide-react';
import { useClickUpHierarchy } from '../../hooks/useClickUpHierarchy';
import type { Organization, Space, ListItem } from '../../types/integrations';
import { useImportProject } from '../../hooks/useImportProject';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';

interface ClickUpImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

interface ApiErrorResponse {
    message?: string;
    error?: string;
}

type Provider = 'CLICKUP' | 'JIRA' | 'ASANA';

export function ClickUpImportModal({ isOpen, onClose, onImportSuccess }: ClickUpImportModalProps) {
    const [step, setStep] = useState<'provider' | 'organization' | 'hierarchy'>('provider');
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [selectedList, setSelectedList] = useState<ListItem | null>(null);
    const [hasMultipleOrgs, setHasMultipleOrgs] = useState(false);

    const { data: hierarchyData, isLoading: isLoadingHierarchy } = useClickUpHierarchy(
        selectedProvider === 'CLICKUP' && step !== 'provider',
        selectedOrganization?.id
    );

    // Auto-select organization if only one exists
    if (!selectedOrganization && hierarchyData?.organizations?.length === 1 && step === 'organization') {
        setSelectedOrganization(hierarchyData.organizations[0]);
        setHasMultipleOrgs(false);
        setStep('hierarchy');
    }

    // Detect multiple organizations
    if (!selectedOrganization && hierarchyData?.organizations && hierarchyData.organizations.length > 1 && !hasMultipleOrgs) {
        setHasMultipleOrgs(true);
    }

    const { mutate: importProject, isPending: isImporting } = useImportProject({
        onSuccess: () => {
            toast.success('Project imported successfully!');
            handleClose();
            onImportSuccess?.();
        },
        onError: (error: unknown) => {
            const apiError = error as { response?: { data?: ApiErrorResponse } };
            const errorMessage = apiError.response?.data?.message || apiError.response?.data?.error || 'Failed to import project';
            toast.error(errorMessage);
        }
    });

    const handleClose = () => {
        setStep('provider');
        setSelectedProvider(null);
        setSelectedOrganization(null);
        setSelectedSpace(null);
        setSelectedList(null);
        setHasMultipleOrgs(false);
        onClose();
    };

    const handleProviderSelect = (provider: Provider) => {
        if (provider !== 'CLICKUP') {
            toast('Coming soon!', { icon: '🚧' });
            return;
        }
        setSelectedProvider(provider);
        setStep('organization');
    };

    const handleBack = () => {
        if (step === 'hierarchy') {
            setSelectedSpace(null);
            setSelectedList(null);
            if (hasMultipleOrgs) {
                setStep('organization');
                setSelectedOrganization(null);
            } else {
                setStep('provider');
                setSelectedProvider(null);
                setSelectedOrganization(null);
            }
        } else if (step === 'organization') {
            setStep('provider');
            setSelectedProvider(null);
        }
    };

    const handleImport = () => {
        if (!selectedProvider || !selectedList) {
            toast.error('Please select a list to import');
            return;
        }

        importProject({
            provider: selectedProvider,
            resourceId: selectedList.id
        });
    };

    const providers: { name: Provider; icon: any; available: boolean; description: string }[] = [
        { name: 'CLICKUP', icon: Cloud, available: true, description: 'Import tasks and lists' },
        { name: 'JIRA', icon: Database, available: false, description: 'Import issues and epics' },
        { name: 'ASANA', icon: Database, available: false, description: 'Import projects and tasks' }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[720px] bg-gradient-to-br from-card/95 to-card/80 border-border/50 text-foreground p-0 overflow-hidden shadow-2xl gap-0 backdrop-blur-xl">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-secondary/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

                <DialogHeader className="p-8 pb-4 relative z-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                            {step === 'provider' ? (
                                <Sparkles className="w-5 h-5 text-primary" />
                            ) : step === 'organization' ? (
                                <Building2 className="w-5 h-5 text-primary" />
                            ) : (
                                <Layers className="w-5 h-5 text-primary" />
                            )}
                        </div>
                        <div className="flex-1">
                            <DialogTitle className="text-2xl font-bold text-foreground tracking-tight">
                                {step === 'provider' ? 'Import Project' :
                                    step === 'organization' ? 'Select Organization' : 'Select List'}
                            </DialogTitle>
                        </div>
                        {step !== 'provider' && (
                            <button
                                onClick={handleBack}
                                className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <DialogDescription className="text-muted-foreground text-base mt-2 pl-[52px]">
                        {step === 'provider'
                            ? 'Connect your existing workflow tools to sync projects.'
                            : step === 'organization'
                                ? 'Choose a ClickUp Workspace to import from.'
                                : 'Choose where you want to import tasks from.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-2 relative z-10 min-h-[420px]">
                    {step === 'provider' && (
                        <div className="grid grid-cols-1 gap-4 mt-2">
                            {providers.map((provider, index) => (
                                <button
                                    key={provider.name}
                                    onClick={() => handleProviderSelect(provider.name)}
                                    disabled={!provider.available}
                                    className={cn(
                                        "group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 w-full outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 focus:ring-offset-background overflow-hidden",
                                        provider.available
                                            ? "bg-gradient-to-r from-card to-card/80 hover:from-muted/80 hover:to-muted/60 border-border hover:border-primary/40 cursor-pointer shadow-lg hover:shadow-primary/10 hover:shadow-xl hover:-translate-y-0.5"
                                            : "bg-muted/20 border-border/50 cursor-not-allowed opacity-60"
                                    )}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    {/* Hover gradient effect */}
                                    {provider.available && (
                                        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    )}
                                    
                                    <div className="flex items-center gap-5 relative z-10">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-inner",
                                            provider.available
                                                ? "bg-gradient-to-br from-primary/20 to-primary/5 text-primary group-hover:from-primary/30 group-hover:to-primary/10 group-hover:scale-105 group-hover:shadow-lg group-hover:shadow-primary/20"
                                                : "bg-muted text-muted-foreground"
                                        )}>
                                            <provider.icon className="w-7 h-7" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-lg text-foreground mb-0.5 group-hover:text-primary transition-colors">
                                                {provider.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground group-hover:text-muted-foreground/80 transition-colors">
                                                {provider.description}
                                            </div>
                                        </div>
                                    </div>
                                    {provider.available ? (
                                        <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-all duration-300 group-hover:scale-110 relative z-10">
                                            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="bg-muted/50 text-muted-foreground border border-border/50 px-3 py-1 font-medium relative z-10">
                                            Soon
                                        </Badge>
                                    )}
                                </button>
                            ))}
                            
                            {/* Info hint */}
                            <div className="flex items-center gap-2 mt-4 p-3 rounded-xl bg-muted/30 border border-border/30">
                                <Zap className="w-4 h-4 text-primary/60" />
                                <span className="text-sm text-muted-foreground">
                                    More integrations coming soon. <span className="text-primary/80">Request a provider</span> if you need one.
                                </span>
                            </div>
                        </div>
                    )}

                    {step === 'organization' && (
                        <div className="h-full flex flex-col">
                            {isLoadingHierarchy ? (
                                <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary blur-xl opacity-20 animate-pulse"></div>
                                        <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-muted-foreground mt-4 font-medium animate-pulse">Loading Organizations...</p>
                                </div>
                            ) : hierarchyData?.organizations && hierarchyData.organizations.length > 0 ? (
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center justify-between px-1">
                                        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                            Available Workspaces ({hierarchyData.organizations.length})
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                                        {hierarchyData.organizations.map((org: Organization, index: number) => (
                                            <button
                                                key={org.id}
                                                onClick={() => {
                                                    setSelectedOrganization(org);
                                                    setStep('hierarchy');
                                                }}
                                                className="group flex items-center justify-between p-4 rounded-xl border border-border bg-gradient-to-r from-card to-card/80 hover:from-muted/80 hover:to-muted/60 hover:border-primary/40 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/10">
                                                        <Building2 className="w-5 h-5 text-primary group-hover:scale-110 transition-transform" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{org.name}</span>
                                                        <span className="text-xs text-muted-foreground">ClickUp Workspace</span>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-0.5" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                        <Cloud className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="font-medium text-foreground">No organizations found</p>
                                    <p className="text-sm mt-1 text-muted-foreground">Check your ClickUp permissions and try again</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'hierarchy' && (
                        <div className="h-full flex flex-col">
                            {isLoadingHierarchy ? (
                                <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-primary blur-xl opacity-20 animate-pulse"></div>
                                        <Loader2 className="w-10 h-10 text-primary animate-spin relative z-10" />
                                    </div>
                                    <p className="text-muted-foreground mt-4 font-medium animate-pulse">Loading Spaces...</p>
                                </div>
                            ) : hierarchyData?.organizations?.[0]?.spaces && hierarchyData.organizations[0].spaces.length > 0 ? (
                                <div className="space-y-6 flex-1">
                                    {/* Space Selection */}
                                    {!selectedSpace && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-2 mb-4 px-1">
                                                <Boxes className="w-4 h-4 text-primary/60" />
                                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    Available Spaces
                                                </h3>
                                                <span className="text-xs text-muted-foreground/60">• {selectedOrganization?.name}</span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                                                {hierarchyData.organizations[0].spaces.map((space: Space, index: number) => (
                                                    <button
                                                        key={space.id}
                                                        onClick={() => setSelectedSpace(space)}
                                                        className="group flex items-center justify-between p-4 rounded-xl border border-border bg-gradient-to-r from-card to-card/80 hover:from-muted/80 hover:to-muted/60 hover:border-primary/40 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-1 focus:ring-offset-background"
                                                        style={{ animationDelay: `${index * 50}ms` }}
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center border border-border/50">
                                                                <FolderOpen className="w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-semibold text-foreground group-hover:text-primary transition-colors">{space.name}</span>
                                                                <span className="text-xs text-muted-foreground">{space.lists?.length || 0} lists</span>
                                                            </div>
                                                        </div>
                                                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors transform group-hover:translate-x-0.5" />
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* List Selection */}
                                    {selectedSpace && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border/50">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSpace(null);
                                                        setSelectedList(null);
                                                    }}
                                                    className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors border border-transparent hover:border-border/50"
                                                >
                                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Selected Space</span>
                                                    <span className="text-sm font-bold text-foreground flex items-center gap-2">
                                                        <FolderOpen className="w-4 h-4 text-primary" />
                                                        {selectedSpace.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 mb-4 px-1">
                                                <List className="w-4 h-4 text-primary/60" />
                                                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                                                    Select List
                                                </h3>
                                                <span className="text-xs text-muted-foreground/60">
                                                    • {hierarchyData.organizations[0].spaces.find((s: Space) => s.id === selectedSpace.id)?.lists?.length || 0} available
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 gap-2.5 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                                {hierarchyData.organizations[0].spaces
                                                    .find((s: Space) => s.id === selectedSpace.id)
                                                    ?.lists?.map((list: ListItem) => (
                                                        <button
                                                            key={list.id}
                                                            onClick={() => setSelectedList(list)}
                                                            className={cn(
                                                                "group flex items-center justify-between p-4 rounded-xl border transition-all text-left w-full outline-none",
                                                                selectedList?.id === list.id
                                                                    ? "border-primary/50 bg-gradient-to-r from-primary/15 to-primary/5 shadow-[0_0_20px_-10px_rgba(var(--primary),0.3)]"
                                                                    : "border-border bg-gradient-to-r from-card to-card/80 hover:from-muted/80 hover:to-muted/60 hover:border-primary/30"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3.5">
                                                                <div className={cn(
                                                                    "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                                                                    selectedList?.id === list.id 
                                                                        ? "bg-primary/20" 
                                                                        : "bg-muted group-hover:bg-primary/10"
                                                                )}>
                                                                    <List className={cn(
                                                                        "w-4 h-4 transition-colors",
                                                                        selectedList?.id === list.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                                    )} />
                                                                </div>
                                                                <span className={cn(
                                                                    "font-semibold transition-colors",
                                                                    selectedList?.id === list.id ? "text-primary" : "text-foreground group-hover:text-primary"
                                                                )}>{list.name}</span>
                                                            </div>
                                                            {selectedList?.id === list.id && (
                                                                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center animate-in zoom-in spin-in-180 duration-300 shadow-lg shadow-primary/30">
                                                                    <Check className="w-3.5 h-3.5" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center flex flex-col items-center justify-center py-12 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl bg-muted/20">
                                    <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center mb-4">
                                        <FolderOpen className="w-8 h-8 text-muted-foreground/50" />
                                    </div>
                                    <p className="font-medium text-foreground">No spaces found</p>
                                    <p className="text-sm mt-1 text-muted-foreground">Check your ClickUp permissions</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 border-t border-border/50">
                    <Button
                        variant="ghost"
                        onClick={selectedSpace ? () => {
                            setSelectedSpace(null);
                            setSelectedList(null);
                        } : handleBack}
                        className="text-muted-foreground hover:text-foreground hover:bg-muted px-6 font-medium transition-colors"
                    >
                        {selectedSpace ? 'Back to Spaces' : 'Back'}
                    </Button>
                    {step === 'hierarchy' && selectedList && (
                        <Button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-2.5 rounded-xl font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-xl transition-all hover:-translate-y-0.5"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Import Project
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
