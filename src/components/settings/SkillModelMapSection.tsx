import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import { useSkillModelMap, useUpdateSkillModelMapEntry } from '@/hooks/queries/useSkillModelMap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MODEL_SUGGESTIONS, RUNTIME_OPTIONS, SKILL_LABELS, type SkillModelMapEntry, type SkillModelRuntime } from '@/types/skillModelMap';

const SkillModelRow = ({ entry, readOnly }: { entry: SkillModelMapEntry; readOnly: boolean }) => {
  const [model, setModel] = useState(entry.model);
  const [runtime, setRuntime] = useState<SkillModelRuntime>(entry.runtime);
  const updateEntry = useUpdateSkillModelMapEntry();

  useEffect(() => {
    setModel(entry.model);
    setRuntime(entry.runtime);
  }, [entry.model, entry.runtime]);

  const canSave = model.trim() !== '' && (model !== entry.model || runtime !== entry.runtime);

  // Switching runtime only pre-fills a sensible default — a claude alias like 'opus' is
  // meaningless on `oh`. The field stays editable either way.
  const handleRuntimeChange = (value: SkillModelRuntime) => {
    setRuntime(value);
    if (!MODEL_SUGGESTIONS[value].includes(model)) setModel(MODEL_SUGGESTIONS[value][0]);
  };

  const handleSave = () => {
    const provider = RUNTIME_OPTIONS.find((option) => option.value === runtime)!.provider;
    // Trim: a stray space survives the backend's non-empty check and then reaches the CLI as
    // part of the model id, where it fails at the provider instead of here.
    updateEntry.mutate({ skill: entry.skill, entry: { model: model.trim(), provider, runtime } });
  };

  return (
    <div className="bg-card border border-border rounded-xl p-5 hover:border-border/80 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <label className="block text-sm font-semibold text-foreground">
          {SKILL_LABELS[entry.skill]}
        </label>
        {canSave && !readOnly && (
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
        <Input
          value={model}
          onChange={(event) => setModel(event.target.value)}
          disabled={readOnly || updateEntry.isPending}
          placeholder="Model"
          spellCheck={false}
          aria-label="Model"
          list={`${entry.skill}-models`}
          className="h-9 rounded-md px-3 text-sm"
        />
        <Select
          value={runtime}
          onValueChange={(value) => handleRuntimeChange(value as SkillModelRuntime)}
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

      {/* Native datalist: suggestions without closing the field to a fixed list.
          Outside the grid so it can never occupy a cell. */}
      <datalist id={`${entry.skill}-models`}>
        {MODEL_SUGGESTIONS[runtime].map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
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
