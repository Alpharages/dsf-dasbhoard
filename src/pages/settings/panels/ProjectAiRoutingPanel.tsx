import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Cpu, Save, Loader2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'react-hot-toast';
import {
  useProjectAiRoutingConfig,
  useEffectiveProjectAiRoutingConfig,
  useUpdateProjectAiRoutingConfig,
  useResetProjectAiRoutingConfig,
} from '@/hooks/queries/useAiRoutingConfig';
import { ProviderSelect } from '@/components/settings/ProviderSelect';
import type { AIProvider } from '@/api/aiRoutingConfigApi';

export function ProjectAiRoutingPanel() {
  const { id: projectId } = useParams<{ id: string }>();

  const { data: projectConfig, isLoading: isProjectLoading, isError: isProjectError } = useProjectAiRoutingConfig(projectId || '');
  const { data: effectiveConfig, isLoading: isEffectiveLoading, isError: isEffectiveError } = useEffectiveProjectAiRoutingConfig(projectId || '');

  const updateMutation = useUpdateProjectAiRoutingConfig(projectId || '');
  const resetMutation = useResetProjectAiRoutingConfig(projectId || '');

  const [form, setForm] = useState({
    primaryProviderOverride: null as AIProvider | null,
    complexityThresholdMedium: null as number | null,
    complexityThresholdHigh: null as number | null,
    tierLowProvider: null as AIProvider | null,
    tierLowFallback: null as AIProvider | null,
    tierMediumProvider: null as AIProvider | null,
    tierMediumFallback: null as AIProvider | null,
    tierHighProvider: null as AIProvider | null,
    tierHighFallback: null as AIProvider | null,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (projectConfig) {
      setForm({
        primaryProviderOverride: projectConfig.primaryProviderOverride ?? null,
        complexityThresholdMedium: projectConfig.complexityThresholdMedium ?? null,
        complexityThresholdHigh: projectConfig.complexityThresholdHigh ?? null,
        tierLowProvider: projectConfig.tierLowProvider ?? null,
        tierLowFallback: projectConfig.tierLowFallback ?? null,
        tierMediumProvider: projectConfig.tierMediumProvider ?? null,
        tierMediumFallback: projectConfig.tierMediumFallback ?? null,
        tierHighProvider: projectConfig.tierHighProvider ?? null,
        tierHighFallback: projectConfig.tierHighFallback ?? null,
      });
    }
  }, [projectConfig]);

  if (!projectId) {
    return <div className="p-6 text-sm text-destructive">Project ID is required.</div>;
  }

  const hasChanges =
    projectConfig &&
    (form.primaryProviderOverride !== (projectConfig.primaryProviderOverride ?? null) ||
      form.complexityThresholdMedium !== (projectConfig.complexityThresholdMedium ?? null) ||
      form.complexityThresholdHigh !== (projectConfig.complexityThresholdHigh ?? null) ||
      form.tierLowProvider !== (projectConfig.tierLowProvider ?? null) ||
      form.tierLowFallback !== (projectConfig.tierLowFallback ?? null) ||
      form.tierMediumProvider !== (projectConfig.tierMediumProvider ?? null) ||
      form.tierMediumFallback !== (projectConfig.tierMediumFallback ?? null) ||
      form.tierHighProvider !== (projectConfig.tierHighProvider ?? null) ||
      form.tierHighFallback !== (projectConfig.tierHighFallback ?? null));

  const validate = () => {
    // Both thresholds are inherited — global config is the source of truth, skip validation
    if (form.complexityThresholdMedium === null && form.complexityThresholdHigh === null) return null;

    const medium = form.complexityThresholdMedium ?? effectiveConfig?.complexityThresholdMedium ?? 0;
    const high = form.complexityThresholdHigh ?? effectiveConfig?.complexityThresholdHigh ?? 0;

    if (high <= medium) {
      return 'High threshold must be greater than Medium threshold';
    }
    if (medium < 1 || medium > 20 || high < 1 || high > 20) {
      return 'Thresholds must be between 1 and 20';
    }
    return null;
  };

  const handleSave = () => {
    const error = validate();
    if (error) {
      setValidationError(error);
      return;
    }
    setValidationError(null);

    updateMutation.mutate(form, {
      onSuccess: () => {
        toast.success('Project AI routing overrides saved');
      },
      onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
        toast.error(err?.response?.data?.message || err.message || 'Failed to save configuration');
      },
    });
  };

  const handleReset = async () => {
    if (!window.confirm('Reset all AI routing overrides for this project? It will revert to global defaults.')) return;
    resetMutation.mutate(undefined, {
      onSuccess: () => {
        toast.success('Project AI routing reset to global defaults');
      },
      onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
        toast.error(err?.response?.data?.message || err.message || 'Failed to reset configuration');
      },
    });
  };

  const providerLabel = (p?: AIProvider | null) => {
    if (!p) return 'None';
    const labels: Record<AIProvider, string> = {
      CLAUDE_CODE: 'Claude Code',
      GEMINI: 'Gemini',
      CODEX: 'Codex',
      KIMI: 'Kimi',
    };
    return labels[p] || p;
  };

  const OverrideIndicator = ({ active }: { active: boolean }) => (
    active ? (
      <Badge variant="secondary" className="px-1.5 py-0 text-[9px] h-4 bg-primary/20 text-primary border-primary/30">
        OVERRIDE
      </Badge>
    ) : null
  );

  if (isProjectError || isEffectiveError) {
    return (
      <div className="p-6 text-sm text-destructive">Failed to load AI routing configuration.</div>
    );
  }

  const isLoading = isProjectLoading || isEffectiveLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-64" />
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader><Skeleton className="h-6 w-48" /></CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-sky-500/10 rounded-xl text-sky-500">
          <Cpu className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">AI Routing — Project Override</h1>
          <p className="text-muted-foreground text-sm">Override platform-wide routing settings for this project. Leave fields blank to inherit global defaults.</p>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Complexity Thresholds</CardTitle>
            <CardDescription className="text-xs">
              Project-specific complexity boundaries.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="threshold-medium"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"
                >
                  Medium Severity Threshold
                  <OverrideIndicator active={form.complexityThresholdMedium !== null} />
                </Label>
                <Input
                  id="threshold-medium"
                  type="number"
                  min={1}
                  max={20}
                  value={form.complexityThresholdMedium ?? ''}
                  placeholder={`Inheriting: ${effectiveConfig?.complexityThresholdMedium}`}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    setForm((s) => ({ ...s, complexityThresholdMedium: val }));
                    setValidationError(null);
                  }}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="threshold-high"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2"
                >
                  High Severity Threshold
                  <OverrideIndicator active={form.complexityThresholdHigh !== null} />
                </Label>
                <Input
                  id="threshold-high"
                  type="number"
                  min={1}
                  max={20}
                  value={form.complexityThresholdHigh ?? ''}
                  placeholder={`Inheriting: ${effectiveConfig?.complexityThresholdHigh}`}
                  onChange={(e) => {
                    const val = e.target.value === '' ? null : parseInt(e.target.value);
                    setForm((s) => ({ ...s, complexityThresholdHigh: val }));
                    setValidationError(null);
                  }}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>
            </div>

            {validationError && (
              <p className="text-destructive text-xs font-medium">{validationError}</p>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                Force Primary Provider Override
                <OverrideIndicator active={form.primaryProviderOverride !== null} />
              </Label>
              <ProviderSelect
                value={form.primaryProviderOverride}
                onChange={(v) => setForm((s) => ({ ...s, primaryProviderOverride: v }))}
                allowNull
                placeholder={effectiveConfig?.primaryProviderOverride ? `Inheriting: ${providerLabel(effectiveConfig.primaryProviderOverride)}` : "Inheriting: Global strategy"}
              />
              <p className="text-[10px] text-muted-foreground italic">
                If set, all tickets skip complexity routing.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Provider Tier Mapping</CardTitle>
            <CardDescription className="text-xs">
              Project-specific tier mappings.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-x-auto border rounded-md">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase font-bold">
                  <tr>
                    <th className="px-4 py-2 border-b">Tier</th>
                    <th className="px-4 py-2 border-b">Primary Provider</th>
                    <th className="px-4 py-2 border-b">Fallback Provider</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  <tr>
                    <td className="px-4 py-3 font-medium bg-muted/20">LOW</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <OverrideIndicator active={form.tierLowProvider !== null} />
                        </div>
                        <ProviderSelect
                          value={form.tierLowProvider}
                          onChange={(v) => setForm((s) => ({ ...s, tierLowProvider: v }))}
                          allowNull
                          placeholder={`Inheriting: ${providerLabel(effectiveConfig?.tierLowProvider)}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <OverrideIndicator active={form.tierLowFallback !== null} />
                        </div>
                        <ProviderSelect
                          value={form.tierLowFallback}
                          onChange={(v) => setForm((s) => ({ ...s, tierLowFallback: v }))}
                          allowNull
                          placeholder={`Inheriting: ${providerLabel(effectiveConfig?.tierLowFallback)}`}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium bg-muted/20">MEDIUM</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <OverrideIndicator active={form.tierMediumProvider !== null} />
                        </div>
                        <ProviderSelect
                          value={form.tierMediumProvider}
                          onChange={(v) => setForm((s) => ({ ...s, tierMediumProvider: v }))}
                          allowNull
                          placeholder={`Inheriting: ${providerLabel(effectiveConfig?.tierMediumProvider)}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <OverrideIndicator active={form.tierMediumFallback !== null} />
                        </div>
                        <ProviderSelect
                          value={form.tierMediumFallback}
                          onChange={(v) => setForm((s) => ({ ...s, tierMediumFallback: v }))}
                          allowNull
                          placeholder={`Inheriting: ${providerLabel(effectiveConfig?.tierMediumFallback)}`}
                        />
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium bg-muted/20">HIGH</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <OverrideIndicator active={form.tierHighProvider !== null} />
                        </div>
                        <ProviderSelect
                          value={form.tierHighProvider}
                          onChange={(v) => setForm((s) => ({ ...s, tierHighProvider: v }))}
                          allowNull
                          placeholder={`Inheriting: ${providerLabel(effectiveConfig?.tierHighProvider)}`}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          <OverrideIndicator active={form.tierHighFallback !== null} />
                        </div>
                        <ProviderSelect
                          value={form.tierHighFallback}
                          onChange={(v) => setForm((s) => ({ ...s, tierHighFallback: v }))}
                          allowNull
                          placeholder={`Inheriting: ${providerLabel(effectiveConfig?.tierHighFallback)}`}
                        />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex justify-between pt-6">
              <Button
                variant="destructive"
                size="sm"
                className="h-9"
                disabled={resetMutation.isPending}
                onClick={handleReset}
              >
                {resetMutation.isPending ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="mr-2 h-3.5 w-3.5" />
                )}
                Reset to Global Defaults
              </Button>

              <Button
                size="sm"
                className="h-9"
                disabled={!hasChanges || updateMutation.isPending}
                onClick={handleSave}
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-3.5 w-3.5" />
                    Save Overrides
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
