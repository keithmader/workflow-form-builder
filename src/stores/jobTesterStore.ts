import { create } from 'zustand';
import type { FieldConfig, ConditionalOperatorConfig } from '@/types/schema';
import type {
  ParsedJob,
  ParsedStep,
  ParsedTask,
  FormDefinitionMap,
  TaskResponse,
  JobTesterPhase,
  FlatTaskEntry,
} from '@/types/jobTester';
import type { SavedForm } from '@/types/project';
import { parseFormDefinition } from '@/utils/schemaParser';

/** A resolved form ready for rendering — either from project or parsed from raw schema */
export interface ResolvedForm {
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  source: 'project' | 'schemas';
}

interface JobTesterState {
  phase: JobTesterPhase;
  isActive: boolean;

  // Setup data
  rawJobJson: string | null;
  parsedJob: ParsedJob | null;
  rawSchemasJson: string | null;
  schemaDefinitions: FormDefinitionMap | null; // from optional schemas JSON file

  // Stepping state
  currentStepIndex: number;
  currentTaskIndex: number;
  currentFormValues: Record<string, unknown>;
  responses: Map<string, TaskResponse>;

  // Computed helpers
  flatTaskList: FlatTaskEntry[];

  // Actions
  loadJobJson: (json: string) => { success: boolean; error?: string };
  loadSchemasJson: (json: string) => { success: boolean; error?: string };
  startTesting: () => { success: boolean; error?: string };
  updateFormValue: (name: string, value: unknown) => void;
  submitCurrentTask: (isValid: boolean, errors: string[]) => void;
  skipCurrentTask: () => void;
  goToNext: () => boolean;
  goToPrev: () => boolean;
  goToTask: (stepIndex: number, taskIndex: number) => void;
  finishTesting: () => void;
  reset: () => void;

  /**
   * Resolve the form for a given task type.
   * Checks project savedForms (by formName) first, then falls back to loaded schemas JSON.
   */
  resolveForm: (taskType: string, savedForms: Record<string, SavedForm>) => ResolvedForm | null;

  /**
   * Check whether a task type has a matching form definition available.
   */
  hasFormForTask: (taskType: string, savedForms: Record<string, SavedForm>) => boolean;
}

function parseJob(json: string): { job: ParsedJob; error?: string } | { job: null; error: string } {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json);
  } catch {
    return { job: null, error: 'Invalid JSON' };
  }

  const stepsRaw = raw.steps;
  if (!Array.isArray(stepsRaw) || stepsRaw.length === 0) {
    return { job: null, error: 'No steps found in job JSON' };
  }

  const steps: ParsedStep[] = stepsRaw
    .filter((s): s is Record<string, unknown> => s != null && typeof s === 'object')
    .map((s) => {
      const tasksRaw = Array.isArray(s.tasks) ? s.tasks : [];
      const tasks: ParsedTask[] = tasksRaw
        .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
        .map((t) => ({
          raw: t,
          id: String(t.id ?? t.external_id ?? Math.random()),
          name: String(t.name ?? 'Unnamed Task'),
          type: String(t.type ?? ''),
          order: typeof t.order === 'number' ? t.order : 0,
          completed: false,
          fields: (t.fields as Record<string, unknown>) ?? {},
        }))
        .sort((a, b) => a.order - b.order);

      return {
        raw: s,
        id: String(s.id ?? s.external_id ?? Math.random()),
        name: String(s.name ?? 'Unnamed Step'),
        type: String(s.type ?? ''),
        order: typeof s.order === 'number' ? s.order : 0,
        locationExternalId: typeof s.location_external_id === 'string' ? s.location_external_id : null,
        tasks,
      };
    })
    .sort((a, b) => a.order - b.order);

  return { job: { raw, steps } };
}

function parseSchemas(json: string): { defs: FormDefinitionMap; error?: string } | { defs: null; error: string } {
  let raw: Record<string, unknown>;
  try {
    raw = JSON.parse(json);
  } catch {
    return { defs: null, error: 'Invalid JSON' };
  }

  // Try data.form_schema.formDefinitions path
  const data = raw.data as Record<string, unknown> | undefined;
  const formSchema = data?.form_schema as Record<string, unknown> | undefined;
  const formDefs = formSchema?.formDefinitions as Record<string, unknown> | undefined;

  if (formDefs && typeof formDefs === 'object') {
    return { defs: formDefs as FormDefinitionMap };
  }

  // Try direct formDefinitions
  if (raw.formDefinitions && typeof raw.formDefinitions === 'object') {
    return { defs: raw.formDefinitions as FormDefinitionMap };
  }

  return { defs: null, error: 'Could not find formDefinitions in schemas JSON' };
}

