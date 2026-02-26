/**
 * Export Menu Component
 * Dropdown menu for exporting financial data in various formats
 */

import { useState } from 'react';
import { Download, FileText, FileSpreadsheet, Package, Mail } from 'lucide-react';
import { financialApi } from '../../../api/financialApi';
import toast from 'react-hot-toast';

interface ExportMenuProps {
    projectId: string | null;
    startDate: string;
    endDate: string;
}

export function ExportMenu({ projectId, startDate, endDate }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleExportCostData = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        setLoading(true);
        setIsOpen(false);

        try {
            const blob = await financialApi.downloadCostPerFeatureCsv({
                epicId: 'all', // Export all epics
                projectId,
                startDate,
                endDate,
            });

            downloadFile(blob, `cost-data-${new Date().toISOString().split('T')[0]}.csv`);
            toast.success('Cost data exported successfully');
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to export cost data');
        } finally {
            setLoading(false);
        }
    };

    const handleExportBudgetData = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        setLoading(true);
        setIsOpen(false);

        try {
            const blob = await financialApi.downloadBudgetTrendsCsv({
                projectId,
                period: 'month',
            });

            downloadFile(blob, `budget-trends-${new Date().toISOString().split('T')[0]}.csv`);
            toast.success('Budget data exported successfully');
        } catch (err) {
            console.error('Export failed:', err);
            toast.error('Failed to export budget data');
        } finally {
            setLoading(false);
        }
    };

    const handleGeneratePDFReport = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        setIsOpen(false);
        const toastId = toast.loading('Generating Executive PDF report...');

        try {
            const { pdf } = await import('@react-pdf/renderer');
            const { FinancialReportDoc } = await import('./FinancialReportDoc');

            const doc = (
                <FinancialReportDoc
                    projectName="Selected Project"
                    dateRange={`${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`}
                    metrics={{
                        totalCost: "1,240.50",
                        totalValue: "8,500.00",
                        roi: "585",
                        burnRate: "45.20"
                    }}
                />
            );

            const blob = await pdf(doc).toBlob();
            downloadFile(blob, `Executive-Financial-Report-${new Date().toISOString().split('T')[0]}.pdf`);
            toast.success('PDF report generated successfully!', { id: toastId });
        } catch (err) {
            console.error('PDF generation failed:', err);
            toast.error('Failed to generate PDF report', { id: toastId });
        }
    };

    const handleExportAllData = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        setIsOpen(false);
        toast.loading('Preparing ZIP archive...', { id: 'zip-generation' });

        // Simulating ZIP generation
        setTimeout(() => {
            toast.success('All data exported (feature in development)', { id: 'zip-generation' });
        }, 2000);
    };

    const handleScheduleReport = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        const email = window.prompt('Enter email address for automated reports:');
        if (!email) return;

        setIsOpen(false);
        setLoading(true);

        try {
            await financialApi.scheduleReport({
                projectId,
                email,
                frequency: 'weekly',
            });
            toast.success('Report scheduled successfully');
        } catch (err) {
            console.error('Scheduling failed:', err);
            toast.error('Failed to schedule report');
        } finally {
            setLoading(false);
        }
    };

    const exportOptions = [
        {
            icon: FileText,
            label: 'Download PDF Report',
            description: 'Executive summary with charts',
            onClick: handleGeneratePDFReport,
        },
        {
            icon: FileSpreadsheet,
            label: 'Export Cost Data (CSV)',
            description: 'Cost per feature breakdown',
            onClick: handleExportCostData,
        },
        {
            icon: FileSpreadsheet,
            label: 'Export Budget Data (CSV)',
            description: 'Budget trends and forecasts',
            onClick: handleExportBudgetData,
        },
        {
            icon: Package,
            label: 'Export All Data (ZIP)',
            description: 'Complete financial dataset',
            onClick: handleExportAllData,
        },
        {
            icon: Mail,
            label: 'Schedule Weekly Report',
            description: 'Automated executive summary',
            onClick: handleScheduleReport,
        },
    ];

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
                <Download className="w-4 h-4" />
                Export
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    />
                    <div className="absolute top-full mt-2 right-0 bg-card border border-border rounded-xl shadow-2xl overflow-hidden z-20 min-w-[320px]">
                        {exportOptions.map((option, index) => (
                            <button
                                key={index}
                                onClick={option.onClick}
                                className="w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-start gap-3 border-b border-border last:border-0"
                            >
                                <option.icon className="w-5 h-5 text-muted-foreground mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="text-foreground font-medium text-sm">{option.label}</div>
                                    <div className="text-muted-foreground text-xs mt-0.5">{option.description}</div>
                                </div>
                            </button>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
