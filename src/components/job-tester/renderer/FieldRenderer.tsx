import type { FieldConfig, EnumOptionsConfig } from '@/types/schema';
import type { ConditionalState, ReferenceContext } from '@/types/jobTester';
import { TextInput } from './fields/TextInput';
import { NumericInput } from './fields/NumericInput';
import { BooleanInput } from './fields/BooleanInput';
import { RadioGroup } from './fields/RadioGroup';
import { DropdownSelect } from './fields/DropdownSelect';
import { DateTimeInput } from './fields/DateTimeInput';
import { ObjectGroup } from './fields/ObjectGroup';
import { ArrayRepeater } from './fields/ArrayRepeater';
import { ReadOnlyDisplay } from './fields/ReadOnlyDisplay';
import { StubField } from './fields/StubField';
import { isFieldRequired } from '@/utils/conditionalEngine';

interface FieldRendererProps {
  field: FieldConfig;
  values: Record<string, unknown>;
  onValueChange: (name: string, value: unknown) => void;
  context: ReferenceContext;
  conditionalState: ConditionalState;
}

export function FieldRenderer({
  field,
  values,
  onValueChange,
  context,
  conditionalState,
}: FieldRendererProps) {
  const value = values[field.widgetName];
  const strValue = value != null ? String(value) : '';
  const required = isFieldRequired(field, conditionalState);
  const enumOverride = conditionalState.enumOverrides.get(field.widgetName) as EnumOptionsConfig | undefined;

  // Read-only display types
  if (
    field.fieldType === 'separator' ||
    field.fieldType === 'instruction' ||
    field.fieldType === 'description'
  ) {
    return <ReadOnlyDisplay field={field} />;
  }

  // Stub types (device-only features)
  if (
    field.fieldType === 'signature' ||
    field.fieldType === 'photoCapture' ||
    field.fieldType === 'barcode' ||
    field.fieldType === 'deepLink' ||
    field.fieldType === 'commodity' ||
    field.fieldType === 'embedded' ||
    field.fieldType === 'metadata' ||
    field.fieldType === 'calculation' ||
    field.fieldType === 'evaluation'
  ) {
    return <StubField field={field} />;
  }

  // Label wrapper for input fields
  const label = field.title || field.widgetName;

  return (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {field.description && (
        <p className="text-xs text-muted-foreground">{field.description}</p>
      )}
      {renderInput(field, strValue, values, onValueChange, context, conditionalState, enumOverride)}
    </div>
  );
}

function renderInput(
  field: FieldConfig,
  strValue: string,
  values: Record<string, unknown>,
  onValueChange: (name: string, value: unknown) => void,
  context: ReferenceContext,
  conditionalState: ConditionalState,
  enumOverride?: EnumOptionsConfig,
) {
  switch (field.fieldType) {
    case 'text':
      return (
        <TextInput
          field={field}
          value={strValue}
          onChange={(v) => onValueChange(field.widgetName, v)}
        />
      );
    case 'integer':
    case 'number':
      return (
        <NumericInput
          field={field}
          value={strValue}
          onChange={(v) => onValueChange(field.widgetName, v)}
        />
      );
    case 'boolean':
    case 'checkbox':
      return (
        <BooleanInput
          field={field}
          value={values[field.widgetName]}
          onChange={(v) => onValueChange(field.widgetName, v)}
        />
      );
    case 'radio':
      return (
        <RadioGroup
          field={field}
          value={strValue}
          onChange={(v) => onValueChange(field.widgetName, v)}
          enumOverride={enumOverride}
        />
      );
    case 'dropdown':
      return (
        <DropdownSelect
          field={field}
          value={strValue}
          onChange={(v) => onValueChange(field.widgetName, v)}
          enumOverride={enumOverride}
        />
      );
    case 'date':
    case 'dateCalendar':
    case 'dateTime':
    case 'time':
    case 'hosClock':
      return (
        <DateTimeInput
          field={field}
          value={strValue}
          onChange={(v) => onValueChange(field.widgetName, v)}
        />
      );
    case 'object':
      return (
        <ObjectGroup
          field={field}
          values={values}
          onChange={onValueChange}
          context={context}
          conditionalState={conditionalState}
        />
      );
    case 'array':
      return (
        <ArrayRepeater
          field={field}
          values={values}
          onChange={onValueChange}
          context={context}
          conditionalState={conditionalState}
        />
      );
    default:
      return <StubField field={field} />;
  }
}
