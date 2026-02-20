import { useState } from 'react';
import { LowConfidenceQueue } from '@/features/audit-logs/components/LowConfidenceQueue';
import { AuditSearchForm } from '@/features/audit-logs/components/AuditSearchForm';
import { AuditTimeline } from '@/features/audit-logs/components/AuditTimeline';

export function AuditLogsDashboard() {
  const [timelineTicketId, setTimelineTicketId] = useState('');

  return (
    <div className="space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold text-foreground tracking-tight">
          Audit Logs Dashboard
        </h1>
        <p className="text-muted-foreground font-medium">
          View AI decision audit logs, review low-confidence actions, and debug execution chains.
        </p>
      </div>

      <LowConfidenceQueue />
      
      <AuditSearchForm onViewDetail={setTimelineTicketId} />

      <div className="bg-card border border-border p-6 rounded-2xl shadow-sm">
        <h2 className="text-xl font-bold mb-4">Decision Timeline Inspector</h2>
        <div className="mb-6 flex gap-4 max-w-md">
          <input 
            type="text" 
            placeholder="Enter Ticket ID to load timeline..."
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2 text-sm"
            value={timelineTicketId}
            onChange={(e) => setTimelineTicketId(e.target.value)}
          />
        </div>
        
        {timelineTicketId ? (
          <AuditTimeline ticketId={timelineTicketId} />
        ) : (
          <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
            Please enter a ticket ID to view the timeline execution sequence.
          </div>
        )}
      </div>
    </div>
  );
}
