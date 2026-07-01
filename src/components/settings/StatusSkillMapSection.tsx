import { useEffect, useState } from 'react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { canAccess } from '@/utils/roleHelpers';
import { useStatusSkillMap, useUpdateStatusSkillMap } from '@/hooks/queries/useStatusSkillMap';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SKILL_OPTIONS, type OpenHarnessSkill, type StatusSkillEntry } from '@/types/statusSkillMap';

export const StatusSkillMapSection = () => {
  const { user } = useAuth();
  const canView = canAccess(user?.role || 'VIEWER', 'MANAGER');
  const canEdit = canAccess(user?.role || 'VIEWER', 'ADMIN');
  const { data, isLoading, isError } = useStatusSkillMap(canView);
  const updateMap = useUpdateStatusSkillMap();

  const [draft, setDraft] = useState<StatusSkillEntry[]>([]);

  useEffect(() => {
    if (data?.entries) setDraft(data.entries);
  }, [data?.entries]);

  if (!canView) return null;

  const isDirty = JSON.stringify(draft) !== JSON.stringify(data?.entries ?? []);
  const hasBlankStatus = draft.some((e) => !e.status.trim());

  const updateRow = (index: number, patch: Partial<StatusSkillEntry>) =>
    setDraft((rows) => rows.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  const removeRow = (index: number) => setDraft((rows) => rows.filter((_, i) => i !== index));
  const addRow = () =>
    setDraft((rows) => [...rows, { status: '', skill: SKILL_OPTIONS[0].value }]);

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold text-foreground mb-1">Status → Skill Defaults</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Global default map of which ClickUp status triggers which skill, for projects with no per-project
        override. Changes take effect on the next run — no redeploy.
        {!canEdit && ' (Admin role required to edit.)'}
      </p>

      {isError && (
        <div className="text-sm text-destructive">Failed to load the status → skill map.</div>
      )}
      {isLoading && <div className="text-sm text-muted-foreground">Loading…</div>}

      {data && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="space-y-3">
            {draft.map((entry, index) => (
              <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-3 items-center">
                <input
                  value={entry.status}
                  onChange={(e) => updateRow(index, { status: e.target.value })}
                  disabled={!canEdit || updateMap.isPending}
                  placeholder="ClickUp status, e.g. approved"
                  className="w-full bg-background border border-input rounded-lg px-4 py-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary disabled:opacity-50"
                />
                <Select
                  value={entry.skill}
                  onValueChange={(value) => updateRow(index, { skill: value as OpenHarnessSkill })}
                  disabled={!canEdit || updateMap.isPending}
                >
                  <SelectTrigger className="bg-background border-input">
                    <SelectValue placeholder="Skill" />
                  </SelectTrigger>
                  <SelectContent>
                    {SKILL_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <button
                  onClick={() => removeRow(index)}
                  disabled={!canEdit || updateMap.isPending}
                  aria-label={`Remove ${entry.status || 'entry'}`}
                  className="p-2 text-muted-foreground hover:text-destructive disabled:opacity-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {draft.length === 0 && (
              <div className="text-sm text-muted-foreground">No entries.</div>
            )}
          </div>

          {canEdit && (
            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={addRow}
                disabled={updateMap.isPending}
                className="flex items-center gap-2 px-3 py-1.5 border border-input hover:border-primary text-foreground text-xs font-bold rounded-lg transition-all"
              >
                <Plus className="w-3 h-3" />
                Add Entry
              </button>
              {isDirty && (
                <button
                  onClick={() => updateMap.mutate(draft)}
                  disabled={updateMap.isPending || hasBlankStatus}
                  className="flex items-center gap-2 px-3 py-1.5 bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-bold rounded-lg transition-all disabled:opacity-50"
                >
                  <Save className="w-3 h-3" />
                  {updateMap.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Loop terminals (read-only): {data.loopTerminalStatuses.join(', ') || '—'} · max iterations:{' '}
            {data.loopMaxIterations}
          </p>
        </div>
      )}
    </div>
  );
};
