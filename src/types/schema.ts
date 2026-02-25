export type FieldType =
  | 'text'
  | 'integer'
  | 'number'
  | 'boolean'
  | 'checkbox'
  | 'radio'
  | 'dropdown'
  | 'date'
  | 'dateCalendar'
  | 'dateTime'
  | 'time'
  | 'hosClock'
  | 'instruction'
  | 'separator'
  | 'calculation'
  | 'evaluation'
  | 'photoCapture'
  | 'signature'
  | 'barcode'
  | 'deepLink'
  | 'commodity'
  | 'embedded'
  | 'metadata'
  | 'object'
  | 'array'
  | 'description';

export interface ReferenceValueConfig<T> {
  value: T | null;
  reference: string | null;
}

export interface PairedOptionConfig {
  label: string;
  value: string;
}

export type EnumOptionsConfig =
  | { type: 'simple'; options: ReferenceValueConfig<string[]> }
  | { type: 'paired'; options: ReferenceValueConfig<PairedOptionConfig[]> };

export type DateTimeLimitConfig =
  | { type: 'simple'; value: string; isExclusive?: boolean | null }
  | { type: 'complex'; value: string; operator?: DateTimeOperatorConfig | null; isExclusive?: boolean | null };

export interface DateTimeOperatorConfig {
  type: 'plus' | 'minus';
  dateOrTimeValue: DateOrTimeValueConfig;
}

export type DateOrTimeValueConfig =
  | { type: 'date'; years: number; months: number; days: number }
  | { type: 'time'; hours: number; minutes: number }
  | { type: 'dateTime'; years: number; months: number; days: number; hours: number; minutes: number };

export interface ToggleOperatorConfig {
  condition: ToggleConditionConfig;
  accessToWidgets: string[];
}

export type ToggleConditionConfig =
  | { type: 'equalTo'; value: string }
  | { type: 'expression'; comparison: 'eq' | 'ne' | 'lt' | 'gt'; referenceToWidget: string };

export interface SignatureEntryConfig {
  label: string;
  value: string;
}

export interface MetadataEntryConfig {
  key: string;
  value: string;
}

export interface WidgetStyleConfig {
  backgroundColor: string;
  textColor: string;
}

// Base field config
interface BaseFieldConfig {
  id: string;
  fieldType: FieldType;
  widgetName: string;
  title: string | null;
  description: string | null;
  isUneditable: boolean;
  isRequired: boolean;
  isHidden: boolean;
  widgetStyle?: ReferenceValueConfig<WidgetStyleConfig> | null;
}

