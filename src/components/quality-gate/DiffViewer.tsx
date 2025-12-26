import React from 'react';
import ReactDiffViewer from 'react-diff-viewer-continued';

interface DiffViewerProps {
    oldCode: string;
    newCode: string;
    fileName: string;
}

export const DiffViewer: React.FC<DiffViewerProps> = ({ oldCode, newCode, fileName }) => {
    return (
        <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700 flex justify-between items-center">
                <span className="text-sm font-mono text-slate-300">{fileName}</span>
                <div className="flex gap-2">
                    <span className="text-xs px-2 py-1 rounded bg-emerald-500/10 text-emerald-400">Changed</span>
                </div>
            </div>
            <div className="max-h-[600px] overflow-y-auto font-mono">
                <ReactDiffViewer
                    oldValue={oldCode}
                    newValue={newCode}
                    splitView={true}
                    styles={{
                        variables: {
                            dark: {
                                diffViewerBackground: '#0f172a',
                                diffViewerColor: '#94a3b8',
                                addedBackground: '#064e3b',
                                addedColor: '#34d399',
                                removedBackground: '#7f1d1d',
                                removedColor: '#f87171',
                                wordAddedBackground: '#065f46',
                                wordRemovedBackground: '#991b1b',
                                addedGutterBackground: '#064e3b',
                                removedGutterBackground: '#7f1d1d',
                                gutterBackground: '#1e293b',
                                gutterColor: '#475569',
                                emptyLineBackground: '#0f172a',
                                codeFoldGutterBackground: '#1e293b',
                                codeFoldBackground: '#0f172a',
                                codeFoldContentColor: '#64748b',
                            }
                        }
                    }}
                    useDarkTheme={true}
                />
            </div>
        </div>
    );
};
