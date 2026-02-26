/**
 * Financial Metrics Dashboard Page
 * Story 6-R-3-UI: Standalone Financial Metrics Dashboard
 * 
 * Executive-level financial analysis for CFOs and Business Stakeholders
 */

import { useState } from 'react';
import { Share2 } from 'lucide-react';
import { CostSectionContainer } from '../components/financial/page/CostSectionContainer';
import { RoiSectionContainer } from '../components/financial/page/RoiSectionContainer';
import { BudgetSectionContainer } from '../components/financial/page/BudgetSectionContainer';
import { EfficiencySectionContainer } from '../components/financial/page/EfficiencySectionContainer';
import { ProjectSelector } from '../components/financial/page/ProjectSelector';
import { DateRangePicker } from '../components/financial/page/DateRangePicker';
import { ExportMenu } from '../components/financial/page/ExportMenu';
import { ShareDashboardModal } from '../components/financial/page/ShareDashboardModal';

export function FinancialMetricsPage() {
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [dateRange, setDateRange] = useState<{ startDate: Date; endDate: Date }>({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        endDate: new Date(),
    });
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    return (
        <div className="min-h-screen">
            {/* Page Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-foreground tracking-tight">
                        Financial Metrics
                    </h1>
                    <p className="text-muted-foreground mt-1">
                        Comprehensive financial analysis, ROI tracking, and cost optimization insights
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <ProjectSelector
                        selectedProjectId={selectedProjectId}
                        onProjectChange={setSelectedProjectId}
                    />

                    <DateRangePicker
                        startDate={dateRange.startDate}
                        endDate={dateRange.endDate}
                        onChange={setDateRange}
                    />

                    <button
                        onClick={() => setIsShareModalOpen(true)}
                        className="flex items-center gap-2 px-3 py-2 h-10 bg-card border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 rounded-lg font-medium transition-all text-sm whitespace-nowrap"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                    </button>

                    <ExportMenu
                        projectId={selectedProjectId}
                        startDate={dateRange.startDate.toISOString()}
                        endDate={dateRange.endDate.toISOString()}
                    />
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="space-y-8">
                {/* Cost Analysis Section */}
                <CostSectionContainer
                    projectId={selectedProjectId}
                    startDate={dateRange.startDate.toISOString()}
                    endDate={dateRange.endDate.toISOString()}
                />

                {/* ROI Tracking Section */}
                <RoiSectionContainer
                    projectId={selectedProjectId}
                    startDate={dateRange.startDate.toISOString()}
                    endDate={dateRange.endDate.toISOString()}
                />

                {/* Budget Management Section */}
                <BudgetSectionContainer
                    projectId={selectedProjectId}
                    period="month"
                />

                {/* Model Efficiency Section */}
                <EfficiencySectionContainer
                    projectId={selectedProjectId}
                    startDate={dateRange.startDate.toISOString()}
                    endDate={dateRange.endDate.toISOString()}
                />
            </div>

            {/* Share Dashboard Modal */}
            <ShareDashboardModal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                projectId={selectedProjectId}
            />
        </div>
    );
}
