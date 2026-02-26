/**
 * Share Dashboard Modal
 * Generate shareable read-only dashboard links
 */

import { useState } from 'react';
import { X, Link2, Copy, Check, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { financialApi } from '../../../api/financialApi';

interface ShareDashboardModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | null;
}

export function ShareDashboardModal({ isOpen, onClose, projectId }: ShareDashboardModalProps) {
    const [shareLink, setShareLink] = useState<string | null>(null);
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [generating, setGenerating] = useState(false);

    if (!isOpen) return null;

    const handleGenerateShareLink = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        setGenerating(true);
        try {
            const result = await financialApi.generateShareLink({
                projectId,
                expireDays: 7,
            });

            const expiry = new Date(result.expiresAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
            });

            setShareLink(result.shareUrl);
            setExpiryDate(expiry);
            toast.success('Share link generated successfully');
        } catch (error) {
            console.error('Failed to generate share link:', error);
            toast.error('Failed to generate share link');
        } finally {
            setGenerating(false);
        }
    };

    const copyToClipboard = () => {
        if (shareLink) {
            navigator.clipboard.writeText(shareLink);
            setCopied(true);
            toast.success('Link copied to clipboard');
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card border border-border rounded-2xl max-w-lg w-full shadow-2xl">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center">
                            <Link2 className="w-5 h-5 text-blue-500" />
                        </div>
                        <h2 className="text-xl font-bold text-foreground">Share Dashboard</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-muted-foreground" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {!shareLink ? (
                        <>
                            <p className="text-muted-foreground text-sm">
                                Generate a shareable read-only link to this dashboard. The link will expire in 7 days.
                            </p>
                            <button
                                onClick={handleGenerateShareLink}
                                disabled={generating || !projectId}
                                className="w-full px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {generating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Link2 className="w-4 h-4" />
                                        Generate Shareable Link
                                    </>
                                )}
                            </button>
                            {!projectId && (
                                <p className="text-amber-500 text-xs text-center">Please select a project first</p>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="bg-muted/50 border border-border rounded-xl p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-semibold text-muted-foreground uppercase">Shareable Link</span>
                                    <span className="text-xs text-emerald-500 font-medium">Active</span>
                                </div>
                                <div className="bg-card border border-border rounded-lg p-3 mb-3 break-all text-sm text-foreground font-mono">
                                    {shareLink}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="w-full px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4 text-emerald-500" />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            Copy Link
                                        </>
                                    )}
                                </button>
                            </div>

                            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4">
                                <p className="text-amber-600 text-sm font-medium">
                                    This link will expire on {expiryDate}
                                </p>
                            </div>

                            <div className="pt-4 border-t border-border">
                                <div className="flex items-center gap-2 mb-3">
                                    <Mail className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-semibold text-muted-foreground">Email Invitation (Optional)</span>
                                </div>
                                <input
                                    type="email"
                                    placeholder="stakeholder@company.com"
                                    className="w-full px-4 py-2 bg-muted border border-border rounded-lg text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <button
                                    className="w-full mt-2 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground font-medium rounded-lg transition-all text-sm"
                                    onClick={() => toast.success('Email invitation sent (feature in development)')}
                                >
                                    Send Invitation
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
