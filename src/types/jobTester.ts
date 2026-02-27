export interface ParsedJob {
  raw: Record<string, unknown>;
  steps: ParsedStep[];
}

export interface ParsedStep {
  raw: Record<string, unknown>;
  id: string;
  name: string;
  type: string;
  order: number;
  locationExternalId: string | null;
  tasks: ParsedTask[];
}

export interface ParsedTask {
  raw: Record<string, unknown>;
  id: string;
  name: string;
  type: string;
  order: number;
  completed: boolean;
  fields: Record<string, unknown>;
}

export interface FormDefinitionMap {
  [formType: string]: Record<string, unknown>;
}

export interface TaskResponse {
  taskId: string;
  taskName: string;
  taskType: string;
  stepName: string;
  formValues: Record<string, unknown>;
  submittedAt: number;
  isValid: boolean;
  errors: string[];
}

export type JobTesterPhase = 'setup' | 'stepping' | 'results';

export interface FlatTaskEntry {
  stepIndex: number;
  taskIndex: number;
  stepName: string;
  task: ParsedTask;
}

export interface ReferenceContext {
  job: Record<string, unknown>;
  step: Record<string, unknown>;
  task: Record<string, unknown>;
  stepLocation: Record<string, unknown> | null;
}

export interface ConditionalState {
  hiddenFields: Set<string>;
  shownFields: Set<string>;
  requiredFields: Set<string>;
  valueOverrides: Map<string, string>;
  enumOverrides: Map<string, unknown>;
}
