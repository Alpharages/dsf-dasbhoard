import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAuditTimeline, getLowConfidenceAudits, searchAudits, requestRework } from '../api/audit.api';
import type { AuditSearchFilters } from '../api/audit.api';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';

export const useAuditTimeline = (ticketId: string) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';
  const { socket } = useSocket(token);

  useEffect(() => {
    if (!socket) return;
    
    const handleAuditCreated = (eventData: { ticketId?: string; confidence?: number }) => {
      // Invalidate if the event matches the ticketId, or always to be safe based on AC
      if (eventData?.ticketId === ticketId || !eventData?.ticketId) {
        queryClient.invalidateQueries({ queryKey: ['audit-timeline', ticketId] });
      }
    };

    socket.on('audit.created', handleAuditCreated);
    return () => {
      socket.off('audit.created', handleAuditCreated);
    };
  }, [socket, queryClient, ticketId]);

  return useQuery({
    queryKey: ['audit-timeline', ticketId],
    queryFn: () => getAuditTimeline(ticketId),
    enabled: !!ticketId,
  });
};

export const useLowConfidenceAudits = (minConfidence: number = 0.5, page: number = 1, limit: number = 50) => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';
  const { socket } = useSocket(token);

  useEffect(() => {
    if (!socket) return;
    
    const handleAuditCreated = (eventData: { ticketId?: string; confidence?: number }) => {
      // AC: Invalidate ['audit-low-confidence'] if incoming confidence breaches threshold.
      if (eventData?.confidence !== undefined && eventData.confidence < minConfidence) {
        queryClient.invalidateQueries({ queryKey: ['audit-low-confidence'] });
      } else if (!eventData || eventData.confidence === undefined) {
         queryClient.invalidateQueries({ queryKey: ['audit-low-confidence'] });
      }
    };

    socket.on('audit.created', handleAuditCreated);
    return () => {
      socket.off('audit.created', handleAuditCreated);
    };
  }, [socket, queryClient, minConfidence]);

  return useQuery({
    queryKey: ['audit-low-confidence', minConfidence, page, limit],
    queryFn: () => getLowConfidenceAudits(minConfidence, page, limit),
  });
};

export const useAuditSearch = (filters: AuditSearchFilters) => {
  return useQuery({
    queryKey: ['audit-search', filters],
    queryFn: () => searchAudits(filters),
  });
};

export const useRequestReworkMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ ticketId, reasoning }: { ticketId: string; reasoning: string }) => requestRework(ticketId, reasoning),
    onSuccess: (_, variables) => {
      toast.success('Rework requested successfully');
      // Invalidate relevant queries after rework request
      queryClient.invalidateQueries({ queryKey: ['audit-low-confidence'] });
      queryClient.invalidateQueries({ queryKey: ['audit-timeline', variables.ticketId] });
    },
    onError: () => {
      toast.error('Failed to request rework');
    }
  });
};