export interface TextFieldConfig extends BaseFieldConfig {
  fieldType: 'text';
  defaultValue: string | null;
  parameterName: string | null;
  hint: string | null;
  pattern: string | null;
  patternErrorMessage: string | null;
  minLength: ReferenceValueConfig<number> | null;
  maxLength: ReferenceValueConfig<number> | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface NumericFieldConfig extends BaseFieldConfig {
  fieldType: 'integer' | 'number';
  defaultValue: string | null;
  parameterName: string | null;
  hint: string | null;
  pattern: string | null;
  patternErrorMessage: string | null;
  minLength: ReferenceValueConfig<number> | null;
  maxLength: ReferenceValueConfig<number> | null;
  minimumValue: ReferenceValueConfig<number> | null;
  maximumValue: ReferenceValueConfig<number> | null;
  exclusiveMinimum: boolean;
  exclusiveMaximum: boolean;
  toggleOperators: ToggleOperatorConfig[];
}

export interface BooleanFieldConfig extends BaseFieldConfig {
  fieldType: 'boolean';
  defaultValue: string | null;
  parameterName: string | null;
  enumOptions: EnumOptionsConfig | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface CheckboxFieldConfig extends BaseFieldConfig {
  fieldType: 'checkbox';
  defaultValue: boolean | null;
  parameterName: string | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface RadioFieldConfig extends BaseFieldConfig {
  fieldType: 'radio';
  defaultValue: string | null;
  parameterName: string | null;
  enumOptions: EnumOptionsConfig | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface DropdownFieldConfig extends BaseFieldConfig {
  fieldType: 'dropdown';
  defaultValue: string | null;
  parameterName: string | null;
  enumOptions: EnumOptionsConfig | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface DateFieldConfig extends BaseFieldConfig {
  fieldType: 'date' | 'dateCalendar';
  defaultValue: string | null;
  parameterName: string | null;
  timeZoneId: string | null;
  minLimitation: DateTimeLimitConfig | null;
  maxLimitation: DateTimeLimitConfig | null;
  isCalendarStyle: boolean;
  toggleOperators: ToggleOperatorConfig[];
}

export interface DateTimeFieldConfig extends BaseFieldConfig {
  fieldType: 'dateTime';
  defaultValue: string | null;
  parameterName: string | null;
  timeZoneId: string | null;
  minLimitation: DateTimeLimitConfig | null;
  maxLimitation: DateTimeLimitConfig | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface TimeFieldConfig extends BaseFieldConfig {
  fieldType: 'time';
  defaultValue: string | null;
  parameterName: string | null;
  minLimitation: DateTimeLimitConfig | null;
  maxLimitation: DateTimeLimitConfig | null;
  toggleOperators: ToggleOperatorConfig[];
}

export interface HosClockFieldConfig extends BaseFieldConfig {
  fieldType: 'hosClock';
  defaultValue: string | null;
  parameterName: string | null;
  minLimitation: DateTimeLimitConfig | null;
  maxLimitation: DateTimeLimitConfig | null;
  hosClockType: string;
  toggleOperators: ToggleOperatorConfig[];
}

export interface InstructionFieldConfig extends BaseFieldConfig {
  fieldType: 'instruction';
  stringFormatArgs: string[];
}

export interface SeparatorFieldConfig extends BaseFieldConfig {
  fieldType: 'separator';
  defaultValue: string | null;
}

export interface CalculationFieldConfig extends BaseFieldConfig {
  fieldType: 'calculation';
  calculationFormula: string;
  parameterName: string | null;
  decimalPlaces: number | null;
}

export interface EvaluationFieldConfig extends BaseFieldConfig {
  fieldType: 'evaluation';
  referenceToValue: string;
  referenceToDecreaseValue: string;
  parameterName: string | null;
}

export interface PhotoCaptureFieldConfig extends BaseFieldConfig {
  fieldType: 'photoCapture';
  minNumberOfPhotos: ReferenceValueConfig<number> | null;
  maxNumberOfPhotos: ReferenceValueConfig<number> | null;
}

export interface SignatureFieldConfig extends BaseFieldConfig {
  fieldType: 'signature';
  signatureEntries: ReferenceValueConfig<SignatureEntryConfig[]> | null;
  signatureMessage: string | null;
}

export interface BarcodeFieldConfig extends BaseFieldConfig {
  fieldType: 'barcode';
  allowDuplicates: ReferenceValueConfig<boolean> | null;
  minCharacters: ReferenceValueConfig<number> | null;
  maxCharacters: ReferenceValueConfig<number> | null;
  minBarcodes: ReferenceValueConfig<number> | null;
  maxBarcodes: ReferenceValueConfig<number> | null;
}

export interface DeepLinkFieldConfig extends BaseFieldConfig {
  fieldType: 'deepLink';
  label: string;
  deepLinkType: 'object' | 'url';
  deepLinkValue: string;
}

export interface CommodityFieldConfig extends BaseFieldConfig {
  fieldType: 'commodity';
  commodityId: number;
  parameterName: string | null;
}

export interface EmbeddedFieldConfig extends BaseFieldConfig {
  fieldType: 'embedded';
  referenceContainerId: string;
}

export interface MetadataFieldConfig extends BaseFieldConfig {
  fieldType: 'metadata';
  metadataId: string;
  metadataEntries: MetadataEntryConfig[];
}

export interface ObjectFieldConfig extends BaseFieldConfig {
  fieldType: 'object';
  children: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  orientationType: 'horizontal' | 'vertical';
}

export interface ArrayFieldConfig extends BaseFieldConfig {
  fieldType: 'array';
  children: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  minLength: ReferenceValueConfig<number> | null;
  maxLength: ReferenceValueConfig<number> | null;
  isFixed: boolean;
}

export interface DescriptionFieldConfig extends BaseFieldConfig {
  fieldType: 'description';
}

export type FieldConfig =
  | TextFieldConfig
  | NumericFieldConfig
  | BooleanFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig
  | DropdownFieldConfig
  | DateFieldConfig
  | DateTimeFieldConfig
  | TimeFieldConfig
  | HosClockFieldConfig
  | InstructionFieldConfig
  | SeparatorFieldConfig
  | CalculationFieldConfig
  | EvaluationFieldConfig
  | PhotoCaptureFieldConfig
  | SignatureFieldConfig
  | BarcodeFieldConfig
  | DeepLinkFieldConfig
  | CommodityFieldConfig
  | EmbeddedFieldConfig
  | MetadataFieldConfig
  | ObjectFieldConfig
  | ArrayFieldConfig
  | DescriptionFieldConfig;

// Conditional operator configs
export interface ConditionalOperatorConfig {
  id: string;
  expression: ExpressionConfig;
  thenActions: ActionConfig[];
  elseOperator?: ConditionalOperatorConfig | null;
  elseActions?: ActionConfig[] | null;
  containsBreak: boolean;
}

export type ExpressionConfig =
  | { type: 'allOf'; conditions: ConditionConfig[] }
  | { type: 'anyOf'; conditions: ConditionConfig[] };

export interface ConditionConfig {
  id: string;
  operator: 'eq' | 'ne' | 'gt' | 'lt';
  leftValue: string;
  rightValue: string;
}

export type ActionConfig =
  | { type: 'show'; fields: string[] }
  | { type: 'exclude'; fields: string[] }
  | { type: 'setRequired'; fields: string[] }
  | { type: 'setValue'; values: { widgetAccess: string; value: string }[] }
  | { type: 'setObservableValue'; widgetReferences: { widgetAccess: string; widgetReference: string }[] }
  | { type: 'setEnum'; options: { widgetAccess: string; enumOptions: EnumOptionsConfig }[] }
  | { type: 'setChoices'; options: { widgetAccess: string; enumOptions: EnumOptionsConfig }[] };

// Field type categories for palette
export interface FieldTypeCategory {
  name: string;
  types: { type: FieldType; label: string; description: string }[];
}

export const FIELD_TYPE_CATEGORIES: FieldTypeCategory[] = [
  {
    name: 'Input',
    types: [
      { type: 'text', label: 'Text Input', description: 'Single-line text field' },
      { type: 'integer', label: 'Integer', description: 'Whole number input' },
      { type: 'number', label: 'Number', description: 'Decimal number input' },
    ],
  },
  {
    name: 'Selection',
    types: [
      { type: 'boolean', label: 'Boolean (Yes/No)', description: 'Yes/No radio selection' },
      { type: 'checkbox', label: 'Checkbox', description: 'True/false checkbox' },
      { type: 'radio', label: 'Radio Buttons', description: 'Single selection from options' },
      { type: 'dropdown', label: 'Dropdown', description: 'Dropdown selection' },
    ],
  },
  {
    name: 'Date & Time',
    types: [
      { type: 'date', label: 'Date', description: 'Date picker' },
      { type: 'dateCalendar', label: 'Calendar Date', description: 'Calendar-style date picker' },
      { type: 'dateTime', label: 'Date & Time', description: 'Date and time picker' },
      { type: 'time', label: 'Time', description: 'Time with timezone' },
      { type: 'hosClock', label: 'HOS Clock', description: 'Hours-of-service clock' },
    ],
  },
  {
    name: 'Layout',
    types: [
      { type: 'object', label: 'Object (Group)', description: 'Container for nested fields' },
      { type: 'array', label: 'Array (Repeating)', description: 'Repeating field group' },
      { type: 'separator', label: 'Separator', description: 'Visual divider' },
      { type: 'description', label: 'Description', description: 'Form description header' },
    ],
  },
  {
    name: 'Display',
    types: [
      { type: 'instruction', label: 'Instruction', description: 'Read-only formatted text' },
      { type: 'calculation', label: 'Calculation', description: 'Computed formula field' },
      { type: 'evaluation', label: 'Evaluation', description: 'Comparison of two fields' },
    ],
  },
  {
    name: 'Capture',
    types: [
      { type: 'photoCapture', label: 'Photo Capture', description: 'Take/attach photos' },
      { type: 'signature', label: 'Signature', description: 'Signature pad' },
      { type: 'barcode', label: 'Barcode Scanner', description: 'Scan barcodes' },
    ],
  },
  {
    name: 'Advanced',
    types: [
      { type: 'deepLink', label: 'Deep Link', description: 'Link to external app' },
      { type: 'commodity', label: 'Commodity', description: 'Commodity reference' },
      { type: 'embedded', label: 'Embedded Form', description: 'Reference to another form' },
      { type: 'metadata', label: 'Metadata', description: 'Hidden metadata mapping' },
    ],
  },
];