function buildFlatTaskList(job: ParsedJob): FlatTaskEntry[] {
  const list: FlatTaskEntry[] = [];
  for (let si = 0; si < job.steps.length; si++) {
    const step = job.steps[si];
    for (let ti = 0; ti < step.tasks.length; ti++) {
      list.push({
        stepIndex: si,
        taskIndex: ti,
        stepName: step.name,
        task: step.tasks[ti],
      });
    }
  }
  return list;
}

/** Find a SavedForm whose formName matches the task type (case-insensitive) */
function findProjectForm(taskType: string, savedForms: Record<string, SavedForm>): SavedForm | null {
  const lower = taskType.toLowerCase();
  for (const form of Object.values(savedForms)) {
    if (form.formName.toLowerCase() === lower) {
      return form;
    }
  }
  return null;
}

// Cache for parsed schema definitions so we don't re-parse every render
const parsedSchemaCache = new Map<string, ResolvedForm>();

export const useJobTesterStore = create<JobTesterState>((set, get) => ({
  phase: 'setup',
  isActive: false,
  rawJobJson: null,
  parsedJob: null,
  rawSchemasJson: null,
  schemaDefinitions: null,
  currentStepIndex: 0,
  currentTaskIndex: 0,
  currentFormValues: {},
  responses: new Map(),
  flatTaskList: [],

  loadJobJson: (json: string) => {
    const result = parseJob(json);
    if (!result.job) {
      return { success: false, error: result.error };
    }
    const flatTaskList = buildFlatTaskList(result.job);
    set({ rawJobJson: json, parsedJob: result.job, flatTaskList });
    return { success: true };
  },

  loadSchemasJson: (json: string) => {
    const result = parseSchemas(json);
    if (!result.defs) {
      return { success: false, error: result.error };
    }
    parsedSchemaCache.clear();
    set({ rawSchemasJson: json, schemaDefinitions: result.defs });
    return { success: true };
  },

  resolveForm: (taskType: string, savedForms: Record<string, SavedForm>): ResolvedForm | null => {
    // 1. Check project forms first
    const projectForm = findProjectForm(taskType, savedForms);
    if (projectForm && (projectForm.fields.length > 0 || projectForm.rawSchema)) {
      // If fields exist, use them directly
      if (projectForm.fields.length > 0) {
        return {
          fields: projectForm.fields,
          switchOperators: projectForm.switchOperators,
          source: 'project',
        };
      }
      // If only rawSchema, parse it
      if (projectForm.rawSchema) {
        const parsed = parseFormDefinition(taskType, JSON.parse(projectForm.rawSchema));
        return {
          fields: parsed.fields,
          switchOperators: parsed.switchOperators,
          source: 'project',
        };
      }
    }

    // 2. Fall back to loaded schemas JSON
    const { schemaDefinitions } = get();
    if (schemaDefinitions && schemaDefinitions[taskType]) {
      // Check cache
      const cached = parsedSchemaCache.get(taskType);
      if (cached) return cached;

      const parsed = parseFormDefinition(taskType, schemaDefinitions[taskType]);
      const resolved: ResolvedForm = {
        fields: parsed.fields,
        switchOperators: parsed.switchOperators,
        source: 'schemas',
      };
      parsedSchemaCache.set(taskType, resolved);
      return resolved;
    }

    return null;
  },

  hasFormForTask: (taskType: string, savedForms: Record<string, SavedForm>): boolean => {
    if (findProjectForm(taskType, savedForms)) return true;
    const { schemaDefinitions } = get();
    return !!(schemaDefinitions && schemaDefinitions[taskType]);
  },

  startTesting: () => {
    const { parsedJob } = get();
    if (!parsedJob) return { success: false, error: 'No job loaded' };

    // Pre-fill with existing task fields
    const firstTask = parsedJob.steps[0]?.tasks[0];
    const initialValues = firstTask?.fields ? { ...firstTask.fields } : {};

    set({
      phase: 'stepping',
      isActive: true,
      currentStepIndex: 0,
      currentTaskIndex: 0,
      currentFormValues: initialValues,
      responses: new Map(),
    });
    return { success: true };
  },

  updateFormValue: (name: string, value: unknown) => {
    set((state) => ({
      currentFormValues: { ...state.currentFormValues, [name]: value },
    }));
  },

  submitCurrentTask: (isValid: boolean, errors: string[]) => {
    const state = get();
    const { parsedJob, currentStepIndex, currentTaskIndex, currentFormValues } = state;
    if (!parsedJob) return;

    const step = parsedJob.steps[currentStepIndex];
    const task = step?.tasks[currentTaskIndex];
    if (!task) return;

    const response: TaskResponse = {
      taskId: task.id,
      taskName: task.name,
      taskType: task.type,
      stepName: step.name,
      formValues: { ...currentFormValues },
      submittedAt: Date.now(),
      isValid,
      errors,
    };

    const newResponses = new Map(state.responses);
    newResponses.set(task.id, response);

    set({ responses: newResponses });

    // Auto-advance
    get().goToNext();
  },

  skipCurrentTask: () => {
    const state = get();
    const { parsedJob, currentStepIndex, currentTaskIndex } = state;
    if (!parsedJob) return;

    const step = parsedJob.steps[currentStepIndex];
    const task = step?.tasks[currentTaskIndex];
    if (!task) return;

    const response: TaskResponse = {
      taskId: task.id,
      taskName: task.name,
      taskType: task.type,
      stepName: step.name,
      formValues: {},
      submittedAt: Date.now(),
      isValid: true,
      errors: [],
    };

    const newResponses = new Map(state.responses);
    newResponses.set(task.id, response);

    set({ responses: newResponses });
    get().goToNext();
  },

  goToNext: () => {
    const { parsedJob, currentStepIndex, currentTaskIndex } = get();
    if (!parsedJob) return false;

    const step = parsedJob.steps[currentStepIndex];
    if (currentTaskIndex < step.tasks.length - 1) {
      const nextTask = step.tasks[currentTaskIndex + 1];
      set({
        currentTaskIndex: currentTaskIndex + 1,
        currentFormValues: nextTask.fields ? { ...nextTask.fields } : {},
      });
      return true;
    }

    if (currentStepIndex < parsedJob.steps.length - 1) {
      const nextStep = parsedJob.steps[currentStepIndex + 1];
      const nextTask = nextStep.tasks[0];
      set({
        currentStepIndex: currentStepIndex + 1,
        currentTaskIndex: 0,
        currentFormValues: nextTask?.fields ? { ...nextTask.fields } : {},
      });
      return true;
    }

    // At the end — move to results
    set({ phase: 'results' });
    return false;
  },

  goToPrev: () => {
    const { parsedJob, currentStepIndex, currentTaskIndex } = get();
    if (!parsedJob) return false;

    if (currentTaskIndex > 0) {
      const prevTask = parsedJob.steps[currentStepIndex].tasks[currentTaskIndex - 1];
      set({
        currentTaskIndex: currentTaskIndex - 1,
        currentFormValues: prevTask.fields ? { ...prevTask.fields } : {},
      });
      return true;
    }

    if (currentStepIndex > 0) {
      const prevStep = parsedJob.steps[currentStepIndex - 1];
      const lastTaskIdx = prevStep.tasks.length - 1;
      const prevTask = prevStep.tasks[lastTaskIdx];
      set({
        currentStepIndex: currentStepIndex - 1,
        currentTaskIndex: lastTaskIdx,
        currentFormValues: prevTask?.fields ? { ...prevTask.fields } : {},
      });
      return true;
    }

    return false;
  },

  goToTask: (stepIndex: number, taskIndex: number) => {
    const { parsedJob } = get();
    if (!parsedJob) return;

    const step = parsedJob.steps[stepIndex];
    if (!step) return;

    const task = step.tasks[taskIndex];
    if (!task) return;

    set({
      currentStepIndex: stepIndex,
      currentTaskIndex: taskIndex,
      currentFormValues: task.fields ? { ...task.fields } : {},
    });
  },

  finishTesting: () => {
    set({ phase: 'results' });
  },

  reset: () => {
    parsedSchemaCache.clear();
    set({
      phase: 'setup',
      isActive: false,
      rawJobJson: null,
      parsedJob: null,
      rawSchemasJson: null,
      schemaDefinitions: null,
      currentStepIndex: 0,
      currentTaskIndex: 0,
      currentFormValues: {},
      responses: new Map(),
      flatTaskList: [],
    });
  },
}));
