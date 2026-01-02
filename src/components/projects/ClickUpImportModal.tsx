import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Cloud, Database, ChevronRight, Loader2, FolderOpen, List } from 'lucide-react';
import { useClickUpHierarchy } from '../../hooks/useClickUpHierarchy';
import { useImportProject } from '../../hooks/useImportProject';
import { toast } from 'react-hot-toast';

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

interface Space {
    id: string;
    name: string;
}

interface ListItem {
    id: string;
    name: string;
}

export function ClickUpImportModal({ isOpen, onClose, onImportSuccess }: ClickUpImportModalProps) {
    const [step, setStep] = useState<'provider' | 'hierarchy'>('provider');
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [selectedList, setSelectedList] = useState<ListItem | null>(null);

    const { data: hierarchyData, isLoading: isLoadingHierarchy } = useClickUpHierarchy(
        selectedProvider === 'CLICKUP' && step === 'hierarchy'
    );

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
        setSelectedSpace(null);
        setSelectedList(null);
        onClose();
    };

    const handleProviderSelect = (provider: Provider) => {
        if (provider !== 'CLICKUP') {
            toast('Coming soon!', { icon: '🚧' });
            return;
        }
        setSelectedProvider(provider);
        setStep('hierarchy');
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

    const providers: { name: Provider; icon: any; available: boolean }[] = [
        { name: 'CLICKUP', icon: Cloud, available: true },
        { name: 'JIRA', icon: Database, available: false },
        { name: 'ASANA', icon: Database, available: false }
    ];

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-800 text-slate-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-white">
                        {step === 'provider' ? 'Select Integration Provider' : 'Browse ClickUp Workspace'}
                    </DialogTitle>
                    <DialogDescription className="text-slate-400">
                        {step === 'provider'
                            ? 'Choose a provider to import your project from'
                            : 'Select a space and list to import as a project'}
                    </DialogDescription>
                </DialogHeader>

                {step === 'provider' && (
                    <div className="grid grid-cols-1 gap-4 py-6">
                        {providers.map((provider) => (
                            <button
                                key={provider.name}
                                onClick={() => handleProviderSelect(provider.name)}
                                disabled={!provider.available}
                                className={`
                                    flex items-center justify-between p-6 rounded-xl border-2 transition-all
                                    ${provider.available
                                        ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 cursor-pointer'
                                        : 'border-slate-800 bg-slate-900/50 cursor-not-allowed opacity-50'
                                    }
                                `}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-lg ${provider.available ? 'bg-blue-500/10' : 'bg-slate-800'}`}>
                                        <provider.icon className={`w-6 h-6 ${provider.available ? 'text-blue-400' : 'text-slate-600'}`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-bold text-lg text-white">{provider.name}</div>
                                        <div className="text-sm text-slate-400">
                                            {provider.available ? 'Import tasks and lists' : 'Coming soon'}
                                        </div>
                                    </div>
                                </div>
                                {provider.available ? (
                                    <ChevronRight className="w-5 h-5 text-slate-400" />
                                ) : (
                                    <Badge variant="secondary" className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                                        Soon
                                    </Badge>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {step === 'hierarchy' && (
                    <div className="py-6">
                        {isLoadingHierarchy ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-blue-400 animate-spin mb-4" />
                                <p className="text-slate-400">Loading ClickUp workspace...</p>
                            </div>
                        ) : hierarchyData?.spaces && hierarchyData.spaces.length > 0 ? (
                            <div className="space-y-4">
                                {/* Space Selection */}
                                {!selectedSpace && (
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">
                                            Select a Space
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                                            {hierarchyData.spaces.map((space: Space) => (
                                                <button
                                                    key={space.id}
                                                    onClick={() => setSelectedSpace(space)}
                                                    className="flex items-center justify-between p-4 rounded-lg border border-slate-700 hover:border-blue-500 hover:bg-slate-800/50 transition-all text-left"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <FolderOpen className="w-5 h-5 text-blue-400" />
                                                        <span className="font-semibold text-white">{space.name}</span>
                                                    </div>
                                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* List Selection */}
                                {selectedSpace && (
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedSpace(null);
                                                    setSelectedList(null);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                                            >
                                                ← Back to Spaces
                                            </button>
                                        </div>
                                        <h3 className="text-sm font-bold text-slate-400 uppercase mb-3">
                                            Select a List from "{selectedSpace.name}"
                                        </h3>
                                        <div className="grid grid-cols-1 gap-2 max-h-[400px] overflow-y-auto">
                                            {selectedSpace && hierarchyData.spaces
                                                .find((s: Space) => s.id === selectedSpace.id)
                                                ?.lists?.map((list: ListItem) => (
                                                    <button
                                                        key={list.id}
                                                        onClick={() => setSelectedList(list)}
                                                        className={`
                                                            flex items-center justify-between p-4 rounded-lg border transition-all text-left
                                                            ${selectedList?.id === list.id
                                                                ? 'border-blue-500 bg-blue-500/10'
                                                                : 'border-slate-700 hover:border-blue-500 hover:bg-slate-800/50'
                                                            }
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <List className={`w-5 h-5 ${selectedList?.id === list.id ? 'text-blue-400' : 'text-slate-400'}`} />
                                                            <span className="font-semibold text-white">{list.name}</span>
                                                        </div>
                                                        {selectedList?.id === list.id && (
                                                            <Badge className="bg-blue-500 text-white">Selected</Badge>
                                                        )}
                                                    </button>
                                                ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-slate-500">
                                <p>No spaces found in your ClickUp workspace.</p>
                                <p className="text-sm mt-2">Make sure you have access to at least one space.</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Footer Actions */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-800">
                    <Button
                        variant="outline"
                        onClick={handleClose}
                        className="border-slate-700 text-slate-300 hover:bg-slate-800"
                    >
                        Cancel
                    </Button>
                    {step === 'hierarchy' && (
                        <Button
                            onClick={handleImport}
                            disabled={!selectedList || isImporting}
                            className="bg-blue-600 hover:bg-blue-500 text-white"
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
