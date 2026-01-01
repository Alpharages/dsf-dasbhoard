export interface ArchitectureConstraint {
  id: string;
  projectId?: string;
  scope: 'GLOBAL' | 'PROJECT';
  type: 'ALLOWED_TECH' | 'FORBIDDEN_TECH' | 'PATTERN' | 'STANDARD';
  rules: TechConstraintRules | PatternConstraintRules | StandardConstraintRules;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConstraintDto {
  projectId?: string;
  scope: string;
  type: string;
  rules: any;
}

export interface UpdateConstraintDto {
  projectId?: string;
  scope?: string;
  type?: string;
  rules?: any;
}

// Type-specific rule structures
export interface TechConstraintRules {
  items: string[]; // Package names
  reason?: string; // Why these technologies
}

export interface PatternConstraintRules {
  pattern: string; // Regex pattern
  fileGlob: string; // File glob (e.g., /src/**/*.ts)
  description?: string;
}

export interface StandardConstraintRules {
  description: string;
  url?: string; // Link to style guide
}

// Helper type guards
export function isTechConstraint(constraint: ArchitectureConstraint): constraint is ArchitectureConstraint & { rules: TechConstraintRules } {
  return constraint.type === 'ALLOWED_TECH' || constraint.type === 'FORBIDDEN_TECH';
}

export function isPatternConstraint(constraint: ArchitectureConstraint): constraint is ArchitectureConstraint & { rules: PatternConstraintRules } {
  return constraint.type === 'PATTERN';
}

export function isStandardConstraint(constraint: ArchitectureConstraint): constraint is ArchitectureConstraint & { rules: StandardConstraintRules } {
  return constraint.type === 'STANDARD';
}
