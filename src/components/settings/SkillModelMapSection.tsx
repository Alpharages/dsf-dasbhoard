import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import { useSkillModelMap, useUpdateSkillModelMapEntry } from '@/hooks/queries/useSkillModelMap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RUNTIME_OPTIONS, SKILL_LABELS, type SkillModelMapEntry, type SkillModelRuntime } from '@/types/skillModelMap';

const SkillModelRow = ({ entry, readOnly }: { entry: SkillModelMapEntry; readOnly: boolean }) => {
  const [model, setModel] = useState(entry.model);
  const [runtime, setRuntime] = useState<SkillModelRuntime>(entry.runtime);
  const updateEntry = useUpdateSkillModelMapEntry();

  useEffect(() => {
    setModel(entry.model);
    setRuntime(entry.runtime);
  }, [entry.model, entry.runtime]);

  const isDirty = model !== entry.model || runtime !== entry.runtime;

  const handleSave = () => {
    const provider = RUNTIME_OPTIONS.find((option) => option.value === runtime)!.provider;
    updateEntry.mutate({ skill: entry.skill, entry: { model, provider, runtime } });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <label className="block text-sm font-semibold text-foreground">
          {SKILL_LABELS[entry.skill]}
        </label>
        {isDirty && !readOnly && (
          <button
            onClick={handleSave}
            disabled={updateEntry.isPending}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all"
          >
            <Save className="w-3 h-3" />
            {updateEntry.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <input
          value={model}
          onChange={(e) => setModel(e.target.value)}
          disabled={readOnly || updateEntry.isPending}
          placeholder="Model id, e.g. gpt-5.4 or opus"
          className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
        />
        <Select
          value={runtime}
          onValueChange={(value) => setRuntime(value as SkillModelRuntime)}
          disabled={readOnly || updateEntry.isPending}
        >
          <SelectTrigger className="bg-background border-input">
            <SelectValue placeholder="Runtime" />
          </SelectTrigger>
          <SelectContent>
            {RUNTIME_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export const SkillModelMapSection = () => {
  const { user } = useAuth();
  const canView = canAccess(user?.role || 'VIEWER', 'MANAGER');
  const canEdit = canAccess(user?.role || 'VIEWER', 'ADMIN');
  const { data: entries, isLoading, isError } = useSkillModelMap(canView);

  if (!canView) return null;

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-1">Skill → Model Mapping</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Global map of which model/runtime each skill runs with. Changes take effect on the next run — no redeploy.
        {!canEdit && ' (Admin role required to edit.)'}
      </p>

      {isError && (
        <div className="text-sm text-destructive">Failed to load the skill → model mapping.</div>
      )}
      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {entries && (
        <div className="space-y-4">
          {entries.map((entry) => (
            <SkillModelRow key={entry.skill} entry={entry} readOnly={!canEdit} />
          ))}
        </div>
      )}
    </div>
  );
};
