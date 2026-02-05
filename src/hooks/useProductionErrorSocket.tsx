/**
 * Production Error Socket Hook
 * Story 9-U-5: Production Error Dashboard - AC#4
 *
 * Socket.IO hook for real-time error notifications.
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useQueryClient } from '@tanstack/react-query';
import { productionErrorKeys } from './useProductionErrors';
import type { ErrorSeverity } from '@/api/production-errors';

export interface ErrorCreatedEvent {
  id: string;
  application: string;
  error_type: string;
  severity: ErrorSeverity;
  occurred_at: string;
  message: string;
}

export interface ErrorAcknowledgedEvent {
  id: string;
  acknowledged_by: string;
  acknowledged_at: string;
}

export interface ErrorTicketCreatedEvent {
  id: string;
  ticket_url: string;
  created_at: string;
}

/**
 * Hook to subscribe to production error real-time events
 * 
 * @param token - Authentication token
 * @param onErrorCreated - Callback when a new error is created
 * @param onErrorAcknowledged - Callback when an error is acknowledged
 * @param onTicketCreated - Callback when a ticket is created
 */
export function useProductionErrorSocket(
  token: string | null,
  onErrorCreated?: (error: ErrorCreatedEvent) => void,
  onErrorAcknowledged?: (event: ErrorAcknowledgedEvent) => void,
  onTicketCreated?: (event: ErrorTicketCreatedEvent) => void
) {
  const socketRef = useRef<Socket | null>(null);
  const queryClient = useQueryClient();
  const [isConnected, setIsConnected] = useState(false);

  // Default error created handler with toast notification
  const handleErrorCreated = useCallback((error: ErrorCreatedEvent) => {
    // Show toast notification for CRITICAL and HIGH severity
    if (error.severity === 'CRITICAL' || error.severity === 'HIGH') {
      toast(
        () => (
          <div className="flex flex-col gap-1">
            <div className="font-semibold text-red-400">
              [{error.severity}] {error.application}
            </div>
            <div className="text-sm text-slate-300 truncate max-w-[300px]">
              {error.error_type}: {error.message}
            </div>
          </div>
        ),
        {
          duration: 8000,
          icon: '⚠️',
          style: {
            background: '#0f172a',
            border: error.severity === 'CRITICAL' ? '1px solid #ef4444' : '1px solid #f97316',
            borderRadius: '12px',
            padding: '16px',
          },
        }
      );
    }

    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: productionErrorKeys.overview() });
    queryClient.invalidateQueries({ queryKey: productionErrorKeys.health() });
    queryClient.invalidateQueries({ queryKey: productionErrorKeys.list({}) });

    // Call custom handler if provided
    onErrorCreated?.(error);
  }, [queryClient, onErrorCreated]);

  // Handle error acknowledged event
  const handleErrorAcknowledged = useCallback((event: ErrorAcknowledgedEvent) => {
    // Invalidate the specific error detail
    queryClient.invalidateQueries({ queryKey: productionErrorKeys.detail(event.id) });
    queryClient.invalidateQueries({ queryKey: productionErrorKeys.list({}) });

    onErrorAcknowledged?.(event);
  }, [queryClient, onErrorAcknowledged]);

  // Handle ticket created event
  const handleTicketCreated = useCallback((event: ErrorTicketCreatedEvent) => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: productionErrorKeys.all });

    onTicketCreated?.(event);
  }, [queryClient, onTicketCreated]);

  useEffect(() => {
    if (!token) return;

    const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';
    
    const socket = io(WS_URL, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to production events socket');
      setIsConnected(true);
      // Join the production_events room
      socket.emit('join', 'production_events');
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from production events socket');
      setIsConnected(false);
    });

    // Listen for error events
    socket.on('error.created', handleErrorCreated);
    socket.on('error.acknowledged', handleErrorAcknowledged);
    socket.on('error.ticket_created', handleTicketCreated);

    socketRef.current = socket;

    return () => {
      setIsConnected(false);
      socket.disconnect();
    };
  }, [token, handleErrorCreated, handleErrorAcknowledged, handleTicketCreated]);

  return {
    isConnected,
  };
}
