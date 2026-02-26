import { v4 as uuidv4 } from 'uuid';
import type {
  FieldConfig,
  FieldType,
  ConditionalOperatorConfig,
  ExpressionConfig,
  ConditionConfig,
  ActionConfig,
  EnumOptionsConfig,
  DateTimeLimitConfig,
  ReferenceValueConfig,
  ToggleOperatorConfig,
  PairedOptionConfig,
  SignatureEntryConfig,
  MetadataEntryConfig,
  WidgetStyleConfig,
} from '@/types/schema';

// ---------------------------------------------------------------------------
// Public interface
// ---------------------------------------------------------------------------

export interface ParsedSchema {
  formName: string;
  formTitle: string;
  formDescription: string;
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
}

/**
 * Parse a raw JSON string (WorkflowEngine schema) into FieldConfig[] and
 * ConditionalOperatorConfig[], handling all 27 field types plus switch/toggle
 * operators.
 */
export function parseSchemaFromJson(json: string): ParsedSchema | null {
  let root: Record<string, unknown>;
  try {
    root = JSON.parse(json);
  } catch {
    return null;
  }

  // Detect wrapper format and extract the form definition object + name
  const detected = detectFormDefinition(root);
  if (!detected) return null;

  const { formName, definition } = detected;
  return parseFormDefinition(formName, definition);
}

// ---------------------------------------------------------------------------
// Top-level detection — 3 wrapper formats
// ---------------------------------------------------------------------------

interface DetectedForm {
  formName: string;
  definition: Record<string, unknown>;
}

