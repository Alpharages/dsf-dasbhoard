import { useState, useEffect } from 'react';
import { Cpu, Save, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import {
  useGlobalAiRoutingConfig,
  useUpdateGlobalAiRoutingConfig,
} from '@/hooks/queries/useAiRoutingConfig';
import { ProviderSelect } from '@/components/settings/ProviderSelect';
import type { AIProvider } from '@/api/aiRoutingConfigApi';

export function GlobalAiRoutingPanel() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const { data: config, isLoading, isError } = useGlobalAiRoutingConfig();
  const updateMutation = useUpdateGlobalAiRoutingConfig();

  const [form, setForm] = useState({
    primaryProviderOverride: null as AIProvider | null,
    complexityThresholdMedium: 5,
    complexityThresholdHigh: 15,
    tierLowProvider: 'CLAUDE_CODE' as AIProvider,
    tierLowFallback: null as AIProvider | null,
    tierMediumProvider: 'CLAUDE_CODE' as AIProvider,
    tierMediumFallback: null as AIProvider | null,
    tierHighProvider: 'CLAUDE_CODE' as AIProvider,
    tierHighFallback: null as AIProvider | null,
  });

  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    if (config) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setForm({
        primaryProviderOverride: config.primaryProviderOverride,
        complexityThresholdMedium: config.complexityThresholdMedium,
        complexityThresholdHigh: config.complexityThresholdHigh,
        tierLowProvider: config.tierLowProvider,
        tierLowFallback: config.tierLowFallback,
        tierMediumProvider: config.tierMediumProvider,
        tierMediumFallback: config.tierMediumFallback,
        tierHighProvider: config.tierHighProvider,
        tierHighFallback: config.tierHighFallback,
      });
    }
  }, [config]);

  const hasChanges =
    config &&
    (form.primaryProviderOverride !== config.primaryProviderOverride ||
      form.complexityThresholdMedium !== config.complexityThresholdMedium ||
      form.complexityThresholdHigh !== config.complexityThresholdHigh ||
      form.tierLowProvider !== config.tierLowProvider ||
      form.tierLowFallback !== config.tierLowFallback ||
      form.tierMediumProvider !== config.tierMediumProvider ||
      form.tierMediumFallback !== config.tierMediumFallback ||
      form.tierHighProvider !== config.tierHighProvider ||
      form.tierHighFallback !== config.tierHighFallback);

  const validate = () => {
    if (form.complexityThresholdHigh <= form.complexityThresholdMedium) {
      return 'High threshold must be greater than Medium threshold';
    }
    if (
      form.complexityThresholdMedium < 1 ||
      form.complexityThresholdMedium > 20 ||
      form.complexityThresholdHigh < 1 ||
      form.complexityThresholdHigh > 20
    ) {
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
        toast.success('Global AI routing configuration saved');
      },
      onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
        toast.error(err?.response?.data?.message || err.message || 'Failed to save configuration');
      },
    });
  };

  if (isError) {
    return (
      <div className="p-6 text-sm text-destructive">Failed to load AI routing configuration.</div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
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
          <h1 className="text-2xl font-bold text-foreground">AI Routing Strategy</h1>
          <p className="text-muted-foreground text-sm">Configure how tickets are routed to AI providers based on complexity.</p>
        </div>
      </div>

      {!isAdmin && (
        <div className="flex items-center gap-2 p-3 bg-muted/40 rounded-lg text-sm text-muted-foreground">
          <Info className="w-4 h-4 shrink-0" />
          View only. Contact an Admin to change global routing settings.
        </div>
      )}

      <div className="grid gap-6">
        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Complexity Thresholds</CardTitle>
            <CardDescription className="text-xs">
              Define the complexity score boundaries for routing tiers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="threshold-medium"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  Medium Severity Threshold
                </Label>
                <Input
                  id="threshold-medium"
                  type="number"
                  min={1}
                  max={20}
                  value={form.complexityThresholdMedium}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, complexityThresholdMedium: parseInt(e.target.value) || 0 }));
                    setValidationError(null);
                  }}
                  disabled={!isAdmin}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="threshold-high"
                  className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                >
                  High Severity Threshold
                </Label>
                <Input
                  id="threshold-high"
                  type="number"
                  min={1}
                  max={20}
                  value={form.complexityThresholdHigh}
                  onChange={(e) => {
                    setForm((s) => ({ ...s, complexityThresholdHigh: parseInt(e.target.value) || 0 }));
                    setValidationError(null);
                  }}
                  disabled={!isAdmin}
                  className="bg-background/50 h-9 text-sm"
                />
              </div>
            </div>

            {validationError && (
              <p className="text-destructive text-xs font-medium">{validationError}</p>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Force Primary Provider Override
              </Label>
              <ProviderSelect
                value={form.primaryProviderOverride}
                onChange={(v) => setForm((s) => ({ ...s, primaryProviderOverride: v }))}
                disabled={!isAdmin}
                allowNull
                placeholder="None — use complexity strategy"
              />
              <p className="text-[10px] text-muted-foreground italic">
                If set, all tickets skip complexity routing and go to this provider.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-base">Provider Tier Mapping</CardTitle>
            <CardDescription className="text-xs">
              Assign primary and fallback providers to each complexity tier.
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
                      <ProviderSelect
                        value={form.tierLowProvider}
                        onChange={(v) => v && setForm((s) => ({ ...s, tierLowProvider: v }))}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ProviderSelect
                        value={form.tierLowFallback}
                        onChange={(v) => setForm((s) => ({ ...s, tierLowFallback: v }))}
                        disabled={!isAdmin}
                        allowNull
                        placeholder="None"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium bg-muted/20">MEDIUM</td>
                    <td className="px-4 py-3">
                      <ProviderSelect
                        value={form.tierMediumProvider}
                        onChange={(v) => v && setForm((s) => ({ ...s, tierMediumProvider: v }))}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ProviderSelect
                        value={form.tierMediumFallback}
                        onChange={(v) => setForm((s) => ({ ...s, tierMediumFallback: v }))}
                        disabled={!isAdmin}
                        allowNull
                        placeholder="None"
                      />
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium bg-muted/20">HIGH</td>
                    <td className="px-4 py-3">
                      <ProviderSelect
                        value={form.tierHighProvider}
                        onChange={(v) => v && setForm((s) => ({ ...s, tierHighProvider: v }))}
                        disabled={!isAdmin}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <ProviderSelect
                        value={form.tierHighFallback}
                        onChange={(v) => setForm((s) => ({ ...s, tierHighFallback: v }))}
                        disabled={!isAdmin}
                        allowNull
                        placeholder="None"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {isAdmin && (
              <div className="flex justify-end pt-6">
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
                      Save Strategy
                    </>
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
