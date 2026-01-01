import { Edit2, Trash2 } from 'lucide-react';
import { ScopeBadge } from './ScopeBadge';
import { TypeBadge } from './TypeBadge';
import type {
  ArchitectureConstraint,
  TechConstraintRules,
  PatternConstraintRules,
  StandardConstraintRules
} from '../../types/architectureConstraint';

interface ConstraintsListProps {
  constraints: ArchitectureConstraint[];
  onEdit: (constraint: ArchitectureConstraint) => void;
  onDelete: (constraintId: string) => void;
}

function getRulesSummary(constraint: ArchitectureConstraint): string {
  if (constraint.type === 'ALLOWED_TECH' || constraint.type === 'FORBIDDEN_TECH') {
    const rules = constraint.rules as TechConstraintRules;
    const count = rules.items?.length || 0;
    return `${count} package${count !== 1 ? 's' : ''}`;
  } else if (constraint.type === 'PATTERN') {
    const rules = constraint.rules as PatternConstraintRules;
    return `Regex: ${rules.pattern}`;
  } else if (constraint.type === 'STANDARD') {
    const rules = constraint.rules as StandardConstraintRules;
    return rules.description.substring(0, 50) + (rules.description.length > 50 ? '...' : '');
  }
  return 'No rules';
}

export function ConstraintsList({ constraints, onEdit, onDelete }: ConstraintsListProps) {
  if (constraints.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl">
        <p className="text-slate-500 text-xl font-medium">
          No constraints defined. Add your first constraint.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
      <table className="w-full">
        <thead className="bg-slate-900/60 border-b border-slate-800">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-bold text-slate-300">Scope</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-slate-300">Type</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-slate-300">Rules Summary</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-slate-300">Version</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-slate-300">Updated</th>
            <th className="text-right px-6 py-4 text-sm font-bold text-slate-300">Actions</th>
          </tr>
        </thead>
        <tbody>
          {constraints.map((constraint) => (
            <tr key={constraint.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
              <td className="px-6 py-4">
                <ScopeBadge scope={constraint.scope} />
              </td>
              <td className="px-6 py-4">
                <TypeBadge type={constraint.type} />
              </td>
              <td className="px-6 py-4 text-slate-300 font-medium">
                {getRulesSummary(constraint)}
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs font-bold">
                  v{constraint.version}
                </span>
              </td>
              <td className="px-6 py-4 text-slate-400 text-sm">
                {new Date(constraint.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(constraint)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors group">
                    <Edit2 className="w-4 h-4 text-slate-400 group-hover:text-blue-400" />
                  </button>
                  <button
                    onClick={() => onDelete(constraint.id)}
                    className="p-2 hover:bg-slate-700 rounded-lg transition-colors group">
                    <Trash2 className="w-4 h-4 text-slate-400 group-hover:text-red-400" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
