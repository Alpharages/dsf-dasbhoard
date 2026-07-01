export type OpenHarnessSkill = 'clickup-dev-implement' | 'clickup-code-review' | 'clickup-qa';
export type SkillModelProvider = 'openai' | 'claude';
export type SkillModelRuntime = 'oh' | 'claude';

export interface SkillModelMapEntry {
  skill: OpenHarnessSkill;
  model: string;
  provider: SkillModelProvider;
  runtime: SkillModelRuntime;
}

export const SKILL_LABELS: Record<OpenHarnessSkill, string> = {
  'clickup-dev-implement': 'Implement',
  'clickup-code-review': 'Code Review',
  'clickup-qa': 'QA',
};

// runtime -> provider is a fixed 1:1 mapping enforced by the backend (oh -> openai, claude -> claude).
export const RUNTIME_OPTIONS: { value: SkillModelRuntime; label: string; provider: SkillModelProvider }[] = [
  { value: 'oh', label: 'OpenAI (oh)', provider: 'openai' },
  { value: 'claude', label: 'Claude', provider: 'claude' },
];
