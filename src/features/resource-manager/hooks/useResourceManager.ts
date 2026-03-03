import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { toast } from 'react-hot-toast';
import {
  getActiveLocks,
  getDependencyGraph,
  detectCircularDependencies,
  forceUnlock,
  reprioritizeTicket,
} from '../api/resource-manager.api';
import type { ForceUnlockRequest, ReprioritizeRequest } from '../types';

// Query keys for cache invalidation
export const resourceManagerKeys = {
  activeLocks: ['active-locks'],
  dependencyGraph: ['dependency-graph'],
  circularDependencies: ['circular-dependencies'],
};

export const useActiveLocks = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';
  const { socket } = useSocket(token, '/dashboard');

  // Listen for real-time lock events via socket
  useEffect(() => {
    if (!socket) return;

    const handleLockAcquired = () => {
      // Invalidate active locks query when a new lock is acquired
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.activeLocks });
    };

    const handleLockReleased = () => {
      // Invalidate active locks query when a lock is released
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.activeLocks });
    };

    socket.on('lock.acquired', handleLockAcquired);
    socket.on('lock.released', handleLockReleased);

    return () => {
      socket.off('lock.acquired', handleLockAcquired);
      socket.off('lock.released', handleLockReleased);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: resourceManagerKeys.activeLocks,
    queryFn: getActiveLocks,
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Fallback polling every 60 seconds
  });
};

export const useDependencyGraph = () => {
  const queryClient = useQueryClient();
  const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token') || '';
  const { socket } = useSocket(token, '/dashboard');

  // Listen for dependency changes via socket
  useEffect(() => {
    if (!socket) return;

    const handleDependencyChanged = () => {
      // Invalidate dependency graph when dependencies change
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.dependencyGraph });
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.circularDependencies });
    };

    socket.on('dependency.changed', handleDependencyChanged);

    return () => {
      socket.off('dependency.changed', handleDependencyChanged);
    };
  }, [socket, queryClient]);

  return useQuery({
    queryKey: resourceManagerKeys.dependencyGraph,
    queryFn: getDependencyGraph,
    staleTime: 30000,
  });
};

export const useCircularDependencies = () => {
  return useQuery({
    queryKey: resourceManagerKeys.circularDependencies,
    queryFn: detectCircularDependencies,
    staleTime: 30000,
  });
};

export const useForceUnlockMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ForceUnlockRequest) => forceUnlock(request),
    onSuccess: () => {
      toast.success('Lock forcefully released');
      // Invalidate both queries to refresh UI immediately
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.activeLocks });
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.dependencyGraph });
    },
    onError: (error) => {
      toast.error(`Failed to unlock: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
};

export const useReprioritizeMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: ReprioritizeRequest) => reprioritizeTicket(request),
    onSuccess: (data) => {
      toast.success(`Ticket reprioritized from ${data.oldPriority} to ${data.newPriority}`);
      // Invalidate dependency graph to reflect new priorities
      queryClient.invalidateQueries({ queryKey: resourceManagerKeys.dependencyGraph });
    },
    onError: (error) => {
      toast.error(`Failed to reprioritize: ${error instanceof Error ? error.message : 'Unknown error'}`);
    },
  });
};
