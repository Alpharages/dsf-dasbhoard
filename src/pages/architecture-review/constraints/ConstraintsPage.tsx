import { useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { ConstraintsList } from '../../../components/architecture-review/ConstraintsList';
import { ConstraintForm } from '../../../components/architecture-review/ConstraintForm';
import {
  useArchitectureConstraints,
  useCreateConstraint,
  useUpdateConstraint,
  useDeleteConstraint
} from '../../../hooks/api/useArchitectureConstraints';
import type { ArchitectureConstraint, CreateConstraintDto, UpdateConstraintDto } from '../../../types/architectureConstraint';

export function ConstraintsPage() {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editConstraint, setEditConstraint] = useState<ArchitectureConstraint | undefined>(undefined);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const { data: constraints = [], isLoading, refetch, error } = useArchitectureConstraints();
  const createMutation = useCreateConstraint();
  const updateMutation = useUpdateConstraint();
  const deleteMutation = useDeleteConstraint();

  const handleCreate = (data: CreateConstraintDto) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        setIsFormOpen(false);
      },
      // onError handled by mutation itself with toast
    });
  };

  const handleUpdate = (data: CreateConstraintDto) => {
    if (!editConstraint) return;
    updateMutation.mutate({
      id: editConstraint.id,
      data: data as UpdateConstraintDto
    }, {
      onSuccess: () => {
        setEditConstraint(undefined);
        setIsFormOpen(false);
      },
      // onError handled by mutation itself with toast
    });
  };

  const handleEdit = (constraint: ArchitectureConstraint) => {
    setEditConstraint(constraint);
    setIsFormOpen(true);
  };

  const handleDelete = (constraintId: string) => {
    setDeleteConfirmId(constraintId);
  };

  const confirmDelete = () => {
    if (deleteConfirmId) {
      deleteMutation.mutate(deleteConfirmId, {
        onSuccess: () => {
          setDeleteConfirmId(null);
        },
        // onError handled by mutation itself with toast
      });
    }
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditConstraint(undefined);
  };

  const deleteConstraint = constraints?.find(c => c.id === deleteConfirmId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight mb-2">
            Architecture Constraints
          </h1>
          <p className="text-muted-foreground font-medium">
            Define and manage architecture constraints for AI-driven development
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            className="p-3 bg-card border border-border text-muted-foreground hover:text-foreground rounded-lg transition-all">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 px-6 rounded-lg transition-all">
            <Plus className="w-5 h-5" />
            Add Constraint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-semibold mb-1">Total Constraints</p>
          <p className="text-3xl font-semibold text-foreground data-figure tabular-nums">{constraints.length}</p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-semibold mb-1">Global</p>
          <p className="text-3xl font-semibold text-primary data-figure tabular-nums">
            {constraints.filter(c => c.scope === 'GLOBAL').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-semibold mb-1">Project-Specific</p>
          <p className="text-3xl font-semibold text-violet-400 data-figure tabular-nums">
            {constraints.filter(c => c.scope === 'PROJECT').length}
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-muted-foreground text-sm font-semibold mb-1">Patterns</p>
          <p className="text-3xl font-semibold text-amber-400 data-figure tabular-nums">
            {constraints.filter(c => c.type === 'PATTERN').length}
          </p>
        </div>
      </div>

      {/* Mutual-Exclusion State Machine */}
      {isLoading ? (
        <div className="bg-card border border-border animate-pulse rounded-lg h-64 flex items-center justify-center">
          <p className="text-muted-foreground font-medium flex items-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            Loading constraints...
          </p>
        </div>
      ) : error ? (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-8 text-center">
          <p className="text-red-400 font-semibold mb-3 text-lg">Failed to load constraints</p>
          <p className="text-red-400/80 mb-6">{error instanceof Error ? error.message : "An unknown error occurred"}</p>
          <button onClick={() => refetch()} className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors">
            Try Again
          </button>
        </div>
      ) : constraints.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4 border border-border">
            <Plus className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No constraints defined</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Get started by creating your first architecture constraint to guide the AI-driven development process.
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-6 rounded-md transition-all">
            <Plus className="w-5 h-5" />
            Create Constraint
          </button>
        </div>
      ) : (
        <ConstraintsList
          constraints={constraints}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}

      <ConstraintForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editConstraint ? handleUpdate : handleCreate}
        editConstraint={editConstraint}
      />

      {deleteConfirmId && deleteConstraint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-foreground mb-4">Delete Constraint?</h3>
            <p className="text-muted-foreground mb-4">
              Are you sure? This will remove the constraint from all AI prompts.
            </p>
            <div className="bg-muted/50 border border-border rounded-lg p-3 mb-6">
              <p className="text-sm text-muted-foreground mb-1">Deleting:</p>
              <p className="text-foreground font-semibold">{deleteConstraint.scope} - {deleteConstraint.type}</p>
              <p className="text-muted-foreground text-sm mt-1">Version {deleteConstraint.version}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-muted-foreground font-semibold rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-destructive hover:bg-destructive/90 text-destructive-foreground font-semibold rounded-lg disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
