import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ActiveLockManager } from './ActiveLockManager';
import { DependencyGraphVisualization } from './DependencyGraph';
import { ResourceConflictPanel } from './ResourceConflictPanel';
import type { FileLock } from '../types';

export function ResourceManagerPage() {
  const [selectedLock, setSelectedLock] = useState<FileLock | null>(null);

  const handleForceUnlock = (lock: FileLock) => {
    setSelectedLock(lock);
  };

  const handleClearSelection = () => {
    setSelectedLock(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Resource Manager</h1>
          <p className="text-muted-foreground mt-1">
            Monitor active file locks, visualize dependencies, and resolve resource conflicts
          </p>
        </div>
      </div>

      <Tabs defaultValue="locks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="locks">Active Locks</TabsTrigger>
          <TabsTrigger value="dependencies">Dependency Graph</TabsTrigger>
        </TabsList>

        <TabsContent value="locks" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ActiveLockManager onForceUnlock={handleForceUnlock} />
            </div>
            <div className="lg:col-span-1">
              <ResourceConflictPanel
                selectedLock={selectedLock}
                onClearSelection={handleClearSelection}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="dependencies" className="space-y-6">
          <DependencyGraphVisualization />
        </TabsContent>
      </Tabs>
    </div>
  );
}
