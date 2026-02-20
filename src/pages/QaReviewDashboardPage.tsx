import React, { useState } from 'react';
import { useQaReview } from '../hooks/useQaReview';
import { QaReviewQueueTable } from '../components/qa-review/QaReviewQueueTable';
import { RequirementContext } from '../components/qa-review/RequirementContext';
import { CodeDiffViewer } from '../components/qa-review/CodeDiffViewer';
import { QaDecisionForm } from '../components/qa-review/QaDecisionForm';
import type { QaReviewSample, QaReviewDecision } from '../types/qa-review';
import { 
  ShieldCheck, 
  BarChart3, 
  AlertCircle, 
  Clock, 
  ChevronRight,
  ArrowLeft,
  Search,
  Filter as FilterIcon
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';

export const LeadQaReviewDashboardPage: React.FC = () => {
  const { useQueue, useSampleDetail, useWorkloadSummary, useSubmitDecision } = useQaReview();
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: queue = [], isLoading: isQueueLoading } = useQueue();
  const { data: summary } = useWorkloadSummary();
  const { data: selectedSample } = useSampleDetail(selectedSampleId);
  const submitDecision = useSubmitDecision();

  const handleReview = (sample: QaReviewSample) => {
    setSelectedSampleId(sample.id);
  };

  const handleBack = () => {
    setSelectedSampleId(null);
  };

  const handleSubmit = async (decision: QaReviewDecision) => {
    if (!selectedSampleId) return;
    await submitDecision.mutateAsync({ id: selectedSampleId, decision });
    setSelectedSampleId(null);
  };

  const filteredQueue = queue.filter(item => 
    item.ticket_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.ticket_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.project_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (selectedSampleId && selectedSample) {
    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 pb-20">
        <div className="flex items-center justify-between border-b border-border/50 pb-6 mb-8">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleBack}
              className="p-2.5 bg-card border border-border text-muted-foreground hover:text-foreground rounded-xl transition-all"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-bold text-muted-foreground uppercase tracking-widest">{selectedSample.project_name}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-bold text-primary">{selectedSample.ticket_id}</span>
              </div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">{selectedSample.ticket_title}</h1>
            </div>
          </div>
          <div className="flex gap-3">
             <div className="px-4 py-2 bg-card border border-border rounded-xl flex items-center gap-3">
               <span className="text-xs font-bold text-muted-foreground uppercase">AI Quality</span>
               <span className={`text-xl font-mono font-black ${
                 (selectedSample.ai_quality_score || 0) >= 85 ? 'text-emerald-500' : 'text-amber-500'
               }`}>
                 {selectedSample.ai_quality_score}%
               </span>
             </div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <RequirementContext 
              title="Ticket Requirements" 
              description={selectedSample.ticket_description || 'No requirements provided.'} 
            />
            
            <Card className="bg-card/50 border-border rounded-2xl overflow-hidden">
              <CardHeader className="border-b border-border/50 py-4 px-6">
                <CardTitle className="text-sm font-bold text-card-foreground flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Automated QA Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Linting Status</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedSample.qa_summary?.linting_passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    {selectedSample.qa_summary?.linting_passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Unit Tests</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${selectedSample.qa_summary?.tests_passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    {selectedSample.qa_summary?.tests_passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Test Coverage</span>
                  <span className="text-sm font-mono text-foreground font-bold">{selectedSample.qa_summary?.test_coverage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Security Score</span>
                  <span className="text-sm font-mono text-foreground font-bold">{selectedSample.qa_summary?.security_score}/100</span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="col-span-12 lg:col-span-8 space-y-8">
            <CodeDiffViewer diffs={selectedSample.diffs} />
            
            <div className="pt-8 border-t border-border/50">
              <h3 className="text-xl font-bold text-foreground mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-primary" />
                QA Review Decision
              </h3>
              <QaDecisionForm onSubmit={handleSubmit} isSubmitting={submitDecision.isPending} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2 flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary" />
            Lead QA Review
          </h1>
          <p className="text-muted-foreground font-medium">
            Verify AI-generated implementations and approve production deployments.
          </p>
        </div>

        <div className="flex items-center gap-4">
           {summary && (
             <>
               <div className="px-4 py-2 bg-card border border-border rounded-2xl flex items-center gap-3">
                 <div className="p-1.5 bg-primary/10 rounded-lg">
                   <Clock className="w-3.5 h-3.5 text-primary" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">Avg Review</span>
                   <span className="text-sm font-bold text-foreground">{summary.summary.avg_review_time_minutes}m</span>
                 </div>
               </div>
               <div className="px-4 py-2 bg-card border border-border rounded-2xl flex items-center gap-3">
                 <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                   < ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                 </div>
                 <div className="flex flex-col">
                   <span className="text-[10px] font-bold text-muted-foreground uppercase">SLA Success</span>
                   <span className="text-sm font-bold text-foreground">{summary.summary.sla_compliance_percent}%</span>
                 </div>
               </div>
             </>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-card/40 border-border rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Search className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Queue Depth</span>
             </div>
             <div className="text-3xl font-black text-foreground mb-1">{summary?.queue_health?.current_depth || 0}</div>
             <p className="text-xs text-muted-foreground">Reviews awaiting verification</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-amber-500/10 rounded-xl">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Wait Time</span>
             </div>
             <div className="text-3xl font-black text-foreground mb-1">{summary?.queue_health?.oldest_pending_hours || 0}h</div>
             <p className="text-xs text-muted-foreground">Oldest pending sample</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-xl">
                  <BarChart3 className="w-5 h-5 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Throughput</span>
             </div>
             <div className="text-3xl font-black text-foreground mb-1">{summary?.summary?.total_reviews_completed || 0}</div>
             <p className="text-xs text-muted-foreground">Completed this period</p>
          </CardContent>
        </Card>

        <Card className="bg-card/40 border-border rounded-2xl">
          <CardContent className="p-6">
             <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-destructive/10 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-destructive" />
                </div>
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">At Risk</span>
             </div>
             <div className="text-3xl font-black text-foreground mb-1 font-mono text-destructive">{summary?.queue_health?.at_risk_count || 0}</div>
             <p className="text-xs text-muted-foreground font-bold">Approaching SLA breach</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
           <h2 className="text-2xl font-extrabold text-foreground">Review Queue</h2>
           
           <div className="flex items-center gap-4">
              <div className="relative group w-full md:w-64">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search tickets or projects..."
                  className="w-full bg-card border border-border rounded-xl py-2.5 pl-11 pr-4 text-sm text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl text-sm font-bold text-muted-foreground hover:text-foreground transition-all">
                <FilterIcon className="w-4 h-4" />
                Filter
              </button>
           </div>
        </div>

        <QaReviewQueueTable 
          data={filteredQueue} 
          onReview={handleReview} 
          isLoading={isQueueLoading} 
        />
      </div>
    </div>
  );
};
