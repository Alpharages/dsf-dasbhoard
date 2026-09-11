export type OpenHarnessSkill = 'clickup-dev-implement' | 'clickup-code-review' | 'clickup-qa';
export type SkillModelProvider = 'openai' | 'claude';
export type SkillModelRuntime = 'oh' | 'claude' | 'codex';

/** One {model, provider, runtime} candidate — the primary and every fallback share this shape. */
export interface SkillModelCandidate {
  model: string;
  provider: SkillModelProvider;
  runtime: SkillModelRuntime;
}

export interface SkillModelMapEntry extends SkillModelCandidate {
  skill: OpenHarnessSkill;
  /**
   * Ordered fallback chain. Tried in order when the primary has no selectable account — either
   * at dispatch (every account cooling down) or mid-run (rate limit with none left). Empty =
   * the run fails instead of switching model.
   */
  fallbacks: SkillModelCandidate[];
}

export const SKILL_LABELS: Record<OpenHarnessSkill, string> = {
  'clickup-dev-implement': 'Implement',
  'clickup-code-review': 'Code Review',
  'clickup-qa': 'QA',
};

// Each runtime maps to exactly one provider (the backend rejects any other pairing), but a
// provider does NOT map back to one runtime: 'openai' is served by either `codex` or `oh`.
export const RUNTIME_OPTIONS: { value: SkillModelRuntime; label: string; provider: SkillModelProvider }[] = [
  // Labelled by the runtime, not the vendor: the provider stays 'openai' in the backend's
  // vocabulary either way, and it is the runtime that decides which CLI (and therefore which
  // account config dir) drives the run.
  { value: 'codex', label: 'Codex (ChatGPT subscription)', provider: 'openai' },
  { value: 'oh', label: 'OpenHarness (self-hosted)', provider: 'openai' },
  { value: 'claude', label: 'Claude', provider: 'claude' },
];

// Suggestions only — the field is free text. Nothing downstream validates the model against a
// list: the backend DTO takes any non-empty string and `oh`/`claude` pass it straight to the
// provider, so a closed dropdown could only ever be wrong (a new model ships and the UI blocks
// it; an `oh` account pointed at a self-hosted backend serves models no list here knows about).
// A backend endpoint would not help — `oh` has no model catalog to read either.
export const MODEL_SUGGESTIONS: Record<SkillModelRuntime, string[]> = {
  codex: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-codex', 'gpt-5.4-mini'],
  oh: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-codex', 'gpt-5.4-mini'],
  claude: ['opus', 'sonnet', 'haiku'],
};