function detectFormDefinition(root: Record<string, unknown>): DetectedForm | null {
  // Format 3: { data: { form_schema: { formDefinitions: { ... } } } }
  if (root.data && typeof root.data === 'object') {
    const data = root.data as Record<string, unknown>;
    const formSchema = data.form_schema as Record<string, unknown> | undefined;
    if (formSchema?.formDefinitions && typeof formSchema.formDefinitions === 'object') {
      const defs = formSchema.formDefinitions as Record<string, unknown>;
      const firstKey = Object.keys(defs)[0];
      if (firstKey && typeof defs[firstKey] === 'object') {
        return { formName: firstKey, definition: defs[firstKey] as Record<string, unknown> };
      }
    }
  }

  // Format 2: { type: "object", properties: {...} } — bare form
  if (root.type === 'object' && root.properties && typeof root.properties === 'object') {
    const name = typeof root.title === 'string'
      ? toCamelCase(root.title)
      : 'ImportedForm';
    return { formName: name, definition: root };
  }

  // Format 1: { "FormName": { type: "object", properties: {...} } }
  for (const key of Object.keys(root)) {
    const val = root[key];
    if (val && typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (obj.type === 'object' || obj.type === 'array') {
        return { formName: key, definition: obj };
      }
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Form definition parsing
// ---------------------------------------------------------------------------

function parseFormDefinition(formName: string, def: Record<string, unknown>): ParsedSchema {
  const formTitle = str(def.title) ?? formName;
  const formDescription = str(def.description) ?? '';

  // For array-type definitions, pull fields from items
  let source = def;
  if (def.type === 'array' && def.items && typeof def.items === 'object') {
    source = def.items as Record<string, unknown>;
  }

  const requiredSet = new Set(strArr(source.required));
  const hiddenSet = new Set(strArr(source.hidden));
  const uneditableSet = new Set(strArr(source.uneditable));

  const properties = source.properties as Record<string, unknown> | undefined;
  const fields: FieldConfig[] = [];
  if (properties) {
    for (const [widgetName, prop] of Object.entries(properties)) {
      if (!prop || typeof prop !== 'object') continue;
      const field = parseProperty(widgetName, prop as Record<string, unknown>, {
        required: requiredSet,
        hidden: hiddenSet,
        uneditable: uneditableSet,
      });
      if (field) fields.push(field);
    }
  }

  const switchOperators = parseSwitchOperators(source.switch ?? def.switch);

  return { formName, formTitle, formDescription, fields, switchOperators };
}

// ---------------------------------------------------------------------------
// Context propagated from parent to children
// ---------------------------------------------------------------------------

interface FieldContext {
  required: Set<string>;
  hidden: Set<string>;
  uneditable: Set<string>;
}

// ---------------------------------------------------------------------------
// Per-property parsing — type detection + field-specific extraction
// ---------------------------------------------------------------------------

function parseProperty(
  widgetName: string,
  prop: Record<string, unknown>,
  ctx: FieldContext,
): FieldConfig | null {
  const fieldType = detectFieldType(prop, widgetName, ctx);
  if (!fieldType) return null;

  const base = buildBase(widgetName, fieldType, prop, ctx);

  switch (fieldType) {
    case 'text':
      return parseText(base, prop);
    case 'integer':
    case 'number':
      return parseNumeric(base, prop);
    case 'boolean':
      return parseBoolean(base, prop);
    case 'checkbox':
      return parseCheckbox(base, prop);
    case 'radio':
      return parseRadio(base, prop);
    case 'dropdown':
      return parseDropdown(base, prop);
    case 'date':
    case 'dateCalendar':
      return parseDate(base, prop);
    case 'dateTime':
      return parseDateTime(base, prop);
    case 'time':
      return parseTime(base, prop);
    case 'hosClock':
      return parseHosClock(base, prop);
    case 'instruction':
      return parseInstruction(base, prop);
    case 'separator':
      return parseSeparator(base, prop);
    case 'calculation':
      return parseCalculation(base, prop);
    case 'evaluation':
      return parseEvaluation(base, prop);
    case 'photoCapture':
      return parsePhotoCapture(base, prop);
    case 'signature':
      return parseSignature(base, prop);
    case 'barcode':
      return parseBarcode(base, prop);
    case 'deepLink':
      return parseDeepLink(base, prop);
    case 'commodity':
      return parseCommodity(base, prop);
    case 'embedded':
      return parseEmbedded(base, prop);
    case 'metadata':
      return parseMetadata(base, prop);
    case 'object':
      return parseObject(base, prop);
    case 'array':
      return parseArray(base, prop);
    case 'description':
      return { ...base, fieldType: 'description' };
  }
}

// ---------------------------------------------------------------------------
// Type detection
// ---------------------------------------------------------------------------

function detectFieldType(
  prop: Record<string, unknown>,
  widgetName: string,
  ctx: FieldContext,
): FieldType | null {
  const type = str(prop.type);
  const format = str(prop.format);
  const fieldTypeHint = str(prop.field_type);
  const hasEnum = Array.isArray(prop.enum);
  const hasChoices = Array.isArray(prop.choices);

  // Special types (non-standard JSON Schema types used by WorkflowEngine)
  switch (type) {
    case 'instruction': return 'instruction';
    case 'calculation': return 'calculation';
    case 'evaluation': return 'evaluation';
    case 'commodity': return 'commodity';
    case 'deeplink_button': return 'deepLink';
    case 'embedded': return 'embedded';
    case 'metadata': return 'metadata';
    case 'media': return 'description';
  }

  if (type === 'string') {
    // Format-based types
    switch (format) {
      case 'date': return 'date';
      case 'date_calendar': return 'dateCalendar';
      case 'date_time': return 'dateTime';
      case 'hours_minutes': return 'time';
      case 'time': return 'hosClock';
      case 'separator': return 'separator';
      case 'signature': return 'signature';
      case 'barcode': return 'barcode';
      case 'photo_capture': return 'photoCapture';
    }

    // Explicit field_type hint
    if (fieldTypeHint === 'radio') return 'radio';
    if (fieldTypeHint === 'dropdown') return 'dropdown';

    // Enum/choices detection
    if (hasChoices) return 'dropdown';
    if (hasEnum) {
      const enumArr = prop.enum as unknown[];
      if (enumArr.length <= 2 && fieldTypeHint !== 'dropdown') return 'radio';
      return 'dropdown';
    }

    return 'text';
  }

  if (type === 'integer') return 'integer';
  if (type === 'number') return 'number';

  if (type === 'boolean') {
    // Required booleans render as radio (Yes/No); non-required as checkbox
    return ctx.required.has(widgetName) ? 'boolean' : 'checkbox';
  }

  if (type === 'object') return 'object';
  if (type === 'array') return 'array';

  return null;
}

// ---------------------------------------------------------------------------
// Base field config builder
// ---------------------------------------------------------------------------

function buildBase(
  widgetName: string,
  fieldType: FieldType,
  prop: Record<string, unknown>,
  ctx: FieldContext,
): {
  id: string;
  fieldType: FieldType;
  widgetName: string;
  title: string | null;
  description: string | null;
  isUneditable: boolean;
  isRequired: boolean;
  isHidden: boolean;
  widgetStyle: ReferenceValueConfig<WidgetStyleConfig> | null;
} {
  return {
    id: uuidv4(),
    fieldType,
    widgetName,
    title: str(prop.title) ?? null,
    description: str(prop.description) ?? null,
    isUneditable: ctx.uneditable.has(widgetName),
    isRequired: ctx.required.has(widgetName),
    isHidden: ctx.hidden.has(widgetName),
    widgetStyle: parseWidgetStyle(prop.widget_style),
  };
}

// ---------------------------------------------------------------------------
// Field type–specific parsers
// ---------------------------------------------------------------------------

function parseText(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'text',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    hint: str(prop.hint) ?? null,
    pattern: str(prop.pattern) ?? null,
    patternErrorMessage: str(prop.patternErrorMessage) ?? str(prop.pattern_error_message) ?? null,
    minLength: parseRefNumber(prop.minLength),
    maxLength: parseRefNumber(prop.maxLength),
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseNumeric(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: base.fieldType as 'integer' | 'number',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    hint: str(prop.hint) ?? null,
    pattern: str(prop.pattern) ?? null,
    patternErrorMessage: str(prop.patternErrorMessage) ?? str(prop.pattern_error_message) ?? null,
    minLength: parseRefNumber(prop.minLength),
    maxLength: parseRefNumber(prop.maxLength),
    minimumValue: parseRefNumber(prop.minimum),
    maximumValue: parseRefNumber(prop.maximum),
    exclusiveMinimum: prop.exclusiveMinimum === true,
    exclusiveMaximum: prop.exclusiveMaximum === true,
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseBoolean(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'boolean',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    enumOptions: parseEnumOptions(prop),
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseCheckbox(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'checkbox',
    defaultValue: prop.default === true || prop.default === 'true' ? true : prop.default === false || prop.default === 'false' ? false : null,
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseRadio(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'radio',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    enumOptions: parseEnumOptions(prop),
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseDropdown(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'dropdown',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    enumOptions: parseEnumOptions(prop),
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseDate(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  const isCalendar = str(prop.format) === 'date_calendar' || base.fieldType === 'dateCalendar';
  return {
    ...base,
    fieldType: isCalendar ? 'dateCalendar' : 'date',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    timeZoneId: str(prop.timezone) ?? str(prop.timeZoneId) ?? null,
    minLimitation: parseDateTimeLimitation(prop.minimum, prop.exclusiveMinimum === true),
    maxLimitation: parseDateTimeLimitation(prop.maximum, prop.exclusiveMaximum === true),
    isCalendarStyle: isCalendar,
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseDateTime(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'dateTime',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    timeZoneId: str(prop.timezone) ?? str(prop.timeZoneId) ?? null,
    minLimitation: parseDateTimeLimitation(prop.minimum, prop.exclusiveMinimum === true),
    maxLimitation: parseDateTimeLimitation(prop.maximum, prop.exclusiveMaximum === true),
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseTime(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'time',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    minLimitation: parseDateTimeLimitation(prop.minimum, prop.exclusiveMinimum === true),
    maxLimitation: parseDateTimeLimitation(prop.maximum, prop.exclusiveMaximum === true),
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseHosClock(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'hosClock',
    defaultValue: stringOrNull(prop.default),
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    minLimitation: parseDateTimeLimitation(prop.minimum, prop.exclusiveMinimum === true),
    maxLimitation: parseDateTimeLimitation(prop.maximum, prop.exclusiveMaximum === true),
    hosClockType: str(prop.hos_clock_type) ?? str(prop.hosClockType) ?? 'UNKNOWN_HOS_CLOCK',
    toggleOperators: parseToggleOperators(prop.toggle),
  };
}

function parseInstruction(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'instruction',
    stringFormatArgs: strArr(prop.stringFormatArgs) ?? strArr(prop.string_format_args) ?? [],
  };
}

function parseSeparator(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'separator',
    defaultValue: stringOrNull(prop.default),
  };
}

function parseCalculation(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'calculation',
    calculationFormula: str(prop.calculationFormula) ?? str(prop.calculation_formula) ?? str(prop.formula) ?? '',
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
    decimalPlaces: typeof prop.decimalPlaces === 'number' ? prop.decimalPlaces
      : typeof prop.decimal_places === 'number' ? prop.decimal_places : null,
  };
}

function parseEvaluation(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'evaluation',
    referenceToValue: str(prop.referenceToValue) ?? str(prop.reference_to_value) ?? '',
    referenceToDecreaseValue: str(prop.referenceToDecreaseValue) ?? str(prop.reference_to_decrease_value) ?? '',
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
  };
}

function parsePhotoCapture(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'photoCapture',
    minNumberOfPhotos: parseRefNumber(prop.minNumberOfPhotos ?? prop.min_number_of_photos),
    maxNumberOfPhotos: parseRefNumber(prop.maxNumberOfPhotos ?? prop.max_number_of_photos),
  };
}

function parseSignature(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  let signatureEntries: ReferenceValueConfig<SignatureEntryConfig[]> | null = null;
  const rawEntries = prop.signatureEntries ?? prop.signature_entries;
  if (rawEntries != null) {
    if (typeof rawEntries === 'string' && rawEntries.startsWith('$')) {
      signatureEntries = { value: null, reference: rawEntries };
    } else if (Array.isArray(rawEntries)) {
      const entries: SignatureEntryConfig[] = rawEntries
        .filter((e): e is Record<string, unknown> => e != null && typeof e === 'object')
        .map(e => ({ label: str(e.label) ?? '', value: str(e.value) ?? '' }));
      signatureEntries = { value: entries.length > 0 ? entries : null, reference: null };
    }
  }

  return {
    ...base,
    fieldType: 'signature',
    signatureEntries,
    signatureMessage: str(prop.signatureMessage) ?? str(prop.signature_message) ?? null,
  };
}

function parseBarcode(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'barcode',
    allowDuplicates: parseRefBoolean(prop.allowDuplicates ?? prop.allow_duplicates),
    minCharacters: parseRefNumber(prop.minCharacters ?? prop.min_characters),
    maxCharacters: parseRefNumber(prop.maxCharacters ?? prop.max_characters),
    minBarcodes: parseRefNumber(prop.minBarcodes ?? prop.min_barcodes),
    maxBarcodes: parseRefNumber(prop.maxBarcodes ?? prop.max_barcodes),
  };
}

function parseDeepLink(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  const deeplink = prop.deeplink ?? prop.deepLink ?? prop.deep_link;
  let deepLinkType: 'object' | 'url' = 'url';
  let deepLinkValue = '';

  if (typeof deeplink === 'string') {
    deepLinkValue = deeplink;
    deepLinkType = 'url';
  } else if (deeplink && typeof deeplink === 'object') {
    const dl = deeplink as Record<string, unknown>;
    if (dl.url && typeof dl.url === 'string') {
      deepLinkValue = dl.url;
      deepLinkType = 'url';
    } else if (dl.jsonString && typeof dl.jsonString === 'string') {
      deepLinkValue = dl.jsonString;
      deepLinkType = 'object';
    } else {
      deepLinkValue = JSON.stringify(deeplink);
      deepLinkType = 'object';
    }
  }

  return {
    ...base,
    fieldType: 'deepLink',
    label: str(prop.label) ?? str(prop.title) ?? 'Open',
    deepLinkType,
    deepLinkValue,
  };
}

function parseCommodity(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'commodity',
    commodityId: typeof prop.commodityId === 'number' ? prop.commodityId
      : typeof prop.commodity_id === 'number' ? prop.commodity_id : 0,
    parameterName: str(prop.parameterName) ?? str(prop.parameter_name) ?? null,
  };
}

function parseEmbedded(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  return {
    ...base,
    fieldType: 'embedded',
    referenceContainerId: str(prop.referenceContainerId) ?? str(prop.reference_container_id) ?? str(prop.ref) ?? '',
  };
}

function parseMetadata(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  const rawMetadata = prop.metadata;
  const entries: MetadataEntryConfig[] = [];
  if (Array.isArray(rawMetadata)) {
    for (const entry of rawMetadata) {
      if (entry && typeof entry === 'object') {
        const obj = entry as Record<string, unknown>;
        for (const [key, val] of Object.entries(obj)) {
          entries.push({ key, value: String(val ?? '') });
        }
      }
    }
  }

  return {
    ...base,
    fieldType: 'metadata',
    metadataId: str(prop.id) ?? str(prop.metadataId) ?? str(prop.metadata_id) ?? '',
    metadataEntries: entries,
  };
}

function parseObject(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  const requiredSet = new Set(strArr(prop.required));
  const hiddenSet = new Set(strArr(prop.hidden));
  const uneditableSet = new Set(strArr(prop.uneditable));
  const childCtx: FieldContext = { required: requiredSet, hidden: hiddenSet, uneditable: uneditableSet };

  const properties = prop.properties as Record<string, unknown> | undefined;
  const children: FieldConfig[] = [];
  if (properties) {
    for (const [name, child] of Object.entries(properties)) {
      if (!child || typeof child !== 'object') continue;
      const field = parseProperty(name, child as Record<string, unknown>, childCtx);
      if (field) children.push(field);
    }
  }

  const layout = str(prop.layout);
  const orientationType: 'horizontal' | 'vertical' =
    layout === 'horizontal' ? 'horizontal' : 'vertical';

  return {
    ...base,
    fieldType: 'object',
    children,
    switchOperators: parseSwitchOperators(prop.switch),
    orientationType,
  };
}

function parseArray(base: ReturnType<typeof buildBase>, prop: Record<string, unknown>): FieldConfig {
  const items = prop.items as Record<string, unknown> | undefined;
  const children: FieldConfig[] = [];
  let switchOperators: ConditionalOperatorConfig[] = [];

  if (items && typeof items === 'object') {
    const requiredSet = new Set(strArr(items.required));
    const hiddenSet = new Set(strArr(items.hidden));
    const uneditableSet = new Set(strArr(items.uneditable));
    const childCtx: FieldContext = { required: requiredSet, hidden: hiddenSet, uneditable: uneditableSet };

    const properties = items.properties as Record<string, unknown> | undefined;
    if (properties) {
      for (const [name, child] of Object.entries(properties)) {
        if (!child || typeof child !== 'object') continue;
        const field = parseProperty(name, child as Record<string, unknown>, childCtx);
        if (field) children.push(field);
      }
    }
    switchOperators = parseSwitchOperators(items.switch);
  }

  return {
    ...base,
    fieldType: 'array',
    children,
    switchOperators,
    minLength: parseRefNumber(prop.minLength ?? prop.minItems),
    maxLength: parseRefNumber(prop.maxLength ?? prop.maxItems),
    isFixed: prop.fixed === true || prop.isFixed === true,
  };
}

// ---------------------------------------------------------------------------
// Enum / Choices parsing
// ---------------------------------------------------------------------------

function parseEnumOptions(prop: Record<string, unknown>): EnumOptionsConfig | null {
  // choices: [[value, label], ...] or a reference string
  if (prop.choices !== undefined) {
    if (typeof prop.choices === 'string' && (prop.choices as string).startsWith('$')) {
      return {
        type: 'paired',
        options: { value: null, reference: prop.choices as string },
      };
    }
    if (Array.isArray(prop.choices)) {
      const arr = prop.choices as unknown[];
      if (arr.length === 0) {
        // Empty choices array — still a paired type (will be populated dynamically)
        return { type: 'paired', options: { value: [], reference: null } };
      }
      // Check if first element is an array (paired) or string (simple)
      if (Array.isArray(arr[0])) {
        const pairs: PairedOptionConfig[] = arr
          .filter(Array.isArray)
          .map((pair) => ({
            label: String((pair as unknown[])[1] ?? (pair as unknown[])[0] ?? ''),
            value: String((pair as unknown[])[0] ?? ''),
          }));
        return { type: 'paired', options: { value: pairs, reference: null } };
      }
    }
  }

  // enum: [val, ...] or a reference string
  if (prop.enum !== undefined) {
    if (typeof prop.enum === 'string' && (prop.enum as string).startsWith('$')) {
      return {
        type: 'simple',
        options: { value: null, reference: prop.enum as string },
      };
    }
    if (Array.isArray(prop.enum)) {
      const arr = (prop.enum as unknown[]).map(v => String(v ?? ''));
      return { type: 'simple', options: { value: arr, reference: null } };
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Date/Time limitation parsing
// ---------------------------------------------------------------------------

function parseDateTimeLimitation(
  val: unknown,
  isExclusive: boolean,
): DateTimeLimitConfig | null {
  if (val == null) return null;

  // Simple string: "current", ISO date, or reference "$..."
  if (typeof val === 'string') {
    return { type: 'simple', value: val, isExclusive: isExclusive || null };
  }

  // Complex object: { value: "current", increase: 20160 } or { value: "current", decrease: 20160 }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    const baseValue = str(obj.value) ?? 'current';

    const increase = typeof obj.increase === 'number' ? obj.increase : null;
    const decrease = typeof obj.decrease === 'number' ? obj.decrease : null;

    if (increase != null || decrease != null) {
      const minutes = increase ?? decrease ?? 0;
      const opType: 'plus' | 'minus' = increase != null ? 'plus' : 'minus';
      // Convert minutes to a dateTime offset
      const totalMinutes = minutes as number;
      const days = Math.floor(totalMinutes / (24 * 60));
      const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
      const mins = totalMinutes % 60;

      return {
        type: 'complex',
        value: baseValue,
        operator: {
          type: opType,
          dateOrTimeValue: days > 0
            ? { type: 'dateTime', years: 0, months: 0, days, hours, minutes: mins }
            : { type: 'time', hours, minutes: mins },
        },
        isExclusive: isExclusive || null,
      };
    }

    // Object with just value (no operator)
    return { type: 'simple', value: baseValue, isExclusive: isExclusive || null };
  }

  return null;
}

// ---------------------------------------------------------------------------
// Toggle operator parsing
// ---------------------------------------------------------------------------

function parseToggleOperators(toggle: unknown): ToggleOperatorConfig[] {
  if (!toggle || typeof toggle !== 'object') return [];

  // toggle: { "value1": ["widget1", "widget2"], "value2": ["widget3"] }
  if (!Array.isArray(toggle)) {
    const obj = toggle as Record<string, unknown>;
    const operators: ToggleOperatorConfig[] = [];
    for (const [key, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        operators.push({
          condition: { type: 'equalTo', value: key },
          accessToWidgets: val.map(v => String(v)),
        });
      }
    }
    return operators;
  }

  // toggle: [{ condition: {...}, accessToWidgets: [...] }, ...]
  return (toggle as unknown[])
    .filter((t): t is Record<string, unknown> => t != null && typeof t === 'object')
    .map(t => {
      const cond = t.condition as Record<string, unknown> | undefined;
      let condition: ToggleOperatorConfig['condition'];
      if (cond?.type === 'expression') {
        condition = {
          type: 'expression',
          comparison: (str(cond.comparison) as 'eq' | 'ne' | 'lt' | 'gt') ?? 'eq',
          referenceToWidget: str(cond.referenceToWidget) ?? '',
        };
      } else {
        condition = { type: 'equalTo', value: str(cond?.value) ?? '' };
      }
      return {
        condition,
        accessToWidgets: strArr(t.accessToWidgets) ?? [],
      };
    });
}

// ---------------------------------------------------------------------------
// Switch (conditional) operator parsing
// ---------------------------------------------------------------------------

function parseSwitchOperators(switchArr: unknown): ConditionalOperatorConfig[] {
  if (!Array.isArray(switchArr)) return [];
  return switchArr
    .filter((s): s is Record<string, unknown> => s != null && typeof s === 'object')
    .map(parseSingleSwitch);
}

function parseSingleSwitch(sw: Record<string, unknown>): ConditionalOperatorConfig {
  const id = uuidv4();

  // Parse expression (if block)
  const expression = parseExpression(sw.if);

  // Parse then actions
  const thenActions = parseActions(sw.then);

  // Parse else — could be actions or nested if/then/else
  let elseOperator: ConditionalOperatorConfig | null = null;
  let elseActions: ActionConfig[] | null = null;
  const containsBreak = sw.continue !== true;

  if (sw.else != null && typeof sw.else === 'object') {
    const elseBlock = sw.else as Record<string, unknown>;
    if (elseBlock.if) {
      // Nested else-if
      elseOperator = parseSingleSwitch(elseBlock);
    } else {
      // Else actions
      elseActions = parseActions(elseBlock);
    }
  }

  return { id, expression, thenActions, elseOperator, elseActions, containsBreak };
}

function parseExpression(ifBlock: unknown): ExpressionConfig {
  if (!ifBlock || typeof ifBlock !== 'object') {
    return { type: 'allOf', conditions: [] };
  }

  const obj = ifBlock as Record<string, unknown>;

  let conditionsArr: unknown[] = [];
  let expressionType: 'allOf' | 'anyOf' = 'allOf';

  if (Array.isArray(obj.allOf)) {
    conditionsArr = obj.allOf;
    expressionType = 'allOf';
  } else if (Array.isArray(obj.anyOf)) {
    conditionsArr = obj.anyOf;
    expressionType = 'anyOf';
  }

  const conditions: ConditionConfig[] = conditionsArr
    .filter((c): c is Record<string, unknown> => c != null && typeof c === 'object')
    .map(parseCondition);

  return { type: expressionType, conditions };
}

function parseCondition(condObj: Record<string, unknown>): ConditionConfig {
  // Format: { "$this.widgetName": { "eq": "value" } }
  const id = uuidv4();
  for (const [leftValue, comparison] of Object.entries(condObj)) {
    if (comparison && typeof comparison === 'object') {
      const comp = comparison as Record<string, unknown>;
      for (const [op, rightVal] of Object.entries(comp)) {
        const operator = op === 'eq' ? 'eq' : op === 'ne' ? 'ne' : op === 'gt' ? 'gt' : op === 'lt' ? 'lt' : 'eq';
        return { id, operator, leftValue, rightValue: String(rightVal ?? '') };
      }
    }
  }
  return { id, operator: 'eq', leftValue: '', rightValue: '' };
}

function parseActions(statement: unknown): ActionConfig[] {
  if (!statement || typeof statement !== 'object') return [];
  const obj = statement as Record<string, unknown>;
  const actions: ActionConfig[] = [];

  // show: string[]
  if (Array.isArray(obj.show)) {
    actions.push({ type: 'show', fields: obj.show.map(v => String(v)) });
  }

  // exclude: string[]
  if (Array.isArray(obj.exclude)) {
    actions.push({ type: 'exclude', fields: obj.exclude.map(v => String(v)) });
  }

  // setRequired: string[]
  if (Array.isArray(obj.setRequired)) {
    actions.push({ type: 'setRequired', fields: obj.setRequired.map(v => String(v)) });
  }

  // setValue: { widgetName: value, ... }
  if (obj.setValue && typeof obj.setValue === 'object' && !Array.isArray(obj.setValue)) {
    const setValueObj = obj.setValue as Record<string, unknown>;
    const values = Object.entries(setValueObj).map(([widgetAccess, value]) => ({
      widgetAccess,
      value: String(value ?? ''),
    }));
    if (values.length > 0) {
      actions.push({ type: 'setValue', values });
    }
  }

  // setObservableValue: { widgetName: "$reference", ... }
  if (obj.setObservableValue && typeof obj.setObservableValue === 'object' && !Array.isArray(obj.setObservableValue)) {
    const setObsObj = obj.setObservableValue as Record<string, unknown>;
    const widgetReferences = Object.entries(setObsObj).map(([widgetAccess, widgetReference]) => ({
      widgetAccess,
      widgetReference: String(widgetReference ?? ''),
    }));
    if (widgetReferences.length > 0) {
      actions.push({ type: 'setObservableValue', widgetReferences });
    }
  }

  // setEnum: { widgetName: "$reference" | string[], ... }
  if (obj.setEnum && typeof obj.setEnum === 'object' && !Array.isArray(obj.setEnum)) {
    const setEnumObj = obj.setEnum as Record<string, unknown>;
    const options = Object.entries(setEnumObj).map(([widgetAccess, val]) => ({
      widgetAccess,
      enumOptions: parseActionEnumValue(val),
    }));
    if (options.length > 0) {
      actions.push({ type: 'setEnum', options });
    }
  }

  // setChoices: { widgetName: "$reference" | [[val,label],...], ... }
  if (obj.setChoices && typeof obj.setChoices === 'object' && !Array.isArray(obj.setChoices)) {
    const setChoicesObj = obj.setChoices as Record<string, unknown>;
    const options = Object.entries(setChoicesObj).map(([widgetAccess, val]) => ({
      widgetAccess,
      enumOptions: parseActionEnumValue(val),
    }));
    if (options.length > 0) {
      actions.push({ type: 'setChoices', options });
    }
  }

  return actions;
}

function parseActionEnumValue(val: unknown): EnumOptionsConfig {
  if (typeof val === 'string' && val.startsWith('$')) {
    return { type: 'simple', options: { value: null, reference: val } };
  }
  if (Array.isArray(val)) {
    if (val.length > 0 && Array.isArray(val[0])) {
      // Paired: [[value, label], ...]
      const pairs: PairedOptionConfig[] = val
        .filter(Array.isArray)
        .map((pair) => ({
          label: String((pair as unknown[])[1] ?? (pair as unknown[])[0] ?? ''),
          value: String((pair as unknown[])[0] ?? ''),
        }));
      return { type: 'paired', options: { value: pairs, reference: null } };
    }
    // Simple: [val1, val2, ...]
    return { type: 'simple', options: { value: val.map(v => String(v)), reference: null } };
  }
  return { type: 'simple', options: { value: [], reference: null } };
}

// ---------------------------------------------------------------------------
// Reference value helpers
// ---------------------------------------------------------------------------

function parseRefNumber(val: unknown): ReferenceValueConfig<number> | null {
  if (val == null) return null;
  if (typeof val === 'string' && val.startsWith('$')) {
    return { value: null, reference: val };
  }
  if (typeof val === 'number') {
    return { value: val, reference: null };
  }
  if (typeof val === 'string') {
    const n = Number(val);
    if (!isNaN(n)) return { value: n, reference: null };
  }
  return null;
}

function parseRefBoolean(val: unknown): ReferenceValueConfig<boolean> | null {
  if (val == null) return null;
  if (typeof val === 'string' && val.startsWith('$')) {
    return { value: null, reference: val };
  }
  if (typeof val === 'boolean') {
    return { value: val, reference: null };
  }
  return null;
}

function parseWidgetStyle(val: unknown): ReferenceValueConfig<WidgetStyleConfig> | null {
  if (val == null) return null;
  if (typeof val === 'string' && val.startsWith('$')) {
    return { value: null, reference: val };
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    return {
      value: {
        backgroundColor: str(obj.backgroundColor) ?? str(obj.background_color) ?? '',
        textColor: str(obj.textColor) ?? str(obj.text_color) ?? '',
      },
      reference: null,
    };
  }
  return null;
}

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

function str(val: unknown): string | undefined {
  return typeof val === 'string' ? val : undefined;
}

function stringOrNull(val: unknown): string | null {
  if (val == null) return null;
  return String(val);
}

function strArr(val: unknown): string[] {
  if (!Array.isArray(val)) return [];
  return val.map(v => String(v));
}

function toCamelCase(s: string): string {
  return s
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, '');
}
