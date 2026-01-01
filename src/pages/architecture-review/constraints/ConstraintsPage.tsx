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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-extrabold text-white tracking-tight leading-none mb-2">
            Architecture Constraints
          </h1>
          <p className="text-slate-500 font-medium">
            Define and manage architecture constraints for AI-driven development
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => refetch()}
            className="p-3 bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-2xl transition-all">
            <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setIsFormOpen(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-2xl shadow-lg shadow-blue-500/20 transition-all hover:translate-y-[-2px] active:translate-y-0">
            <Plus className="w-5 h-5" />
            Add Constraint
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-500 text-sm font-semibold mb-1">Total Constraints</p>
          <p className="text-3xl font-bold text-white">{constraints.length}</p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-500 text-sm font-semibold mb-1">Global</p>
          <p className="text-3xl font-bold text-blue-400">
            {constraints.filter(c => c.scope === 'GLOBAL').length}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-500 text-sm font-semibold mb-1">Project-Specific</p>
          <p className="text-3xl font-bold text-purple-400">
            {constraints.filter(c => c.scope === 'PROJECT').length}
          </p>
        </div>
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <p className="text-slate-500 text-sm font-semibold mb-1">Patterns</p>
          <p className="text-3xl font-bold text-orange-400">
            {constraints.filter(c => c.type === 'PATTERN').length}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-slate-900/50 border border-slate-800 animate-pulse rounded-2xl h-64"></div>
      ) : (
        <ConstraintsList
          constraints={constraints}
          onEdit={handleEdit}
          onDelete={handleDelete}>
        </ConstraintsList>
      )}

      <ConstraintForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editConstraint ? handleUpdate : handleCreate}
        editConstraint={editConstraint}>
      </ConstraintForm>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-4 mb-6">
          <p className="text-red-400 font-semibold">Failed to load constraints. Please try again.</p>
        </div>
      )}

      {deleteConfirmId && deleteConstraint && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">Delete Constraint?</h3>
            <p className="text-slate-400 mb-4">
              Are you sure? This will remove the constraint from all AI prompts.
            </p>
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-3 mb-6">
              <p className="text-sm text-slate-500 mb-1">Deleting:</p>
              <p className="text-white font-semibold">{deleteConstraint.scope} - {deleteConstraint.type}</p>
              <p className="text-slate-400 text-sm mt-1">Version {deleteConstraint.version}</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors">
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg disabled:opacity-50 transition-colors">
                {deleteMutation.isPending ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
