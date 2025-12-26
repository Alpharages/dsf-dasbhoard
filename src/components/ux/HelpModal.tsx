import React from 'react';
import { X, Keyboard, MousePointer2 } from 'lucide-react';

interface HelpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const shortcuts = [
        { key: '/', label: 'Search / Open Palette', category: 'General' },
        { key: 'Cmd + K', label: 'Command Palette', category: 'General' },
        { key: '?', label: 'Show Help', category: 'General' },
        { key: 'Esc', label: 'Close Modal / Palette', category: 'General' },
        { key: 'N', label: 'New Project', category: 'General' },
        { key: 'A', label: 'Approve Selected Ticket', category: 'Actions' },
        { key: 'R', label: 'Reject Selected Ticket', category: 'Actions' },
        { key: 'E', label: 'Rework Selected Ticket', category: 'Actions' },
    ];

    const categories = Array.from(new Set(shortcuts.map(s => s.category)));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={onClose} />

            <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex items-center justify-between p-6 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                        <div className="p-3 rounded-2xl bg-blue-600/10 border border-blue-500/20 text-blue-400">
                            <Keyboard className="w-6 h-6" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white tracking-tight">Keyboard Shortcuts</h2>
                            <p className="text-sm text-slate-500">Boost your productivity with quick actions.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {categories.map(category => (
                        <div key={category} className="mb-8 last:mb-0">
                            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500/40"></span>
                                {category}
                            </h3>
                            <div className="grid gap-3">
                                {shortcuts.filter(s => s.category === category).map((shortcut, i) => (
                                    <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-slate-800/40 border border-slate-800/50 hover:border-slate-700/50 transition-colors group">
                                        <span className="text-sm text-slate-300 font-medium group-hover:text-white transition-colors">{shortcut.label}</span>
                                        <div className="flex items-center gap-1.5">
                                            {shortcut.key.split(' + ').map((k, j) => (
                                                <React.Fragment key={j}>
                                                    <kbd className="px-2 py-1 rounded bg-slate-950 border-b-2 border-slate-800 text-[10px] font-bold text-slate-400 min-w-[24px] text-center shadow-inner">
                                                        {k}
                                                    </kbd>
                                                    {j < shortcut.key.split(' + ').length - 1 && <span className="text-slate-600 text-xs">+</span>}
                                                </React.Fragment>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-6 pt-0">
                    <div className="p-4 bg-blue-600/5 border border-blue-500/10 rounded-2xl flex gap-4 items-start">
                        <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                            <MousePointer2 className="w-4 h-4" />
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            <strong className="text-blue-400">Pro Tip:</strong> Most shortcuts are context-sensitive. For example, <kbd className="px-1 bg-slate-800 rounded text-slate-300">A</kbd> only works when a ticket is selected or open in a modal.
                        </p>
                    </div>
                </div>

                <div className="p-5 bg-slate-900 border-t border-slate-800 text-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all"
                    >
                        Got it, thanks!
                    </button>
                </div>
            </div>
        </div>
    );
};
