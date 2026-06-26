import React, { useState } from 'react';
import { Send, Settings, Globe } from 'lucide-react';
import Markdown from 'react-markdown';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface TLGuidanceFormProps {
    onSubmit: (guidance: string, applyGlobally: boolean, updateThresholds: boolean) => Promise<void>;
    isSubmitting: boolean;
}

export const TLGuidanceForm: React.FC<TLGuidanceFormProps> = ({ onSubmit, isSubmitting }) => {
    const [guidance, setGuidance] = useState('');
    const [applyGlobally, setApplyGlobally] = useState(false);
    const [updateThresholds, setUpdateThresholds] = useState(false);
    const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!guidance.trim()) return;
        onSubmit(guidance, applyGlobally, updateThresholds);
    };

    return (
        <TooltipProvider>
            <form onSubmit={handleSubmit} className="bg-card/50 border border-border rounded-lg p-6 mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-blue-500" />
                    Provide Guidance to AI
                </h3>

                <div className="flex gap-4 border-b border-border mb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('write')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'write' ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Write
                        {activeTab === 'write' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('preview')}
                        className={`pb-2 px-1 text-sm font-medium transition-colors relative ${activeTab === 'preview' ? 'text-blue-500' : 'text-muted-foreground hover:text-foreground'}`}
                    >
                        Preview
                        {activeTab === 'preview' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" />}
                    </button>
                </div>

                <div className="mb-4">
                    {activeTab === 'write' ? (
                        <textarea
                            value={guidance}
                            onChange={(e) => setGuidance(e.target.value)}
                            placeholder="Clarify requirements, suggest a specific pattern, or answer the AI's questions..."
                            className="w-full bg-background border border-border rounded-lg p-4 text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/50 min-h-[160px] resize-y font-mono text-sm"
                        />
                    ) : (
                        <div className="w-full bg-background/50 border border-border rounded-lg p-4 min-h-[160px] prose prose-invert prose-sm max-w-none overflow-y-auto">
                            {guidance.trim() ? (
                                <Markdown>{guidance}</Markdown>
                            ) : (
                                <span className="text-muted-foreground italic">Nothing to preview</span>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="applyGlobally"
                                checked={applyGlobally}
                                onChange={(e) => setApplyGlobally(e.target.checked)}
                                className="w-4 h-4 rounded bg-muted border-border text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
                            />
                            <label htmlFor="applyGlobally" className="text-sm text-foreground cursor-pointer select-none flex items-center gap-1.5">
                                Apply guidance globally
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Globe className="w-3.5 h-3.5 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">This guidance will be added to the project context and applied to future decisions.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </label>
                        </div>

                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="updateThresholds"
                                checked={updateThresholds}
                                onChange={(e) => setUpdateThresholds(e.target.checked)}
                                className="w-4 h-4 rounded bg-muted border-border text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0"
                            />
                            <label htmlFor="updateThresholds" className="text-sm text-foreground cursor-pointer select-none flex items-center gap-1.5">
                                Adjust thresholds
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Settings className="w-3.5 h-3.5 text-muted-foreground" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p className="max-w-xs">Temporarily lower validation thresholds for this decision if acceptable.</p>
                                    </TooltipContent>
                                </Tooltip>
                            </label>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={!guidance.trim() || isSubmitting}
                        className="px-6 py-2.5 bg-primary hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground text-primary-foreground font-semibold rounded-lg transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="animate-spin">⏳</span> Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" /> Send Guidance & Retry
                            </>
                        )}
                    </button>
                </div>
            </form>
        </TooltipProvider>
    );
};
