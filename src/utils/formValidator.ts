import type { FieldConfig } from '@/types/schema';
import type { ConditionalState } from '@/types/jobTester';
import { isFieldVisible, isFieldRequired } from './conditionalEngine';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validate form values against field configs and conditional state.
 * Only validates visible fields; hidden/excluded fields are skipped.
 */
export function validateForm(
  fields: FieldConfig[],
  values: Record<string, unknown>,
  conditionalState: ConditionalState,
): ValidationResult {
  const errors: string[] = [];

  for (const field of fields) {
    if (!isFieldVisible(field, conditionalState)) continue;

    validateField(field, values, conditionalState, errors);
  }

  return { isValid: errors.length === 0, errors };
}

function validateField(
  field: FieldConfig,
  values: Record<string, unknown>,
  conditionalState: ConditionalState,
  errors: string[],
): void {
  const value = values[field.widgetName];
  const required = isFieldRequired(field, conditionalState);
  const label = field.title || field.widgetName;

  // Skip non-input field types
  if (
    field.fieldType === 'separator' ||
    field.fieldType === 'instruction' ||
    field.fieldType === 'description'
  ) {
    return;
  }

  // Recurse into object children
  if (field.fieldType === 'object' && 'children' in field) {
    const objValues = (value as Record<string, unknown>) ?? values;
    for (const child of field.children) {
      if (!isFieldVisible(child, conditionalState)) continue;
      validateField(child, objValues, conditionalState, errors);
    }
    return;
  }

  // Required check
  if (required) {
    if (value == null || value === '' || (typeof value === 'string' && value.trim() === '')) {
      errors.push(`${label} is required`);
      return; // Skip other validations if missing
    }
  }

  // Skip further checks if no value
  if (value == null || value === '') return;

  const strValue = String(value);

  // String length checks
  if ('minLength' in field && field.minLength?.value != null) {
    if (strValue.length < field.minLength.value) {
      errors.push(`${label} must be at least ${field.minLength.value} characters`);
    }
  }

  if ('maxLength' in field && field.maxLength?.value != null) {
    if (field.fieldType !== 'array' && strValue.length > field.maxLength.value) {
      errors.push(`${label} must be at most ${field.maxLength.value} characters`);
    }
  }

  // Numeric range checks
  if (field.fieldType === 'integer' || field.fieldType === 'number') {
    const num = parseFloat(strValue);
    if (!isNaN(num)) {
      if ('minimumValue' in field && field.minimumValue?.value != null) {
        const min = field.minimumValue.value;
        if (field.exclusiveMinimum ? num <= min : num < min) {
          errors.push(`${label} must be ${field.exclusiveMinimum ? 'greater than' : 'at least'} ${min}`);
        }
      }
      if ('maximumValue' in field && field.maximumValue?.value != null) {
        const max = field.maximumValue.value;
        if (field.exclusiveMaximum ? num >= max : num > max) {
          errors.push(`${label} must be ${field.exclusiveMaximum ? 'less than' : 'at most'} ${max}`);
        }
      }
    }
  }

  // Pattern check
  if ('pattern' in field && field.pattern) {
    try {
      const regex = new RegExp(field.pattern);
      if (!regex.test(strValue)) {
        const msg =
          'patternErrorMessage' in field && field.patternErrorMessage
            ? field.patternErrorMessage
            : `${label} does not match the required pattern`;
        errors.push(msg);
      }
    } catch {
      // Invalid regex — skip
    }
  }
}
