import { useEffect, useState } from 'react';
import { ArrowDown, Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import { useSkillModelMap, useUpdateSkillModelMapEntry } from '@/hooks/queries/useSkillModelMap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  MODEL_SUGGESTIONS,
  RUNTIME_OPTIONS,
  SKILL_LABELS,
  type SkillModelCandidate,
  type SkillModelMapEntry,
  type SkillModelRuntime,
} from '@/types/skillModelMap';

const providerFor = (runtime: SkillModelRuntime) =>
  RUNTIME_OPTIONS.find((option) => option.value === runtime)!.provider;

/**
 * The model + runtime pair. Identical for the primary and every fallback, because the backend
 * validates them with the same rule — a fallback that could be shaped differently here would
 * just be rejected on save.
 */
const CandidateFields = ({
  candidate,
  onChange,
  disabled,
  listId,
}: {
  candidate: SkillModelCandidate;
  onChange: (next: SkillModelCandidate) => void;
  disabled: boolean;
  listId: string;
}) => {
  // Switching runtime only pre-fills a sensible default — a claude alias like 'opus' is
  // meaningless on `oh`. The field stays editable either way.
  const handleRuntimeChange = (runtime: SkillModelRuntime) => {
    const model = MODEL_SUGGESTIONS[runtime].includes(candidate.model)
      ? candidate.model
      : MODEL_SUGGESTIONS[runtime][0];
    onChange({ model, runtime, provider: providerFor(runtime) });
  };

  return (
    <div className="grid grid-cols-2 gap-3 flex-1">
      <Input
        value={candidate.model}
        onChange={(event) => onChange({ ...candidate, model: event.target.value })}
        disabled={disabled}
        placeholder="Model"
        spellCheck={false}
        aria-label="Model"
        list={listId}
        className="h-9 rounded-md px-3 text-sm"
      />
      <Select
        value={candidate.runtime}
        onValueChange={(value) => handleRuntimeChange(value as SkillModelRuntime)}
        disabled={disabled}
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
      {/* Native datalist: suggestions without closing the field to a fixed list.
          Outside the grid cells so it can never occupy one. */}
      <datalist id={listId}>
        {MODEL_SUGGESTIONS[candidate.runtime].map((option) => (
          <option key={option} value={option} />
        ))}
      </datalist>
    </div>
  );
};

const SkillModelRow = ({ entry, readOnly }: { entry: SkillModelMapEntry; readOnly: boolean }) => {
  const [primary, setPrimary] = useState<SkillModelCandidate>(entry);
  const [fallbacks, setFallbacks] = useState<SkillModelCandidate[]>(entry.fallbacks);
  const updateEntry = useUpdateSkillModelMapEntry();

  useEffect(() => {
    setPrimary({ model: entry.model, provider: entry.provider, runtime: entry.runtime });
    setFallbacks(entry.fallbacks);
  }, [entry]);

  const trimmed = (candidate: SkillModelCandidate) => ({
    // Trim: a stray space survives the backend's non-empty check and then reaches the CLI as
    // part of the model id, where it fails at the provider instead of here.
    ...candidate,
    model: candidate.model.trim(),
  });
  const allFilled =
    primary.model.trim() !== '' && fallbacks.every((candidate) => candidate.model.trim() !== '');
  const dirty =
    JSON.stringify([trimmed(primary), ...fallbacks.map(trimmed)]) !==
    JSON.stringify([
      { model: entry.model, provider: entry.provider, runtime: entry.runtime },
      ...entry.fallbacks,
    ]);
  const canSave = allFilled && dirty;

  const handleSave = () => {
    updateEntry.mutate({
      skill: entry.skill,
      entry: { ...trimmed(primary), fallbacks: fallbacks.map(trimmed) },
    });
  };

  const addFallback = () =>
    // Seed with a runtime different from the primary's: a same-provider fallback cannot help
    // when the whole provider is what ran out.
    setFallbacks((current) => {
      const runtime: SkillModelRuntime = primary.runtime === 'claude' ? 'oh' : 'claude';
      return [
        ...current,
        { model: MODEL_SUGGESTIONS[runtime][0], runtime, provider: providerFor(runtime) },
      ];
    });

  const disabled = readOnly || updateEntry.isPending;

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

      <div className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-xs font-medium text-muted-foreground">Primary</span>
        <CandidateFields
          candidate={primary}
          onChange={setPrimary}
          disabled={disabled}
          listId={`${entry.skill}-primary-models`}
        />
        {/* Spacer matching the fallback rows' delete button, so both grids line up. */}
        <span className="w-9 shrink-0" aria-hidden="true" />
      </div>

      {fallbacks.map((candidate, index) => (
        <div key={index} className="flex items-center gap-2 mt-2">
          <span className="w-16 shrink-0 flex items-center gap-1 text-xs font-medium text-muted-foreground">
            <ArrowDown className="w-3 h-3" />
            {index + 1}
          </span>
          <CandidateFields
            candidate={candidate}
            onChange={(next) =>
              setFallbacks((current) =>
                current.map((existing, position) => (position === index ? next : existing)),
              )
            }
            disabled={disabled}
            listId={`${entry.skill}-fallback-${index}-models`}
          />
          <button
            onClick={() =>
              setFallbacks((current) => current.filter((_, position) => position !== index))
            }
            disabled={disabled}
            aria-label={`Remove fallback ${index + 1}`}
            className="w-9 h-9 shrink-0 flex items-center justify-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {!readOnly && (
        <button
          onClick={addFallback}
          disabled={disabled}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
        >
          <Plus className="w-3 h-3" />
          Add fallback
        </button>
      )}

      {fallbacks.length === 0 && (
        <p className="mt-3 text-xs text-muted-foreground">
          No fallback — if every {primary.model} account is rate-limited or cooling down, the run
          fails.
        </p>
      )}
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
        Which model each skill runs with, and what to fall back to when that model has no account
        available. Fallbacks are tried top-down. Changes take effect on the next run — no redeploy.
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
