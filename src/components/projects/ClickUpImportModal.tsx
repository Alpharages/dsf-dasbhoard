import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Cloud, Database, ChevronRight, Loader2, FolderOpen, List, Check, Building2 } from 'lucide-react';
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
            {/* 
                Forcing styles with !important mostly to override any potential conflicts 
                with the default DialogContent components if they aren't using twMerge correctly.
            */}
            <DialogContent className="sm:max-w-[700px] !bg-[#0f1117]/90 !backdrop-blur-xl !border-[#1e293b] text-slate-200 p-0 overflow-hidden shadow-2xl shadow-black/50 gap-0">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 pointer-events-none" />

                <DialogHeader className="p-8 pb-4 relative z-10">
                    <DialogTitle className="text-2xl font-bold text-white tracking-tight">
                        {step === 'provider' ? 'Import Project' :
                            step === 'organization' ? 'Select Organization' : 'Select List'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400 text-base mt-2">
                        {step === 'provider'
                            ? 'Connect your existing workflow tools to sync projects.'
                            : step === 'organization'
                                ? 'Choose a ClickUp Workspace.'
                                : 'Choose where you want to import tasks from.'}
                    </DialogDescription>
                </DialogHeader>

                <div className="p-8 pt-2 relative z-10 min-h-[400px]">
                    {step === 'provider' && (
                        <div className="grid grid-cols-1 gap-4 mt-2">
                            {providers.map((provider) => (
                                <button
                                    key={provider.name}
                                    onClick={() => handleProviderSelect(provider.name)}
                                    disabled={!provider.available}
                                    className={cn(
                                        "group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 w-full outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-[#0f1117]",
                                        provider.available
                                            ? "bg-[#161b27]/80 hover:bg-[#1e2330] border-[#293042] hover:border-blue-500/50 cursor-pointer shadow-lg hover:shadow-blue-900/10"
                                            : "bg-[#12141c]/50 border-[#1e293b] cursor-not-allowed opacity-60"
                                    )}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={cn(
                                            "w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300",
                                            provider.available
                                                ? "bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 group-hover:scale-110"
                                                : "bg-slate-800/50 text-slate-600"
                                        )}>
                                            <provider.icon className="w-6 h-6" />
                                        </div>
                                        <div className="text-left">
                                            <div className="font-bold text-lg text-white mb-0.5 group-hover:text-blue-100 transition-colors">
                                                {provider.name}
                                            </div>
                                            <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                                                {provider.description}
                                            </div>
                                        </div>
                                    </div>
                                    {provider.available ? (
                                        <div className="w-8 h-8 rounded-full bg-slate-800/50 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                                        </div>
                                    ) : (
                                        <Badge variant="secondary" className="bg-slate-800/50 text-slate-500 border-none px-3 py-1 font-medium">
                                            Soon
                                        </Badge>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}

                    {step === 'organization' && (
                        <div className="h-full flex flex-col">
                            {isLoadingHierarchy ? (
                                <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                                        <Loader2 className="w-10 h-10 text-blue-400 animate-spin relative z-10" />
                                    </div>
                                    <p className="text-slate-400 mt-4 font-medium animate-pulse">Loading Organizations...</p>
                                </div>
                            ) : hierarchyData?.organizations && hierarchyData.organizations.length > 0 ? (
                                <div className="space-y-4 flex-1">
                                    <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                                        {hierarchyData.organizations.map((org: Organization) => (
                                            <button
                                                key={org.id}
                                                onClick={() => {
                                                    setSelectedOrganization(org);
                                                    setStep('hierarchy');
                                                }}
                                                className="group flex items-center justify-between p-4 rounded-xl border border-[#293042] bg-[#161b27] hover:bg-[#1e2330] hover:border-blue-500/50 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-[#0f1117]"
                                            >
                                                <div className="flex items-center gap-3.5">
                                                    <Building2 className="w-5 h-5 text-blue-400/80 group-hover:text-blue-400 transition-colors" />
                                                    <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{org.name}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-0.5" />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                    <Cloud className="w-12 h-12 text-slate-700 mb-3" />
                                    <p className="font-medium text-slate-400">No organizations found</p>
                                    <p className="text-sm mt-1 text-slate-500">Check your ClickUp permissions</p>
                                </div>
                            )}
                        </div>
                    )}

                    {step === 'hierarchy' && (
                        <div className="h-full flex flex-col">
                            {isLoadingHierarchy ? (
                                <div className="flex flex-col items-center justify-center flex-1 min-h-[300px]">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20 animate-pulse"></div>
                                        <Loader2 className="w-10 h-10 text-blue-400 animate-spin relative z-10" />
                                    </div>
                                    <p className="text-slate-400 mt-4 font-medium animate-pulse">Loading Spaces...</p>
                                </div>
                            ) : hierarchyData?.organizations?.[0]?.spaces && hierarchyData.organizations[0].spaces.length > 0 ? (
                                <div className="space-y-6 flex-1">
                                    {/* Space Selection */}
                                    {!selectedSpace && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">
                                                Available Spaces ({selectedOrganization?.name})
                                            </h3>
                                            <div className="grid grid-cols-1 gap-2.5 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                                                {hierarchyData.organizations[0].spaces.map((space: Space) => (
                                                    <button
                                                        key={space.id}
                                                        onClick={() => setSelectedSpace(space)}
                                                        className="group flex items-center justify-between p-4 rounded-xl border border-[#293042] bg-[#161b27] hover:bg-[#1e2330] hover:border-blue-500/50 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-1 focus:ring-offset-[#0f1117]"
                                                    >
                                                        <div className="flex items-center gap-3.5">
                                                            <FolderOpen className="w-5 h-5 text-blue-400/80 group-hover:text-blue-400 transition-colors" />
                                                            <span className="font-semibold text-slate-200 group-hover:text-white transition-colors">{space.name}</span>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors transform group-hover:translate-x-0.5" />
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* List Selection */}
                                    {selectedSpace && (
                                        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
                                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800/50">
                                                <button
                                                    onClick={() => {
                                                        setSelectedSpace(null);
                                                        setSelectedList(null);
                                                    }}
                                                    className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5 rotate-180" />
                                                </button>
                                                <div className="flex flex-col">
                                                    <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Selected Space</span>
                                                    <span className="text-sm font-bold text-white flex items-center gap-2">
                                                        <FolderOpen className="w-4 h-4 text-blue-400" />
                                                        {selectedSpace.name}
                                                    </span>
                                                </div>
                                            </div>

                                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 px-1">
                                                Select List
                                            </h3>
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
                                                                    ? "border-blue-500/50 bg-blue-500/10 shadow-[0_0_20px_-10px_rgba(59,130,246,0.2)]"
                                                                    : "border-[#293042] bg-[#161b27] hover:bg-[#1e2330] hover:border-blue-500/30"
                                                            )}
                                                        >
                                                            <div className="flex items-center gap-3.5">
                                                                <List className={cn(
                                                                    "w-5 h-5 transition-colors",
                                                                    selectedList?.id === list.id ? "text-blue-400" : "text-slate-500 group-hover:text-slate-400"
                                                                )} />
                                                                <span className={cn(
                                                                    "font-semibold transition-colors",
                                                                    selectedList?.id === list.id ? "text-blue-100" : "text-slate-300 group-hover:text-white"
                                                                )}>{list.name}</span>
                                                            </div>
                                                            {selectedList?.id === list.id && (
                                                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center animate-in zoom-in spin-in-180 duration-300">
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
                                <div className="text-center flex flex-col items-center justify-center py-12 text-slate-500 border-2 border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                                    <FolderOpen className="w-12 h-12 text-slate-700 mb-3" />
                                    <p className="font-medium text-slate-400">No spaces found</p>
                                    <p className="text-sm mt-1 text-slate-500">Check your ClickUp permissions</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-between p-6 bg-[#0B0D12] border-t border-[#1e293b]">
                    <Button
                        variant="ghost"
                        onClick={selectedSpace ? () => {
                            setSelectedSpace(null);
                            setSelectedList(null);
                        } : handleBack}
                        className="text-slate-400 hover:text-white hover:bg-slate-800/50 px-6 font-medium"
                    >
                        {selectedSpace ? 'Back to Spaces' : 'Back'}
                    </Button>
                    {step === 'hierarchy' && selectedList && (
                        <Button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-lg font-semibold shadow-lg shadow-blue-900/20 hover:shadow-blue-500/20 transition-all"
                        >
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                'Import Project'
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
