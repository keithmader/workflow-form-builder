import type { ReferenceContext } from '@/types/jobTester';

/**
 * Resolve a dot-path reference like "$job.shipment_details.hazmat" or
 * "$step.external_data.someKey" against a ReferenceContext.
 *
 * Supports: $job, $step, $task, $step_location, $this (form values).
 * external_data arrays [{label, value}] are auto-keyed by label.
 */
export function resolveReference(
  ref: string,
  context: ReferenceContext,
  formValues?: Record<string, unknown>,
): unknown {
  if (!ref || !ref.startsWith('$')) return ref;

  const dotIndex = ref.indexOf('.');
  const prefix = dotIndex === -1 ? ref : ref.slice(0, dotIndex);
  const path = dotIndex === -1 ? '' : ref.slice(dotIndex + 1);

  let root: Record<string, unknown> | null = null;

  switch (prefix) {
    case '$job':
      root = context.job;
      break;
    case '$step':
      root = context.step;
      break;
    case '$task':
      root = context.task;
      break;
    case '$step_location':
      root = context.stepLocation ?? null;
      break;
    case '$this':
      root = (formValues as Record<string, unknown>) ?? null;
      break;
    default:
      return ref;
  }

  if (!root || !path) return root;

  return resolveDotPath(root, path);
}

function resolveDotPath(obj: unknown, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;

  for (const part of parts) {
    if (current == null) return undefined;

    if (Array.isArray(current)) {
      // Try to find by key in external_data-style arrays: [{label, value}, ...]
      const found = current.find(
        (item: unknown) =>
          item != null &&
          typeof item === 'object' &&
          (item as Record<string, unknown>).label === part,
      );
      if (found && typeof found === 'object') {
        current = (found as Record<string, unknown>).value;
        continue;
      }

      // Try numeric index
      const idx = parseInt(part, 10);
      if (!isNaN(idx)) {
        current = current[idx];
        continue;
      }

      return undefined;
    }

    if (typeof current === 'object') {
      current = (current as Record<string, unknown>)[part];
    } else {
      return undefined;
    }
  }

  return current;
}

/**
 * Build a ReferenceContext for a given step/task within a job.
 */
export function buildReferenceContext(
  jobRaw: Record<string, unknown>,
  stepRaw: Record<string, unknown>,
  taskRaw: Record<string, unknown>,
  locations?: Record<string, unknown>[],
): ReferenceContext {
  // Find the step's location from job.locations by location_external_id
  let stepLocation: Record<string, unknown> | null = null;
  const locExtId = stepRaw.location_external_id;
  if (locExtId && Array.isArray(locations)) {
    stepLocation =
      (locations.find(
        (loc) => (loc as Record<string, unknown>).external_id === locExtId,
      ) as Record<string, unknown>) ?? null;
  }

  return {
    job: jobRaw,
    step: stepRaw,
    task: taskRaw,
    stepLocation,
  };
}

/**
 * Resolve a string that may contain a $ reference, returning the resolved value
 * or the original string if not a reference.
 */
export function resolveStringValue(
  value: string | null | undefined,
  context: ReferenceContext,
  formValues?: Record<string, unknown>,
): unknown {
  if (value == null) return value;
  if (value.startsWith('$')) {
    return resolveReference(value, context, formValues);
  }
  return value;
}
