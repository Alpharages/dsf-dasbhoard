import React, { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { Search, FileText, ArrowRight, X, Keyboard, Layers, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
    onOpenHelp: () => void;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose, onOpenHelp }) => {
    const [search, setSearch] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const token = localStorage.getItem('token') || 'dummy-token';

    if (!isOpen) return null;

    useEffect(() => {
        if (search.length > 2) {
            const delayDebounceFn = setTimeout(() => {
                handleSearch(search);
            }, 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setResults([]);
        }
    }, [search]);

    const handleSearch = async (query: string) => {
        setLoading(true);
        try {
            const authHeader = { Authorization: `Bearer ${token}` };
            const res = await axios.get(`${API_BASE_URL}/pm-dashboard/tickets/search?query=${query}`, {
                headers: authHeader,
            });
            setResults(res.data.data);
        } catch (err) {
            console.error('Search failed:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none">
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm pointer-events-auto" onClick={onClose} />

            <Command className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden pointer-events-auto animate-in fade-in zoom-in duration-200">
                <div className="flex items-center border-b border-slate-800 px-4">
                    <Search className="w-5 h-5 text-slate-500 mr-3" />
                    <Command.Input
                        autoFocus
                        placeholder="Search tickets, projects or actions..."
                        className="w-full h-14 bg-transparent text-slate-200 placeholder-slate-500 outline-none text-lg"
                        value={search}
                        onValueChange={setSearch}
                    />
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-slate-800 rounded text-slate-500 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <Command.List className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
                    <Command.Empty className="py-6 text-center text-slate-500">
                        {loading ? 'Searching...' : 'No results found.'}
                    </Command.Empty>

                    <Command.Group heading="Navigation" className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <CommandItem
                            onSelect={() => { navigate('/'); onClose(); }}
                            icon={<Home className="w-4 h-4" />}
                        >
                            Go to Dashboard
                        </CommandItem>
                        <CommandItem
                            onSelect={() => { navigate('/conversations'); onClose(); }}
                            icon={<Layers className="w-4 h-4" />}
                        >
                            Client Conversations
                        </CommandItem>
                    </Command.Group>

                    {results.length > 0 && (
                        <Command.Group heading="Tickets" className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 border-t border-slate-800/50">
                            {results.map((ticket) => (
                                <CommandItem
                                    key={ticket.id}
                                    onSelect={() => { navigate(`/projects/${ticket.project_id}?ticket=${ticket.id}`); onClose(); }}
                                    icon={<FileText className="w-4 h-4 text-blue-400" />}
                                    subtext={ticket.project_name}
                                >
                                    <span className="text-slate-400 mr-2">[{ticket.id.substring(0, 8)}]</span>
                                    {ticket.name}
                                </CommandItem>
                            ))}
                        </Command.Group>
                    )}

                    <Command.Group heading="Settings & Help" className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-2 border-t border-slate-800/50">
                        <CommandItem
                            onSelect={() => { onOpenHelp(); onClose(); }}
                            icon={<Keyboard className="w-4 h-4" />}
                        >
                            Keyboard Shortcuts Help
                        </CommandItem>
                    </Command.Group>
                </Command.List>

                <div className="flex items-center justify-between border-t border-slate-800 p-3 bg-slate-900/50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">↑↓</span>
                            <span className="text-[11px] text-slate-500">Navigate</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[10px] text-slate-400">Enter</span>
                            <span className="text-[11px] text-slate-500">Select</span>
                        </div>
                    </div>
                    <div className="text-[11px] text-slate-600">
                        Press <span className="text-slate-500 font-bold">Esc</span> to close
                    </div>
                </div>
            </Command>
        </div>
    );
};

const CommandItem = ({ children, onSelect, icon, subtext }: any) => (
    <Command.Item
        onSelect={onSelect}
        className="flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer aria-selected:bg-blue-600/10 aria-selected:text-blue-400 transition-all group"
    >
        <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-slate-800 border border-slate-700 group-aria-selected:border-blue-500/30 group-aria-selected:bg-blue-500/5 text-slate-400 group-aria-selected:text-blue-400 transition-colors">
                {icon}
            </div>
            <div className="flex flex-col">
                <span className="text-sm font-medium">{children}</span>
                {subtext && <span className="text-[10px] text-slate-500">{subtext}</span>}
            </div>
        </div>
        <ArrowRight className="w-4 h-4 opacity-0 group-aria-selected:opacity-100 transition-opacity" />
    </Command.Item>
);
