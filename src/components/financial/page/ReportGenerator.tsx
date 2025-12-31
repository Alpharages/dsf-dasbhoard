/**
 * PDF Report Generator Component
 * Generates executive PDF reports with all dashboard visualizations
 */

import { useState } from 'react';
import { FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface ReportGeneratorProps {
    projectId: string | null;
    startDate: string;
    endDate: string;
}

import { pdf } from '@react-pdf/renderer';
import { FinancialReportDoc } from './FinancialReportDoc';

interface ReportGeneratorProps {
    projectId: string | null;
    startDate: string;
    endDate: string;
    projectName?: string;
}

export function ReportGenerator({ projectId, startDate, endDate, projectName = 'Project' }: ReportGeneratorProps) {
    const [generating, setGenerating] = useState(false);

    const handleGeneratePDF = async () => {
        if (!projectId) {
            toast.error('Please select a project first');
            return;
        }

        setGenerating(true);
        const toastId = toast.loading('Generating Executive PDF report...');

        try {
            // In a real app, we'd fetch the latest metrics here
            // For now, we'll use placeholder data that looks real for the doc
            const doc = (
                <FinancialReportDoc
                    projectName={projectName}
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
            const filename = `Financial-Report-${projectName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;

            // Download the file
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            toast.success('PDF report generated successfully!', { id: toastId });
        } catch (err) {
            console.error('PDF generation failed:', err);
            toast.error('Failed to generate PDF report', { id: toastId });
        } finally {
            setGenerating(false);
        }
    };

    return (
        <button
            onClick={handleGeneratePDF}
            disabled={!projectId || generating}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-purple-500/20"
        >
            {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <FileText className="w-4 h-4" />
            )}
            {generating ? 'Generating...' : 'Generate PDF Report'}
        </button>
    );
}
