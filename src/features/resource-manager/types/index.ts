export interface FileLock {
  id: string;
  filePath: string;
  ticketId: string;
  ticketName?: string;
  executionId: string;
  lockedAt: string;
  lockAgeMinutes: number;
  agentId?: string;
  agentName?: string;
  isStale: boolean;
}

export interface LockEvent {
  type: 'lock.acquired' | 'lock.released';
  lock: FileLock;
  timestamp: string;
}

export interface DependencyNode {
  id: string;
  type: 'ticket' | 'file';
  label: string;
  data: {
    ticketId?: string;
    filePath?: string;
    status?: string;
    priority?: number;
  };
}

export interface DependencyEdge {
  id: string;
  source: string;
  target: string;
  type: 'depends_on' | 'reserved_by';
  label?: string;
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface CircularDependency {
  nodes: string[];
  edges: string[];
}

export interface ForceUnlockRequest {
  lockId: string;
  reason: string;
}

export interface ReprioritizeRequest {
  ticketId: string;
  newPriority: number;
  reason: string;
}

export interface ReprioritizeResponse {
  success: boolean;
  ticketId: string;
  oldPriority: number;
  newPriority: number;
}
