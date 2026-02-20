import React, { useState } from 'react';
import { useAuditTimeline } from '../hooks/useAudit';
import { Badge } from '@/components/ui/badge';
import { DecisionDetailModal } from './DecisionDetailModal';
import { Loader2, AlertCircle, Clock } from 'lucide-react';
import type { AIDecisionLog } from '../types';

interface AuditTimelineProps {
  ticketId: string;
}

export const AuditTimeline: React.FC<AuditTimelineProps> = ({ ticketId }) => {
  const { data: logs, isLoading, isError } = useAuditTimeline(ticketId);
  const [selectedLog, setSelectedLog] = useState<AIDecisionLog | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12 text-muted-foreground">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Loading audit timeline...
      </div>
    );
  }

  if (isError || !logs) {
    return (
      <div className="flex flex-col items-center py-12 text-destructive bg-destructive/10 rounded-xl">
        <AlertCircle className="w-8 h-8 mb-2" />
        <p>Failed to load audit timeline for {ticketId}</p>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground bg-secondary/20 rounded-xl border border-dashed border-border">
        <p>No audit logs found for ticket {ticketId}</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-border/50 py-4 space-y-8">
      {logs.map((log) => (
        <div key={log.id} className="relative group">
          {/* Timeline Node */}
          <div className="absolute -left-[35px] w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:bg-primary transition-colors" />
          
          <div 
            className="bg-card hover:bg-secondary/20 border border-border p-4 rounded-xl shadow-sm transition-all cursor-pointer hover:shadow-md hover:-translate-y-0.5"
            onClick={() => setSelectedLog(log)}
          >
            <div className="flex items-start justify-between mb-2 gap-4">
              <div>
                <h4 className="font-bold text-foreground">{log.action}</h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-primary/90">{log.agent_name}</span>
                  <span className="w-1 h-1 rounded-full bg-border" />
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
              
              <Badge variant={log.confidence >= 0.8 ? 'default' : log.confidence >= 0.5 ? 'secondary' : 'destructive'}>
                {(log.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
            
            <p className="text-sm text-foreground/80 line-clamp-2 mt-2 font-medium">
              {log.reasoning}
            </p>
            
            <div className="mt-3 text-xs text-primary font-semibold uppercase tracking-wider group-hover:underline transition-all">
              View Details →
            </div>
          </div>
        </div>
      ))}

      <DecisionDetailModal 
        log={selectedLog} 
        isOpen={!!selectedLog} 
        onClose={() => setSelectedLog(null)} 
      />
    </div>
  );
};
