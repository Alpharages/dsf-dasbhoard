import { useMemo, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, GitBranch, RefreshCw } from 'lucide-react';
import { useDependencyGraph, useCircularDependencies } from '../hooks/useResourceManager';
import type { DependencyNode, DependencyEdge, CircularDependency } from '../types';

const nodeWidth = 180;
const nodeHeight = 60;

interface FlowNode extends Node {
  data: {
    label: string;
    type: 'ticket' | 'file';
    status?: string;
    isInCircularDep?: boolean;
  };
}

interface FlowEdge extends Edge {
  data?: {
    isInCircularDep?: boolean;
  };
}

const getLayoutedElements = (
  nodes: FlowNode[],
  edges: FlowEdge[],
  direction: 'TB' | 'LR' = 'TB'
) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({ rankdir: direction, ranksep: 80, nodesep: 40 });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

const nodeTypes = {
  ticket: ({ data }: { data: FlowNode['data'] }) => (
    <div
      className={`px-4 py-2 rounded-md border-2 shadow-sm ${
        data.isInCircularDep
          ? 'border-red-500 bg-red-50'
          : 'border-blue-500 bg-blue-50'
      }`}
    >
      <div className="text-xs font-medium text-muted-foreground">Ticket</div>
      <div className="text-sm font-semibold truncate max-w-[140px]">{data.label}</div>
    </div>
  ),
  file: ({ data }: { data: FlowNode['data'] }) => (
    <div
      className={`px-4 py-2 rounded-md border-2 shadow-sm ${
        data.isInCircularDep
          ? 'border-red-500 bg-red-50'
          : 'border-green-500 bg-green-50'
      }`}
    >
      <div className="text-xs font-medium text-muted-foreground">File</div>
      <div className="text-sm font-mono truncate max-w-[140px]">{data.label}</div>
    </div>
  ),
};

export function DependencyGraphVisualization() {
  const { data: graph, isLoading: graphLoading, error: graphError } = useDependencyGraph();
  const { data: circularDeps, isLoading: circularLoading } = useCircularDependencies();
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');

  // Identify nodes and edges in circular dependencies
  const circularNodeIds = useMemo(() => {
    const ids = new Set<string>();
    circularDeps?.forEach((cd: CircularDependency) => {
      cd.nodes.forEach((id) => ids.add(id));
    });
    return ids;
  }, [circularDeps]);

  const circularEdgeIds = useMemo(() => {
    const ids = new Set<string>();
    circularDeps?.forEach((cd: CircularDependency) => {
      cd.edges.forEach((id) => ids.add(id));
    });
    return ids;
  }, [circularDeps]);

  // Transform graph data to React Flow format
  const initialElements = useMemo(() => {
    if (!graph) return { nodes: [], edges: [] };

    const nodes: FlowNode[] = graph.nodes.map((node: DependencyNode) => ({
      id: node.id,
      type: node.type,
      position: { x: 0, y: 0 },
      data: {
        label: node.label,
        type: node.type,
        status: node.data.status,
        isInCircularDep: circularNodeIds.has(node.id),
      },
    }));

    const edges: FlowEdge[] = graph.edges.map((edge: DependencyEdge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'smoothstep',
      animated: circularEdgeIds.has(edge.id),
      style: {
        stroke: circularEdgeIds.has(edge.id) ? '#ef4444' : '#6366f1',
        strokeWidth: circularEdgeIds.has(edge.id) ? 3 : 2,
      },
      label: edge.type === 'depends_on' ? 'depends on' : 'reserved by',
      labelStyle: { fill: circularEdgeIds.has(edge.id) ? '#ef4444' : '#6366f1' },
      markerEnd: {
        type: 'arrowclosed' as const,
        color: circularEdgeIds.has(edge.id) ? '#ef4444' : '#6366f1',
      },
    }));

    return getLayoutedElements(nodes, edges, layoutDirection);
  }, [graph, circularNodeIds, circularEdgeIds, layoutDirection]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialElements.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialElements.edges);

  // Update layout when direction changes
  const handleLayoutChange = useCallback(() => {
    const newDirection = layoutDirection === 'TB' ? 'LR' : 'TB';
    setLayoutDirection(newDirection);
    const { nodes: newNodes, edges: newEdges } = getLayoutedElements(
      nodes as FlowNode[],
      edges as FlowEdge[],
      newDirection
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [layoutDirection, nodes, edges, setNodes, setEdges]);

  // Sync with initial elements when data changes
  useEffect(() => {
    setNodes(initialElements.nodes);
    setEdges(initialElements.edges);
  }, [initialElements, setNodes, setEdges]);

  const isLoading = graphLoading || circularLoading;
  const error = graphError;

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Error Loading Dependency Graph
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-[600px]">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <GitBranch className="h-5 w-5" />
              Dependency Graph
            </CardTitle>
            <CardDescription>
              {isLoading ? (
                'Loading...'
              ) : (
                <>
                  {graph?.nodes.length || 0} nodes, {graph?.edges.length || 0} edges
                  {circularDeps && circularDeps.length > 0 && (
                    <Badge variant="destructive" className="ml-2">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {circularDeps.length} circular {circularDeps.length === 1 ? 'dependency' : 'dependencies'}
                    </Badge>
                  )}
                </>
              )}
            </CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleLayoutChange}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            {layoutDirection === 'TB' ? 'Horizontal' : 'Vertical'} Layout
          </Button>
        </div>
      </CardHeader>
      <CardContent className="h-[500px]">
        {isLoading ? (
          <div className="w-full h-full flex items-center justify-center">
            <Skeleton className="w-full h-full" />
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="bottom-right"
          >
            <Background />
            <Controls />
            <MiniMap
              nodeStrokeWidth={3}
              zoomable
              pannable
            />
            <Panel position="top-right" className="bg-white/90 p-2 rounded-md shadow-sm border">
              <div className="text-xs space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-50 border-2 border-blue-500 rounded" />
                  <span>Ticket</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-50 border-2 border-green-500 rounded" />
                  <span>File</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-50 border-2 border-red-500 rounded" />
                  <span>Circular Dep</span>
                </div>
              </div>
            </Panel>
          </ReactFlow>
        )}
      </CardContent>
    </Card>
  );
}
