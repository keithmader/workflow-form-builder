import type {
  ConditionalOperatorConfig,
  ConditionConfig,
  ActionConfig,
  ToggleOperatorConfig,
  FieldConfig,
} from '@/types/schema';
import type { ConditionalState, ReferenceContext } from '@/types/jobTester';
import { resolveReference } from './referenceResolver';

/**
 * Evaluate switch + toggle operators against current form values and reference context.
 * Returns a ConditionalState describing which fields are hidden/shown/required and
 * any value/enum overrides.
 */
export function evaluateConditionals(
  switchOperators: ConditionalOperatorConfig[],
  toggleOperators: { fieldName: string; operators: ToggleOperatorConfig[] }[],
  formValues: Record<string, unknown>,
  context: ReferenceContext,
): ConditionalState {
  const state: ConditionalState = {
    hiddenFields: new Set(),
    shownFields: new Set(),
    requiredFields: new Set(),
    valueOverrides: new Map(),
    enumOverrides: new Map(),
  };

  // Evaluate switch operators
  for (const op of switchOperators) {
    evaluateSwitchOperator(op, formValues, context, state);
  }

  // Evaluate toggle operators
  for (const { fieldName, operators } of toggleOperators) {
    evaluateToggleOperators(fieldName, operators, formValues, context, state);
  }

  return state;
}

function evaluateSwitchOperator(
  op: ConditionalOperatorConfig,
  formValues: Record<string, unknown>,
  context: ReferenceContext,
  state: ConditionalState,
): boolean {
  const conditionMet = evaluateExpression(op.expression, formValues, context);

  if (conditionMet) {
    applyActions(op.thenActions, state, formValues, context);
  } else if (op.elseOperator) {
    evaluateSwitchOperator(op.elseOperator, formValues, context, state);
  } else if (op.elseActions) {
    applyActions(op.elseActions, state, formValues, context);
  }

  // Return whether we should stop processing (containsBreak = no continue)
  return conditionMet && op.containsBreak;
}

function evaluateExpression(
  expr: ConditionalOperatorConfig['expression'],
  formValues: Record<string, unknown>,
  context: ReferenceContext,
): boolean {
  if (expr.conditions.length === 0) return false;

  if (expr.type === 'allOf') {
    return expr.conditions.every((c) => evaluateCondition(c, formValues, context));
  }
  // anyOf
  return expr.conditions.some((c) => evaluateCondition(c, formValues, context));
}

function evaluateCondition(
  cond: ConditionConfig,
  formValues: Record<string, unknown>,
  context: ReferenceContext,
): boolean {
  // Resolve left and right values
  const leftRaw = resolveValue(cond.leftValue, formValues, context);
  const rightRaw = resolveValue(cond.rightValue, formValues, context);

  const left = String(leftRaw ?? '');
  const right = String(rightRaw ?? '');

  switch (cond.operator) {
    case 'eq':
      return left === right;
    case 'ne':
      return left !== right;
    case 'gt': {
      const ln = parseFloat(left);
      const rn = parseFloat(right);
      return !isNaN(ln) && !isNaN(rn) && ln > rn;
    }
    case 'lt': {
      const ln = parseFloat(left);
      const rn = parseFloat(right);
      return !isNaN(ln) && !isNaN(rn) && ln < rn;
    }
    default:
      return false;
  }
}

function resolveValue(
  value: string,
  formValues: Record<string, unknown>,
  context: ReferenceContext,
): unknown {
  if (!value) return '';

  if (value.startsWith('$this.')) {
    const widgetName = value.slice(6); // Remove "$this."
    return formValues[widgetName];
  }

  if (value.startsWith('$')) {
    return resolveReference(value, context, formValues);
  }

  return value;
}

function applyActions(
  actions: ActionConfig[],
  state: ConditionalState,
  _formValues: Record<string, unknown>,
  _context: ReferenceContext,
): void {
  for (const action of actions) {
    switch (action.type) {
      case 'show':
        for (const f of action.fields) state.shownFields.add(f);
        break;
      case 'exclude':
        for (const f of action.fields) state.hiddenFields.add(f);
        break;
      case 'setRequired':
        for (const f of action.fields) state.requiredFields.add(f);
        break;
      case 'setValue':
        for (const v of action.values) {
          state.valueOverrides.set(v.widgetAccess, v.value);
        }
        break;
      case 'setEnum':
      case 'setChoices':
        for (const o of action.options) {
          state.enumOverrides.set(o.widgetAccess, o.enumOptions);
        }
        break;
      case 'setObservableValue':
        // Observable values need runtime resolution — store the reference for now
        break;
    }
  }
}

function evaluateToggleOperators(
  fieldName: string,
  operators: ToggleOperatorConfig[],
  formValues: Record<string, unknown>,
  context: ReferenceContext,
  state: ConditionalState,
): void {
  const fieldValue = String(formValues[fieldName] ?? '');

  for (const op of operators) {
    let matches = false;

    if (op.condition.type === 'equalTo') {
      matches = fieldValue === op.condition.value;
    } else {
      // expression comparison
      const refValue = resolveValue(
        op.condition.referenceToWidget,
        formValues,
        context,
      );
      const refStr = String(refValue ?? '');

      switch (op.condition.comparison) {
        case 'eq':
          matches = fieldValue === refStr;
          break;
        case 'ne':
          matches = fieldValue !== refStr;
          break;
        case 'gt':
          matches = parseFloat(fieldValue) > parseFloat(refStr);
          break;
        case 'lt':
          matches = parseFloat(fieldValue) < parseFloat(refStr);
          break;
      }
    }

    if (matches) {
      // Show the toggled widgets (unhide them)
      for (const w of op.accessToWidgets) {
        state.shownFields.add(w);
      }
    }
  }
}

/**
 * Collect toggle operators from all fields into a flat list for evaluation.
 */
export function collectToggleOperators(
  fields: FieldConfig[],
): { fieldName: string; operators: ToggleOperatorConfig[] }[] {
  const result: { fieldName: string; operators: ToggleOperatorConfig[] }[] = [];

  for (const field of fields) {
    if ('toggleOperators' in field && field.toggleOperators.length > 0) {
      result.push({ fieldName: field.widgetName, operators: field.toggleOperators });
    }
    if ('children' in field && field.children) {
      result.push(...collectToggleOperators(field.children));
    }
  }

  return result;
}

/**
 * Determine effective visibility of a field given the conditional state.
 * A field is visible if:
 * - It's explicitly shown, OR
 * - It's not hidden AND not excluded
 */
export function isFieldVisible(
  field: FieldConfig,
  conditionalState: ConditionalState,
): boolean {
  const name = field.widgetName;

  // If explicitly excluded, hide it
  if (conditionalState.hiddenFields.has(name)) return false;

  // If initially hidden but shown by conditional, show it
  if (field.isHidden && !conditionalState.shownFields.has(name)) return false;

  return true;
}

/**
 * Determine if a field is required, considering both static config and dynamic conditionals.
 */
export function isFieldRequired(
  field: FieldConfig,
  conditionalState: ConditionalState,
): boolean {
  return field.isRequired || conditionalState.requiredFields.has(field.widgetName);
}
