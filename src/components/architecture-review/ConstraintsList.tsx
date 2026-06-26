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
      <div className="text-center py-20 bg-card/20 border border-dashed border-border rounded-lg">
        <p className="text-muted-foreground text-xl font-medium">
          No constraints defined. Add your first constraint.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card/40 border border-border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-card/60 border-b border-border">
          <tr>
            <th className="text-left px-6 py-4 text-sm font-bold text-foreground">Scope</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-foreground">Type</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-foreground">Rules Summary</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-foreground">Version</th>
            <th className="text-left px-6 py-4 text-sm font-bold text-foreground">Updated</th>
            <th className="text-right px-6 py-4 text-sm font-bold text-foreground">Actions</th>
          </tr>
        </thead>
        <tbody>
          {constraints.map((constraint) => (
            <tr key={constraint.id} className="border-b border-border hover:bg-muted/50 transition-colors">
              <td className="px-6 py-4">
                <ScopeBadge scope={constraint.scope} />
              </td>
              <td className="px-6 py-4">
                <TypeBadge type={constraint.type} />
              </td>
              <td className="px-6 py-4 text-foreground font-medium">
                {getRulesSummary(constraint)}
              </td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-bold">
                  v{constraint.version}
                </span>
              </td>
              <td className="px-6 py-4 text-muted-foreground text-sm">
                {new Date(constraint.updatedAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <button
                    onClick={() => onEdit(constraint)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors group">
                    <Edit2 className="w-4 h-4 text-muted-foreground group-hover:text-blue-400" />
                  </button>
                  <button
                    onClick={() => onDelete(constraint.id)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors group">
                    <Trash2 className="w-4 h-4 text-muted-foreground group-hover:text-red-400" />
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
