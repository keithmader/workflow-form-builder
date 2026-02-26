import type { FieldConfig, ConditionalOperatorConfig } from '@/types/schema';
import { fieldsToContainerConfig, containerConfigToFields } from '@/utils/widgetConfigMapper';
import { parseSchemaFromJson } from '@/utils/schemaParser';

export interface ParseSchemaResult {
  formName?: string;
  formTitle?: string;
  formDescription?: string;
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
}

let isReady = false;

export function isBuilderReady(): boolean {
  return isReady;
}

export function initBuilder(): boolean {
  try {
    if (typeof builderLib !== 'undefined' && builderLib?.com?.pltsci?.jsonschemalib?.builder) {
      isReady = true;
      return true;
    }
  } catch {
    // not loaded yet
  }
  isReady = false;
  return false;
}

export function buildSchema(
  fields: FieldConfig[],
  switchOperators: ConditionalOperatorConfig[],
): string | null {
  if (!isReady) return null;
  try {
    const container = fieldsToContainerConfig(fields, switchOperators);
    return builderLib.com.pltsci.jsonschemalib.builder.buildSchema(container);
  } catch (e) {
    console.error('buildSchema error:', e);
    return null;
  }
}

export function parseSchema(
  json: string,
): ParseSchemaResult | null {
  // Primary: pure TypeScript parser (handles all 27 field types)
  try {
    const result = parseSchemaFromJson(json);
    if (result && result.fields.length > 0) {
      return result;
    }
  } catch (e) {
    console.warn('schemaParser error, falling back to stub:', e);
  }

  // Fallback: stub builderLib
  if (!isReady) return null;
  try {
    const container = builderLib.com.pltsci.jsonschemalib.builder.buildWidgetConfigs(json, Date.now());
    if (!container) return null;
    return containerConfigToFields(container);
  } catch (e) {
    console.error('parseSchema error:', e);
    return null;
  }
}
