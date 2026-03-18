import { useState, useEffect, useCallback, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
    Cloud,
    ChevronRight,
    Loader2,
    FolderOpen,
    List,
    Check,
    Building2,
    ArrowLeft,
    Layers,
    Boxes,
    ArrowRight,
    Plus,
    Search,
    X,
    AlertCircle,
    RefreshCw
} from 'lucide-react';
import { useConnectedApps, useAppHierarchy } from '../../hooks/queries/useConnectedApps';
import type { Organization, Space, ListItem, ConnectedApp } from '../../types/integrations';
import { useImportProject } from '../../hooks/useImportProject';
import { connectedAppsApi } from '../../api/connectedAppsApi';
import { toast } from 'react-hot-toast';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

interface ClickUpImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImportSuccess?: () => void;
}

type Step = 'account' | 'organization' | 'hierarchy';

// Brand colors for ClickUp
const brandColors = ['#7c3aed', '#a855f7', '#c084fc'];

// --- Sub-components ---

const SkeletonCard = ({ count = 3 }: { count?: number }) => (
    <>
        {Array.from({ length: count }).map((_, i) => (
            <div 
                key={i} 
                className="p-4 rounded-xl border border-border/30 bg-card/30"
            >
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2.5">
                        <div className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
                        <div className="h-3 bg-muted rounded-lg w-1/3 animate-pulse" />
                    </div>
                    <div className="w-10 h-10 rounded-lg bg-muted animate-pulse" />
                </div>
            </div>
        ))}
    </>
);

const StepTransition = ({ children, stepKey }: { children: React.ReactNode; stepKey: string }) => (
    <div 
        key={stepKey}
        className="animate-in fade-in slide-in-from-right-6 duration-500 ease-out fill-mode-forwards"
    >
        {children}
    </div>
);

const ConnectionStatus = ({ isConnected = true }: { isConnected?: boolean }) => (
    <div className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
        isConnected 
            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
            : "bg-amber-500/10 text-amber-600 border-amber-500/20"
    )}>
        <div className={cn(
            "w-2 h-2 rounded-full",
            isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
        )} />
        {isConnected ? 'Connected' : 'Reconnecting...'}
    </div>
);

const CountBadge = ({ count, label }: { count: number; label: string }) => {
    const getColorClass = () => {
        if (count === 0) return 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
        if (count < 5) return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-800';
        if (count < 20) return 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800';
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800';
    };

    return (
        <span className={cn(
            "px-2.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wide",
            getColorClass()
        )}>
            {count} {label}
        </span>
    );
};

// --- Main Component ---

