export type OpenHarnessSkill = 'clickup-dev-implement' | 'clickup-code-review' | 'clickup-qa';

export interface StatusSkillEntry {
  status: string;
  skill: OpenHarnessSkill;
}

export interface GlobalStatusSkillMap {
  entries: StatusSkillEntry[];
  loopTerminalStatuses: string[];
  loopMaxIterations: number;
}

export const SKILL_OPTIONS: { value: OpenHarnessSkill; label: string }[] = [
  { value: 'clickup-dev-implement', label: 'Implement' },
  { value: 'clickup-code-review', label: 'Code Review' },
  { value: 'clickup-qa', label: 'QA' },
];
