import React from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, Globe, Github, Box, Inbox } from 'lucide-react';
import type { ExecutionStatus, AIProvider } from '../../types';

interface ExecutionStatusCardProps {
    status: ExecutionStatus | string;
    aiProvider?: AIProvider;
    updatedAt?: string;
    errorMessage?: string;
}

const statusConfig: Record<string, { color: string; icon: any; label: string; animate?: boolean }> = {
    QUEUED: { color: 'bg-gray-100 text-gray-700 border-gray-200', icon: Clock, label: 'Queued' },
    IN_PROGRESS: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Loader2, label: 'Processing', animate: true },
    AI_PROCESSING: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Loader2, label: 'AI Processing', animate: true },
    QA_REVIEW: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: CheckCircle, label: 'QA Review' },
    AWAITING_APPROVAL: { color: 'bg-blue-100 text-blue-700 border-blue-200', icon: Inbox, label: 'Awaiting Approval', animate: true },
    GITHUB_PUSH: { color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Github, label: 'GitHub Push' },
    DEPLOYED: { color: 'bg-green-100 text-green-700 border-green-200', icon: Globe, label: 'Deployed' },
    FAILED: { color: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, label: 'Failed' },
    TIMEOUT: { color: 'bg-orange-100 text-orange-700 border-orange-200', icon: Clock, label: 'Timeout' },
    CANCELLED: { color: 'bg-gray-100 text-gray-500 border-gray-200', icon: AlertCircle, label: 'Cancelled' },
};

export const ExecutionStatusCard: React.FC<ExecutionStatusCardProps> = ({
    status,
    aiProvider,
    updatedAt,
    errorMessage,
}) => {
    const config = statusConfig[status] || statusConfig.QUEUED;
    const Icon = config.icon;

    return (
        <div className={`p-4 rounded-xl border flex items-center justify-between transition-all duration-300 bg-white ${config.color.split(' ')[0]} bg-opacity-10`}>
            <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-lg border ${config.color}`}>
                    <Icon size={20} className={config.animate ? 'animate-spin' : ''} />
                </div>
                <div>
                    <h4 className="font-bold text-gray-900 tracking-tight">{config.label}</h4>
                    <p className="text-[11px] font-medium text-gray-500 uppercase tracking-widest">
                        {updatedAt ? `Updated ${new Date(updatedAt).toLocaleTimeString()}` : 'Initializing...'}
                    </p>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                {aiProvider && (
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white border border-gray-200 shadow-sm text-[10px] font-bold text-gray-600 uppercase tracking-wider">
                        <Box size={12} className="text-gray-400" />
                        {aiProvider.replace('_', ' ')}
                    </div>
                )}
                {status === 'FAILED' && errorMessage && (
                    <p className="text-[10px] bg-red-50 px-2 py-0.5 rounded border border-red-100 text-red-600 font-medium max-w-[150px] truncate" title={errorMessage}>
                        {errorMessage}
                    </p>
                )}
            </div>
        </div>
    );
};
