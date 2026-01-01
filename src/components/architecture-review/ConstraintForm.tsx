import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { TechListInput } from './TechListInput';
import { PatternInput } from './PatternInput';
import { StandardInput } from './StandardInput';
import type {
  ArchitectureConstraint,
  CreateConstraintDto,
  TechConstraintRules,
  PatternConstraintRules,
  StandardConstraintRules
} from '../../types/architectureConstraint';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

interface ConstraintFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateConstraintDto) => void;
  editConstraint?: ArchitectureConstraint;
}

function useProjects() {
  const token = localStorage.getItem('token');
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      if (!token) return [];
      const response = await axios.get(`${API_BASE_URL}/pm-dashboard/projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data || [];
    },
    staleTime: 300000, // 5 min cache
  });
}

export function ConstraintForm({
  isOpen,
  onClose,
  onSubmit,
  editConstraint
}: ConstraintFormProps) {
  const { data: projects = [], isLoading: isLoadingProjects } = useProjects();
  const [scope, setScope] = useState<'GLOBAL' | 'PROJECT'>('GLOBAL');
  const [projectId, setProjectId] = useState<string>('');
  const [type, setType] = useState<'ALLOWED_TECH' | 'FORBIDDEN_TECH' | 'PATTERN' | 'STANDARD'>('ALLOWED_TECH');

  // Tech constraint state
  const [techItems, setTechItems] = useState<string[]>([]);
  const [techReason, setTechReason] = useState<string>('');

  // Pattern constraint state
  const [pattern, setPattern] = useState<string>('');
  const [fileGlob, setFileGlob] = useState<string>('');
  const [patternDescription, setPatternDescription] = useState<string>('');

  // Standard constraint state
  const [standardDescription, setStandardDescription] = useState<string>('');
  const [standardUrl, setStandardUrl] = useState<string>('');

  // Initialize form for edit mode
  useEffect(() => {
    if (editConstraint) {
      setScope(editConstraint.scope);
      setProjectId(editConstraint.projectId || '');
      setType(editConstraint.type);

      if (editConstraint.type === 'ALLOWED_TECH' || editConstraint.type === 'FORBIDDEN_TECH') {
        const rules = editConstraint.rules as TechConstraintRules;
        setTechItems(rules.items || []);
        setTechReason(rules.reason || '');
      } else if (editConstraint.type === 'PATTERN') {
        const rules = editConstraint.rules as PatternConstraintRules;
        setPattern(rules.pattern || '');
        setFileGlob(rules.fileGlob || '');
        setPatternDescription(rules.description || '');
      } else if (editConstraint.type === 'STANDARD') {
        const rules = editConstraint.rules as StandardConstraintRules;
        setStandardDescription(rules.description || '');
        setStandardUrl(rules.url || '');
      }
    }
  }, [editConstraint]);

  const resetForm = () => {
    setScope('GLOBAL');
    setProjectId('');
    setType('ALLOWED_TECH');
    setTechItems([]);
    setTechReason('');
    setPattern('');
    setFileGlob('');
    setPatternDescription('');
    setStandardDescription('');
    setStandardUrl('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let rules: any;

    if (type === 'ALLOWED_TECH' || type === 'FORBIDDEN_TECH') {
      rules = {
        items: techItems,
        reason: techReason || undefined
      };
    } else if (type === 'PATTERN') {
      rules = {
        pattern,
        fileGlob,
        description: patternDescription || undefined
      };
    } else if (type === 'STANDARD') {
      rules = {
        description: standardDescription,
        url: standardUrl || undefined
      };
    }

    const data: CreateConstraintDto = {
      scope,
      type,
      rules,
      projectId: scope === 'PROJECT' ? projectId : undefined
    };

    onSubmit(data);
    handleClose();
  };

  const isFormValid = () => {
    if (scope === 'PROJECT' && !projectId) return false;

    if (type === 'ALLOWED_TECH' || type === 'FORBIDDEN_TECH') {
      return techItems.length > 0;
    } else if (type === 'PATTERN') {
      if (!pattern || !fileGlob) return false;
      try {
        new RegExp(pattern);
        return true;
      } catch {
        return false;
      }
    } else if (type === 'STANDARD') {
      return standardDescription.trim().length > 0;
    }

    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-slate-700">
          <h2 className="text-2xl font-bold text-white">
            {editConstraint ? 'Edit Constraint' : 'Add Constraint'}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Scope *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="GLOBAL"
                  checked={scope === 'GLOBAL'}
                  onChange={(e) => setScope(e.target.value as 'GLOBAL' | 'PROJECT')}
                  disabled={!!editConstraint}
                  className="w-4 h-4">
                </input>
                <span className="text-slate-200">🌍 Global</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value="PROJECT"
                  checked={scope === 'PROJECT'}
                  onChange={(e) => setScope(e.target.value as 'GLOBAL' | 'PROJECT')}
                  disabled={!!editConstraint}
                  className="w-4 h-4">
                </input>
                <span className="text-slate-200">📁 Project</span>
              </label>
            </div>
            {editConstraint && (
              <p className="text-xs text-slate-500">
                Scope cannot be changed when editing
              </p>
            )}
          </div>

          {scope === 'PROJECT' && (
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-300">Project *</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!!editConstraint || isLoadingProjects}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">{isLoadingProjects ? 'Loading projects...' : 'Select a project...'}</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Type *</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              disabled={!!editConstraint}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="ALLOWED_TECH">✅ Allowed Tech</option>
              <option value="FORBIDDEN_TECH">❌ Forbidden Tech</option>
              <option value="PATTERN">📐 Pattern</option>
              <option value="STANDARD">📋 Standard</option>
            </select>
            {editConstraint && (
              <p className="text-xs text-slate-500">
                Type cannot be changed when editing
              </p>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-300">Rules *</label>

            {(type === 'ALLOWED_TECH' || type === 'FORBIDDEN_TECH') && (
              <div className="space-y-4">
                <TechListInput
                  value={techItems}
                  onChange={setTechItems}
                  placeholder="Type package name and press Enter...">
                </TechListInput>
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-400">
                    Reason (Optional)
                  </label>
                  <input
                    type="text"
                    value={techReason}
                    onChange={(e) => setTechReason(e.target.value)}
                    placeholder="Why these technologies?"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500">
                  </input>
                </div>
              </div>
            )}

            {type === 'PATTERN' && (
              <PatternInput
                pattern={pattern}
                fileGlob={fileGlob}
                description={patternDescription}
                onPatternChange={setPattern}
                onFileGlobChange={setFileGlob}
                onDescriptionChange={setPatternDescription}>
              </PatternInput>
            )}

            {type === 'STANDARD' && (
              <StandardInput
                description={standardDescription}
                url={standardUrl}
                onDescriptionChange={setStandardDescription}
                onUrlChange={setStandardUrl}>
              </StandardInput>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg transition-colors">
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid()}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
              {editConstraint ? 'Update' : 'Create'} Constraint
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