export function ClickUpImportModal({ isOpen, onClose, onImportSuccess }: ClickUpImportModalProps) {
    const [step, setStep] = useState<Step>('account');
    const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
    const [selectedOrganization, setSelectedOrganization] = useState<Organization | null>(null);
    const [selectedSpace, setSelectedSpace] = useState<Space | null>(null);
    const [selectedList, setSelectedList] = useState<ListItem | null>(null);
    const [hasMultipleOrgs, setHasMultipleOrgs] = useState(false);
    
    // Search states
    const [orgSearch, setOrgSearch] = useState('');
    const [spaceSearch, setSpaceSearch] = useState('');
    const [listSearch, setListSearch] = useState('');

    const {
        data: connectedApps,
        isLoading: isLoadingAccounts,
        isError: isAccountsError,
        refetch: refetchAccounts,
    } = useConnectedApps();

    const { data: hierarchyData, isLoading: isLoadingHierarchy } = useAppHierarchy(
        selectedAccountId,
        selectedOrganization?.id,
        step !== 'account' && !!selectedAccountId
    );

    const clickUpAccounts = useMemo(() =>
        connectedApps?.filter(app => app.provider?.toLowerCase() === 'clickup') || [],
    [connectedApps]);

    // Auto-select account if only one exists — show confirmed state, do NOT advance step
    useEffect(() => {
        if (clickUpAccounts.length === 1 && !selectedAccountId && step === 'account') {
            setSelectedAccountId(clickUpAccounts[0].id);
        }
    }, [clickUpAccounts, selectedAccountId, step]);


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

    // Confetti trigger
    const triggerConfetti = useCallback(() => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: brandColors,
            disableForReducedMotion: true,
            zIndex: 9999
        });

        // Secondary burst
        setTimeout(() => {
            confetti({
                particleCount: 50,
                spread: 100,
                origin: { y: 0.7 },
                colors: brandColors,
                angle: 120,
                disableForReducedMotion: true,
                zIndex: 9999
            });
        }, 150);
    }, []);

    const { mutate: importProject, isPending: isImporting } = useImportProject({
        onSuccess: (data) => {
            triggerConfetti();
            
            const message = data.integrationCreated 
                ? `Project "${data.project.name}" imported and integration created! 🎉`
                : `Project "${data.project.name}" imported successfully! 🎉`;

            toast.success(message, {
                duration: 4000,
                icon: '🚀'
            });
            
            handleClose();
            onImportSuccess?.();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to import project';
            toast.error(errorMessage, { icon: '❌' });
        }
    });

    const handleClose = useCallback(() => {
        setStep('account');
        setSelectedAccountId(null);
        setSelectedOrganization(null);
        setSelectedSpace(null);
        setSelectedList(null);
        setHasMultipleOrgs(false);
        setOrgSearch('');
        setSpaceSearch('');
        setListSearch('');
        onClose();
    }, [onClose]);

    // Clear any stale pending import flag when modal opens
    useEffect(() => {
        if (isOpen) {
            localStorage.removeItem('dsf:pendingImport');
        }
    }, [isOpen]);

    const handleConnectClickUp = async () => {
        try {
            localStorage.setItem('dsf:pendingImport', JSON.stringify({ returnedFromOAuth: true }));
            const { url } = await connectedAppsApi.getClickUpConnectUrl('import');
            window.location.href = url;
        } catch (error) {
            toast.error('Failed to initiate ClickUp connection');
        }
    };

    const handleBack = useCallback(() => {
        if (step === 'hierarchy') {
            setSelectedSpace(null);
            setSelectedList(null);
            setListSearch('');
            if (hasMultipleOrgs) {
                setStep('organization');
                setSelectedOrganization(null);
            } else {
                setStep('account');
                // Don't clear selectedAccountId if we auto-picked it
            }
        } else if (step === 'organization') {
            setStep('account');
            setOrgSearch('');
        }
    }, [step, hasMultipleOrgs]);

    const handleImport = useCallback(() => {
        if (!selectedAccountId || !selectedList) {
            toast.error('Please select a list to import');
            return;
        }

        importProject({
            provider: 'CLICKUP',
            resourceId: selectedList.id,
            accountId: selectedAccountId
        });
    }, [selectedAccountId, selectedList, importProject]);

    // Keyboard navigation
    useEffect(() => {
        if (!isOpen) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                e.preventDefault();
                if (selectedSpace) {
                    setSelectedSpace(null);
                    setSelectedList(null);
                } else {
                    handleBack();
                }
            }
            if (e.key === 'Enter' && step === 'hierarchy' && selectedList && !isImporting) {
                e.preventDefault();
                handleImport();
            }
        };
        
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, step, selectedList, isImporting, selectedSpace, handleImport, handleClose, handleBack]);


    // Filtered data
    const filteredOrganizations = useMemo(() => {
        if (!hierarchyData?.organizations) return [];
        if (!orgSearch.trim()) return hierarchyData.organizations;
        return hierarchyData.organizations.filter((org: Organization) => 
            org.name.toLowerCase().includes(orgSearch.toLowerCase())
        );
    }, [hierarchyData, orgSearch]);

    const filteredSpaces = useMemo(() => {
        if (!hierarchyData?.organizations?.[0]?.spaces) return [];
        const spaces = hierarchyData.organizations[0].spaces;
        if (!spaceSearch.trim()) return spaces;
        return spaces.filter((space: Space) => 
            space.name.toLowerCase().includes(spaceSearch.toLowerCase())
        );
    }, [hierarchyData, spaceSearch]);

    const filteredLists = useMemo(() => {
        if (!selectedSpace) return [];
        const space = hierarchyData?.organizations?.[0]?.spaces.find((s: Space) => s.id === selectedSpace.id);
        if (!space?.lists) return [];
        if (!listSearch.trim()) return space.lists;
        return space.lists.filter((list: ListItem) => 
            list.name.toLowerCase().includes(listSearch.toLowerCase())
        );
    }, [hierarchyData, selectedSpace, listSearch]);

    const getStepIcon = () => {
        switch (step) {
            case 'account': return <Cloud className="w-5 h-5 text-white" />;
            case 'organization': return <Building2 className="w-5 h-5 text-white" />;
            case 'hierarchy': return <Layers className="w-5 h-5 text-white" />;
        }
    };

    const getStepTitle = () => {
        switch (step) {
            case 'account': return 'Select Account';
            case 'organization': return 'Choose Workspace';
            case 'hierarchy': return 'Select Location';
        }
    };

    const getStepDescription = () => {
        switch (step) {
            case 'account':
                return 'Choose a connected ClickUp account or add a new one.';
            case 'organization':
                return 'Select the ClickUp workspace you want to import from.';
            case 'hierarchy':
                return `Choose a space and list from ${selectedOrganization?.name || 'your workspace'}.`;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[720px] p-0 overflow-hidden border-0 shadow-2xl bg-background/95 backdrop-blur-xl max-h-[90vh] flex flex-col">
                {/* Rich Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent pointer-events-none" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-secondary/10 via-transparent to-transparent pointer-events-none" />
                
                {/* Animated gradient orbs */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-gradient-to-br from-primary/20 to-purple-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
                <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-gradient-to-br from-secondary/20 to-blue-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" style={{ animationDelay: '1s' }} />

                {/* Header */}
                <DialogHeader className="relative z-10 p-6 sm:p-8 pb-4 flex-shrink-0">
                    {/* Progress Steps */}
                    <div className="flex items-center gap-2 mb-5">
                        {(['account', 'organization', 'hierarchy'] as Step[]).map((s, i) => {
                            const stepIndex = ['account', 'organization', 'hierarchy'].indexOf(step);
                            const isActive = i === stepIndex;
                            const isCompleted = i < stepIndex;
                            
                            return (
                                <div key={s} className="flex items-center gap-1.5 sm:gap-2">
                                    <div className={cn(
                                        "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all duration-300",
                                        isActive 
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30 scale-110" 
                                            : isCompleted
                                                ? "bg-primary/20 text-primary"
                                                : "bg-muted text-muted-foreground"
                                    )}>
                                        {isCompleted ? <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : i + 1}
                                    </div>
                                    {i < 2 && (
                                        <div className={cn(
                                            "w-8 sm:w-12 h-0.5 rounded-full transition-all duration-500",
                                            isCompleted ? "bg-primary" : "bg-muted"
                                        )} />
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <div className="flex items-start gap-3 sm:gap-4">
                        <div className="relative shrink-0">
                            <div className="absolute inset-0 bg-primary blur-xl opacity-40 animate-pulse" />
                            <div className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-primary/70 flex items-center justify-center shadow-xl shadow-primary/20">
                                {getStepIcon()}
                            </div>
                        </div>
                        <div className="flex-1 pt-0.5 sm:pt-1 min-w-0">
                            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                                <DialogTitle className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                                    {getStepTitle()}
                                </DialogTitle>
                                {step === 'organization' && <ConnectionStatus />}
                                {step !== 'account' && (
                                    <button
                                        onClick={handleBack}
                                        aria-label="Back"
                                        className="p-1.5 sm:p-2 rounded-lg hover:bg-muted transition-all text-muted-foreground hover:text-foreground hover:scale-105 active:scale-95"
                                    >
                                        <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                )}
                            </div>
                            <DialogDescription className="text-muted-foreground/80 text-sm sm:text-base mt-1 leading-relaxed">
                                {getStepDescription()}
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                {/* Content */}
                <div className="relative z-10 px-6 sm:px-8 pb-4 flex-1 overflow-y-auto custom-scrollbar min-h-0">
                    {step === 'account' && (
                        <StepTransition stepKey="account">
                            <div className="space-y-4">
                                {/* Loading skeleton */}
                                {isLoadingAccounts && <SkeletonCard count={2} />}

                                {/* Error state */}
                                {isAccountsError && (
                                    <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/10">
                                        <p className="text-sm text-destructive mb-3">Failed to load connected accounts.</p>
                                        <Button variant="outline" size="sm" onClick={() => refetchAccounts()}>
                                            <RefreshCw className="w-4 h-4 mr-2" /> Retry
                                        </Button>
                                    </div>
                                )}

                                {!isLoadingAccounts && !isAccountsError && (
                                    <>
                                        {/* Zero accounts — inline OAuth empty state */}
                                        {clickUpAccounts.length === 0 && (
                                            <div className="flex flex-col items-center gap-4 py-8 text-center border-2 border-dashed border-border/30 rounded-2xl">
                                                <Cloud className="w-12 h-12 text-muted-foreground/50" />
                                                <div>
                                                    <p className="font-semibold text-foreground">No ClickUp accounts connected</p>
                                                    <p className="text-sm text-muted-foreground mt-1">Connect your ClickUp account to start importing</p>
                                                </div>
                                                <Button onClick={handleConnectClickUp}>Connect ClickUp</Button>
                                            </div>
                                        )}

                                        {/* One or more accounts */}
                                        {clickUpAccounts.length > 0 && (
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between px-1">
                                                    <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                                        Connected Accounts
                                                    </span>
                                                    <CountBadge count={clickUpAccounts.length} label="accounts" />
                                                </div>

                                                {/* Single account — collapsed confirmed state */}
                                                {clickUpAccounts.length === 1 && (
                                                    <div className="p-4 rounded-xl border border-primary/30 bg-primary/5 flex items-center gap-3">
                                                        <div className="relative shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center border border-primary/20 shadow-inner">
                                                            <span className="text-lg font-bold text-primary">
                                                                {(clickUpAccounts[0].bot_username || clickUpAccounts[0].workspace_name)?.[0]?.toUpperCase() || 'C'}
                                                            </span>
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-semibold text-foreground truncate">
                                                                {clickUpAccounts[0].workspace_name || 'ClickUp Account'}
                                                            </p>
                                                            {clickUpAccounts[0].bot_username && (
                                                                <p className="text-xs text-muted-foreground">{clickUpAccounts[0].bot_username}</p>
                                                            )}
                                                        </div>
                                                        <Check className="w-5 h-5 text-primary shrink-0" />
                                                    </div>
                                                )}

                                                {/* Multiple accounts — radio cards (select only, advance via Next) */}
                                                {clickUpAccounts.length > 1 && (
                                                    <div className="grid grid-cols-1 gap-3 sm:gap-4 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
                                                        {clickUpAccounts.map((account: ConnectedApp, index: number) => (
                                                            <button
                                                                key={account.id}
                                                                onClick={() => setSelectedAccountId(account.id)}
                                                                className={cn(
                                                                    "group flex items-center gap-3 sm:gap-4 p-4 sm:p-5 rounded-2xl border transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/20",
                                                                    selectedAccountId === account.id
                                                                        ? "border-primary/50 bg-primary/10"
                                                                        : "border-border/50 bg-gradient-to-br from-card/80 to-background hover:from-muted/80 hover:to-muted/50 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                                                                )}
                                                                style={{ animationDelay: `${index * 50}ms` }}
                                                            >
                                                                <div className="relative shrink-0">
                                                                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center border border-primary/20 transition-all shadow-inner">
                                                                        <span className="text-lg sm:text-xl font-bold text-primary">
                                                                            {(account.bot_username || account.workspace_name)?.[0]?.toUpperCase() || 'C'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-background border border-border flex items-center justify-center shadow-lg">
                                                                        <img src="/integrations/clickup.svg" alt="ClickUp" className="w-3 h-3 sm:w-4 sm:h-4" />
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <span className="font-bold text-foreground block truncate text-base sm:text-lg">
                                                                        {account.bot_username || account.workspace_name}
                                                                    </span>
                                                                    <p className="text-xs sm:text-sm text-muted-foreground/80 mt-0.5">{account.workspace_name}</p>
                                                                </div>
                                                                {selectedAccountId === account.id && (
                                                                    <Check className="w-5 h-5 text-primary shrink-0" />
                                                                )}
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}

                                                {/* Connect another account */}
                                                <button
                                                    onClick={handleConnectClickUp}
                                                    className="w-full text-sm text-primary hover:underline py-2 text-center"
                                                >
                                                    + Connect another ClickUp account
                                                </button>
                                            </div>
                                        )}
                                    </>
                                )}
                            </div>
                        </StepTransition>
                    )}

                    {step === 'organization' && (
                        <StepTransition stepKey="organization">
                            <div className="h-full flex flex-col">
                                {/* Search */}
                                <div className="relative mb-4">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Search workspaces..."
                                        value={orgSearch}
                                        onChange={(e) => setOrgSearch(e.target.value)}
                                        className="pl-10 pr-10 py-2 rounded-xl bg-muted/50 border-border/50 focus:bg-background transition-colors"
                                    />
                                    {orgSearch && (
                                        <button
                                            onClick={() => setOrgSearch('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-muted transition-colors"
                                        >
                                            <X className="w-3.5 h-3.5 text-muted-foreground" />
                                        </button>
                                    )}
                                </div>

                                {isLoadingHierarchy ? (
                                    <div className="space-y-3">
                                        <SkeletonCard count={3} />
                                    </div>
                                ) : filteredOrganizations.length > 0 ? (
                                    <div className="space-y-3 flex-1 min-h-0">
                                        <div className="flex items-center justify-between px-1">
                                            <span className="text-xs font-semibold text-muted-foreground/70 uppercase tracking-wider">
                                                Available Workspaces
                                            </span>
                                            <CountBadge count={filteredOrganizations.length} label="found" />
                                        </div>
                                        <div className="grid grid-cols-1 gap-2.5 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: 'calc(60vh - 200px)' }}>
                                            {filteredOrganizations.map((org: Organization, index: number) => (
                                                <button
                                                    key={org.id}
                                                    onClick={() => {
                                                        setSelectedOrganization(org);
                                                        setStep('hierarchy');
                                                    }}
                                                    className="group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl border border-border/50 bg-gradient-to-r from-card/50 to-background hover:from-muted/80 hover:to-muted/50 hover:border-primary/30 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/20 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="relative shrink-0">
                                                        <div className="absolute inset-0 bg-primary blur-lg opacity-0 group-hover:opacity-30 transition-opacity" />
                                                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center border border-primary/20 group-hover:border-primary/40 transition-colors">
                                                            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="font-semibold text-foreground group-hover:text-primary transition-colors block truncate">
                                                            {org.name}
                                                        </span>
                                                        <span className="text-[10px] sm:text-xs text-muted-foreground">ClickUp Workspace</span>
                                                    </div>
                                                    {/* Hover preview info */}
                                                    <div className="hidden sm:flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                                            <Boxes className="w-3.5 h-3.5" />
                                                            <span>{org.spaces?.length || 0} spaces</span>
                                                        </div>
                                                    </div>
                                                    <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted/50 flex items-center justify-center group-hover:bg-primary group-hover:shadow-lg group-hover:shadow-primary/30 transition-all group-hover:scale-110">
                                                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground group-hover:text-primary-foreground transition-colors" />
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground border-2 border-dashed border-border/30 rounded-2xl bg-muted/10">
                                        <div className="relative mb-4 sm:mb-5">
                                            <div className="absolute inset-0 bg-muted-foreground/20 blur-xl" />
                                            <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                                {orgSearch ? <Search className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" /> : <Cloud className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />}
                                            </div>
                                        </div>
                                        <p className="font-semibold text-foreground text-base sm:text-lg">
                                            {orgSearch ? 'No matches found' : 'No workspaces found'}
                                        </p>
                                        <p className="text-xs sm:text-sm mt-1 text-muted-foreground/70 max-w-xs px-4">
                                            {orgSearch ? 'Try a different search term' : "We couldn't find any ClickUp workspaces. Check your permissions."}
                                        </p>
                                        {orgSearch && (
                                            <Button 
                                                variant="outline" 
                                                size="sm"
                                                className="mt-4"
                                                onClick={() => setOrgSearch('')}
                                            >
                                                Clear search
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </StepTransition>
                    )}

                    {step === 'hierarchy' && (
                        <StepTransition stepKey="hierarchy">
                            <div className="h-full flex flex-col">
                                {/* Breadcrumb */}
                                <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm mb-4 flex-wrap">
                                    <button 
                                        onClick={handleBack}
                                        className="text-muted-foreground hover:text-primary transition-colors"
                                    >
                                        Workspaces
                                    </button>
                                    <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground/50" />
                                    <span className="text-foreground font-medium truncate max-w-[150px] sm:max-w-[200px]">
                                        {selectedOrganization?.name}
                                    </span>
                                </div>

                                {isLoadingHierarchy ? (
                                    <div className="space-y-3">
                                        <SkeletonCard count={3} />
                                    </div>
                                ) : hierarchyData?.organizations?.[0]?.spaces && hierarchyData.organizations[0].spaces.length > 0 ? (
                                    <div className="space-y-4 sm:space-y-5 flex-1 min-h-0">
                                        {/* Space Selection */}
                                        {!selectedSpace && (
                                            <>
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3 sm:mb-4">
                                                    <div className="flex items-center gap-2">
                                                        <Boxes className="w-4 h-4 text-primary" />
                                                        <h3 className="text-sm font-bold text-foreground">Select a Space</h3>
                                                    </div>
                                                    
                                                    {/* Space search */}
                                                    <div className="relative w-full sm:w-56">
                                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search spaces..."
                                                            value={spaceSearch}
                                                            onChange={(e) => setSpaceSearch(e.target.value)}
                                                            className="pl-8 pr-8 py-1.5 h-8 text-sm rounded-lg bg-muted/50 border-border/50"
                                                        />
                                                        {spaceSearch && (
                                                            <button
                                                                onClick={() => setSpaceSearch('')}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                            >
                                                                <X className="w-3 h-3 text-muted-foreground" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: 'calc(60vh - 220px)' }}>
                                                    {filteredSpaces.map((space: Space, index: number) => (
                                                        <button
                                                            key={space.id}
                                                            onClick={() => setSelectedSpace(space)}
                                                            className="group flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-gradient-to-r from-card/50 to-background hover:from-muted/80 hover:to-muted/50 hover:border-primary/30 transition-all text-left w-full focus:outline-none focus:ring-2 focus:ring-primary/20 hover:shadow-lg hover:shadow-primary/5"
                                                            style={{ animationDelay: `${index * 50}ms` }}
                                                        >
                                                            <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-secondary/30 to-secondary/10 flex items-center justify-center border border-border/30">
                                                                <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="font-medium text-foreground block truncate">{space.name}</span>
                                                                <div className="flex items-center gap-2 mt-0.5">
                                                                    <CountBadge count={space.lists?.length || 0} label="lists" />
                                                                </div>
                                                            </div>
                                                            {/* Preview on hover */}
                                                            <div className="hidden sm:flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-muted-foreground">
                                                                <List className="w-3.5 h-3.5" />
                                                                <span>{space.lists?.length || 0}</span>
                                                            </div>
                                                            <ChevronRight className="shrink-0 w-5 h-5 text-muted-foreground/50 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                {filteredSpaces.length === 0 && spaceSearch && (
                                                    <div className="text-center py-8 text-muted-foreground">
                                                        <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                                        <p className="text-sm">No spaces match &quot;{spaceSearch}&quot;</p>
                                                        <button 
                                                            className="text-primary text-xs hover:underline mt-1"
                                                            onClick={() => setSpaceSearch('')}
                                                        >
                                                            Clear search
                                                        </button>
                                                    </div>
                                                )}
                                            </>
                                        )}

                                        {/* List Selection */}
                                        {selectedSpace && (
                                            <div className="space-y-3 sm:space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                                {/* Selected Space Header */}
                                                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedSpace(null);
                                                            setSelectedList(null);
                                                            setListSearch('');
                                                        }}
                                                        className="shrink-0 p-1.5 sm:p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                                                    >
                                                        <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                    </button>
                                                    <div className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg shadow-primary/20">
                                                        <FolderOpen className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <span className="text-[10px] sm:text-xs text-primary/80 font-medium uppercase tracking-wider block">Selected Space</span>
                                                        <span className="font-semibold text-foreground block truncate text-sm sm:text-base">{selectedSpace.name}</span>
                                                    </div>
                                                </div>

                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2">
                                                        <List className="w-4 h-4 text-primary" />
                                                        <h3 className="text-sm font-bold text-foreground">Select a List</h3>
                                                    </div>
                                                    
                                                    {/* List search */}
                                                    <div className="relative w-full sm:w-56">
                                                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                                                        <Input
                                                            placeholder="Search lists..."
                                                            value={listSearch}
                                                            onChange={(e) => setListSearch(e.target.value)}
                                                            className="pl-8 pr-8 py-1.5 h-8 text-sm rounded-lg bg-muted/50 border-border/50"
                                                        />
                                                        {listSearch && (
                                                            <button
                                                                onClick={() => setListSearch('')}
                                                                className="absolute right-2 top-1/2 -translate-y-1/2"
                                                            >
                                                                <X className="w-3 h-3 text-muted-foreground" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-2 overflow-y-auto pr-1 custom-scrollbar" style={{ maxHeight: 'calc(60vh - 280px)' }}>
                                                    {filteredLists.map((list: ListItem) => (
                                                        <button
                                                            key={list.id}
                                                            onClick={() => setSelectedList(list)}
                                                            className={cn(
                                                                "group flex items-center gap-3 p-3 rounded-xl border transition-all text-left w-full outline-none",
                                                                selectedList?.id === list.id
                                                                    ? "border-primary/50 bg-gradient-to-r from-primary/15 to-primary/5 shadow-lg shadow-primary/20"
                                                                    : "border-border/50 bg-gradient-to-r from-card/50 to-background hover:from-muted/80 hover:to-muted/50 hover:border-primary/30 hover:shadow-md"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "shrink-0 w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center transition-colors",
                                                                selectedList?.id === list.id 
                                                                    ? "bg-primary/20" 
                                                                    : "bg-muted/50 group-hover:bg-primary/10"
                                                            )}>
                                                                <List className={cn(
                                                                    "w-4 h-4 transition-colors",
                                                                    selectedList?.id === list.id ? "text-primary" : "text-muted-foreground group-hover:text-primary"
                                                                )} />
                                                            </div>
                                                            <span className={cn(
                                                                "font-medium flex-1 truncate text-sm",
                                                                selectedList?.id === list.id ? "text-primary" : "text-foreground"
                                                            )}>{list.name}</span>
                                                            {selectedList?.id === list.id && (
                                                                <div className="shrink-0 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg shadow-primary/30 animate-in zoom-in duration-200">
                                                                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                                                </div>
                                                            )}
                                                        </button>
                                                    ))}
                                                </div>
                                                
                                                {filteredLists.length === 0 && listSearch && (
                                                    <div className="text-center py-6 text-muted-foreground">
                                                        <Search className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                                        <p className="text-xs sm:text-sm">No lists match &quot;{listSearch}&quot;</p>
                                                        <button 
                                                            className="text-primary text-xs hover:underline mt-1"
                                                            onClick={() => setListSearch('')}
                                                        >
                                                            Clear search
                                                        </button>
                                                    </div>
                                                )}
                                                
                                                {filteredLists.length === 0 && !listSearch && (
                                                    <div className="text-center py-6 text-muted-foreground border-2 border-dashed border-border/30 rounded-xl bg-muted/10">
                                                        <AlertCircle className="w-6 h-6 mx-auto mb-2 opacity-50" />
                                                        <p className="text-xs sm:text-sm">No lists in this space</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center flex flex-col items-center justify-center py-12 sm:py-16 text-muted-foreground border-2 border-dashed border-border/30 rounded-2xl bg-muted/10">
                                        <div className="relative mb-4 sm:mb-5">
                                            <div className="absolute inset-0 bg-muted-foreground/20 blur-xl" />
                                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                                                <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-muted-foreground/50" />
                                            </div>
                                        </div>
                                        <p className="font-semibold text-foreground text-base sm:text-lg">No spaces found</p>
                                        <p className="text-xs sm:text-sm mt-1 text-muted-foreground/70">This workspace doesn&apos;t have any accessible spaces</p>
                                        <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="mt-4"
                                            onClick={handleBack}
                                        >
                                            <ArrowLeft className="w-4 h-4 mr-2" />
                                            Back to Workspaces
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </StepTransition>
                    )}
                </div>

                {/* Footer */}
                <div className="relative z-10 flex items-center justify-between p-5 sm:p-6 bg-gradient-to-r from-muted/30 via-muted/20 to-muted/30 border-t border-border/30 flex-shrink-0">
                    {step !== 'account' && (
                        <Button
                            variant="ghost"
                            onClick={selectedSpace ? () => {
                                setSelectedSpace(null);
                                setSelectedList(null);
                                setListSearch('');
                            } : handleBack}
                            className="text-muted-foreground hover:text-foreground hover:bg-muted/80 px-4 sm:px-5 font-medium transition-all text-xs sm:text-sm"
                            size="sm"
                        >
                            {selectedSpace ? 'Change Space' : 'Back'}
                        </Button>
                    )}

                    {step === 'account' && (
                        <Button
                            onClick={() => selectedAccountId && setStep('organization')}
                            disabled={!selectedAccountId}
                            className="ml-auto relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/85 text-primary-foreground px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            size="sm"
                        >
                            Next <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2" />
                        </Button>
                    )}

                    {step === 'hierarchy' && selectedList && (
                        <Button
                            onClick={handleImport}
                            disabled={isImporting}
                            className="relative overflow-hidden bg-gradient-to-r from-primary via-primary/95 to-primary/90 hover:from-primary/95 hover:via-primary hover:to-primary/85 text-primary-foreground px-5 sm:px-7 py-2 sm:py-2.5 rounded-xl font-semibold shadow-xl shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 active:translate-y-0 text-xs sm:text-sm"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
                            {isImporting ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2 animate-spin" />
                                    Importing...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1.5 sm:mr-2" />
                                    Import Project
                                    <kbd className="hidden sm:inline-flex ml-2 px-1.5 py-0.5 rounded bg-primary-foreground/20 text-[10px] font-mono">↵</kbd>
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
