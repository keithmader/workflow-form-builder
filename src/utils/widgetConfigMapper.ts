import type {
  FieldConfig,
  ConditionalOperatorConfig,
  EnumOptionsConfig,
  DateTimeLimitConfig,
  ReferenceValueConfig,
  ToggleOperatorConfig,
  ActionConfig,
  ConditionConfig,
  PairedOptionConfig,
  SignatureEntryConfig,
  MetadataEntryConfig,
} from '@/types/schema';
import { v4 as uuidv4 } from 'uuid';

type BuilderData = typeof builderLib.com.pltsci.jsonschemalib.builder.config.data;
type BuilderOperator = typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.operator;

function getData(): BuilderData {
  return builderLib.com.pltsci.jsonschemalib.builder.config.data;
}

function getOperator(): BuilderOperator {
  return builderLib.com.pltsci.jsonschemalib.builder.config.data.operator;
}

// ---- Internal → builderLib conversions ----

function toRefValue<T>(rv: ReferenceValueConfig<T> | null | undefined): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.ReferenceValue<T>> | null {
  if (!rv) return null;
  const data = getData();
  return new data.ReferenceValue(rv.value, rv.reference);
}

function toEnumOptions(eo: EnumOptionsConfig | null): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.EnumOptions> | null {
  if (!eo) return null;
  const data = getData();
  if (eo.type === 'simple') {
    return new data.SimpleEnumOptions(new data.ReferenceValue(eo.options.value, eo.options.reference));
  } else {
    const pairs = (eo.options.value ?? []).map(p => new data.PairedOption(p.label, p.value));
    return new data.PairedEnumOptions(new data.ReferenceValue(pairs, eo.options.reference));
  }
}

function toDateTimeLimitation(dtl: DateTimeLimitConfig | null): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.DateTimeLimitation> | null {
  if (!dtl) return null;
  const data = getData();
  if (dtl.type === 'simple') {
    return new data.SimpleDateTimeLimit(dtl.value, dtl.isExclusive ?? null);
  } else {
    let op = null;
    if (dtl.operator) {
      const dtv = dtl.operator.dateOrTimeValue;
      let dateOrTimeValue: InstanceType<typeof data.DateValue | typeof data.TimeValue | typeof data.DateTimeValue>;
      if (dtv.type === 'date') {
        dateOrTimeValue = new data.DateValue(dtv.years, dtv.months, dtv.days);
      } else if (dtv.type === 'time') {
        dateOrTimeValue = new data.TimeValue(dtv.hours, dtv.minutes);
      } else {
        dateOrTimeValue = new data.DateTimeValue(dtv.years, dtv.months, dtv.days, dtv.hours, dtv.minutes);
      }
      op = dtl.operator.type === 'plus' ? new data.Plus(dateOrTimeValue) : new data.Minus(dateOrTimeValue);
    }
    return new data.ComplexDateTimeLimit(dtl.value, op, dtl.isExclusive ?? null);
  }
}

function toToggleOperators(ops: ToggleOperatorConfig[]): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.operator.ToggleOperator>[] {
  const operator = getOperator();
  return ops.map(op => {
    let condition: InstanceType<typeof operator.ToggleCondition>;
    if (op.condition.type === 'equalTo') {
      condition = new operator.EqualTo(op.condition.value);
    } else {
      condition = new operator.ToggleExpression(op.condition.comparison, op.condition.referenceToWidget);
    }
    return new operator.ToggleOperator(condition, op.accessToWidgets);
  });
}

function toBaseWidget(field: FieldConfig): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.WidgetConfig> {
  const data = getData();
  return new data.WidgetConfig(
    field.widgetName,
    field.title,
    field.description,
    field.isUneditable,
    field.isRequired,
    field.isHidden,
    field.widgetStyle ? toRefValue(field.widgetStyle) : undefined,
  );
}

export function fieldToWidgetConfig(field: FieldConfig): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.WidgetConfig> {
  const data = getData();
  const base = toBaseWidget(field);

  switch (field.fieldType) {
    case 'description':
      return new data.DescriptionWidgetConfig(field.widgetName, field.description ?? '');

    case 'text':
      return new data.EditTextWidgetConfig(
        base, field.defaultValue, field.parameterName,
        field.hint, field.pattern, field.patternErrorMessage,
        toRefValue(field.minLength), toRefValue(field.maxLength),
        toToggleOperators(field.toggleOperators),
      );

    case 'integer':
    case 'number':
      return new data.NumericEditTextWidgetConfig(
        base, field.defaultValue, field.parameterName,
        field.hint, field.pattern, field.patternErrorMessage,
        toRefValue(field.minLength), toRefValue(field.maxLength),
        toToggleOperators(field.toggleOperators),
        field.fieldType === 'integer' ? data.NumericWidgetType.INTEGER : data.NumericWidgetType.NUMBER,
        toRefValue(field.minimumValue), toRefValue(field.maximumValue),
        field.exclusiveMinimum, field.exclusiveMaximum,
      );

    case 'boolean':
      return new data.BooleanWidgetConfig(
        base, field.defaultValue, field.parameterName,
        toEnumOptions(field.enumOptions),
        toToggleOperators(field.toggleOperators),
      );

    case 'checkbox':
      return new data.CheckBoxWidgetConfig(
        base, field.defaultValue, field.parameterName,
        toToggleOperators(field.toggleOperators),
      );

    case 'radio':
      return new data.RadioButtonWidgetConfig(
        base, field.defaultValue, field.parameterName,
        toEnumOptions(field.enumOptions),
        toToggleOperators(field.toggleOperators),
      );

    case 'dropdown':
      return new data.DropdownWidgetConfig(
        base, field.defaultValue, field.parameterName,
        toEnumOptions(field.enumOptions),
        toToggleOperators(field.toggleOperators),
      );

    case 'date':
    case 'dateCalendar':
      return new data.DateWidgetConfig(
        base, field.defaultValue, field.parameterName,
        field.timeZoneId,
        toDateTimeLimitation(field.minLimitation),
        toDateTimeLimitation(field.maxLimitation),
        field.isCalendarStyle,
        toToggleOperators(field.toggleOperators),
      );

    case 'dateTime':
      return new data.DateTimeWidgetConfig(
        base, field.defaultValue, field.parameterName,
        field.timeZoneId,
        toDateTimeLimitation(field.minLimitation),
        toDateTimeLimitation(field.maxLimitation),
        toToggleOperators(field.toggleOperators),
      );

    case 'time':
      return new data.TimeWidgetConfig(
        base, field.defaultValue, field.parameterName,
        toDateTimeLimitation(field.minLimitation),
        toDateTimeLimitation(field.maxLimitation),
        toToggleOperators(field.toggleOperators),
      );

    case 'hosClock':
      return new data.HosClockWidgetConfig(
        base, field.defaultValue, field.parameterName,
        toDateTimeLimitation(field.minLimitation),
        toDateTimeLimitation(field.maxLimitation),
        toToggleOperators(field.toggleOperators),
        field.hosClockType,
      );

    case 'instruction':
      return new data.InstructionWidgetConfig(base, field.stringFormatArgs);

    case 'separator':
      return new data.SeparatorWidgetConfig(base, field.defaultValue);

    case 'calculation':
      return new data.CalculationWidgetConfig(
        base, field.calculationFormula, field.parameterName, field.decimalPlaces,
      );

    case 'evaluation':
      return new data.EvaluationWidgetConfig(
        base, field.referenceToValue, field.referenceToDecreaseValue, field.parameterName,
      );

    case 'photoCapture':
      return new data.PhotoCaptureWidgetConfig(
        base, toRefValue(field.minNumberOfPhotos), toRefValue(field.maxNumberOfPhotos),
      );

    case 'signature': {
      let entries = null;
      if (field.signatureEntries) {
        const entryArr = (field.signatureEntries.value ?? []).map(
          e => new data.SignatureEntry(e.label, e.value)
        );
        entries = new data.ReferenceValue(
          entryArr.length > 0 ? entryArr : null,
          field.signatureEntries.reference,
        );
      }
      return new data.SignatureWidgetConfig(base, entries, field.signatureMessage);
    }

    case 'barcode':
      return new data.BarcodeWidgetConfig(
        base,
        toRefValue(field.allowDuplicates),
        toRefValue(field.minCharacters),
        toRefValue(field.maxCharacters),
        toRefValue(field.minBarcodes),
        toRefValue(field.maxBarcodes),
      );

    case 'deepLink': {
      const dl = field.deepLinkType === 'object'
        ? new data.DeepLinkObject(field.deepLinkValue)
        : new data.DeepLinkUrl(field.deepLinkValue);
      return new data.DeepLinkWidgetConfig(base, field.label, dl);
    }

    case 'commodity':
      return new data.CommodityWidgetConfig(base, field.commodityId, field.parameterName);

    case 'embedded':
      return new data.EmbeddedWidgetConfig(base, field.referenceContainerId);

    case 'metadata': {
      const entries = field.metadataEntries.map(e => new data.MetadataEntry(e.key, e.value));
      return new data.MetadataWidgetConfig(base, field.metadataId, entries);
    }

    case 'object': {
      const childConfigs = field.children.map(c => fieldToWidgetConfig(c));
      const switchOps = field.switchOperators.map(s => conditionalOperatorToBuilder(s));
      const orientation = field.orientationType === 'horizontal'
        ? data.WidgetOrientationType.HORIZONTAL_ORIENTATION
        : data.WidgetOrientationType.VERTICAL_ORIENTATION;
      return new data.ObjectWidgetConfig(base, childConfigs, switchOps, orientation);
    }

    case 'array': {
      const childConfigs = field.children.map(c => fieldToWidgetConfig(c));
      const switchOps = field.switchOperators.map(s => conditionalOperatorToBuilder(s));
      return new data.ArrayWidgetConfig(
        base, childConfigs, switchOps,
        toRefValue(field.minLength), toRefValue(field.maxLength), field.isFixed,
      );
    }
  }
}

function actionsToBuilder(actions: ActionConfig[]): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.operator.StatementAction>[] {
  const op = getOperator();
  const data = getData();
  return actions.map(a => {
    switch (a.type) {
      case 'show': return new op.Show(a.fields);
      case 'exclude': return new op.Exclude(a.fields);
      case 'setRequired': return new op.SetRequired(a.fields);
      case 'setValue': return new op.SetValue(a.values.map(v => new op.ValueInfo(v.widgetAccess, v.value)));
      case 'setObservableValue': return new op.SetObservableValue(a.widgetReferences.map(w => new op.WidgetReferenceInfo(w.widgetAccess, w.widgetReference)));
      case 'setEnum': return new op.SetEnumOptions(a.options.map(o => new op.EnumOptionsInfo(o.widgetAccess, toEnumOptions(o.enumOptions)!)));
      case 'setChoices': return new op.SetChoiceOptions(a.options.map(o => new op.EnumOptionsInfo(o.widgetAccess, toEnumOptions(o.enumOptions)!)));
    }
  });
}

export function conditionalOperatorToBuilder(co: ConditionalOperatorConfig): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.operator.ConditionalOperator> {
  const op = getOperator();

  const conditions = co.expression.conditions.map(c => {
    switch (c.operator) {
      case 'eq': return new op.Equal(c.leftValue, c.rightValue);
      case 'ne': return new op.NotEqual(c.leftValue, c.rightValue);
      case 'gt': return new op.GreaterThan(c.leftValue, c.rightValue);
      case 'lt': return new op.LessThan(c.leftValue, c.rightValue);
    }
  });

  const expression = co.expression.type === 'allOf'
    ? new op.AllOf(conditions)
    : new op.AnyOf(conditions);

  const thenStatement = new op.Actions(actionsToBuilder(co.thenActions));

  let elseStatement = null;
  if (co.elseOperator) {
    elseStatement = new op.NestedOperator(conditionalOperatorToBuilder(co.elseOperator));
  } else if (co.elseActions && co.elseActions.length > 0) {
    elseStatement = new op.Actions(actionsToBuilder(co.elseActions));
  }

  return new op.ConditionalOperator(expression, thenStatement, elseStatement, co.containsBreak);
}

export function fieldsToContainerConfig(
  fields: FieldConfig[],
  switchOperators: ConditionalOperatorConfig[],
): InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.WidgetContainerConfig> {
  const data = getData();
  const widgetConfigs = fields.map(f => fieldToWidgetConfig(f));
  const switchOps = switchOperators.map(s => conditionalOperatorToBuilder(s));
  return new data.WidgetContainerConfig(widgetConfigs, switchOps);
}

// ---- builderLib → Internal conversions ----

function fromRefValue<T>(rv: { value: T | null; reference: string | null } | null | undefined): ReferenceValueConfig<T> | null {
  if (!rv) return null;
  return { value: rv.value ?? null, reference: rv.reference ?? null };
}

function fromEnumOptions(eo: unknown): EnumOptionsConfig | null {
  if (!eo) return null;
  const data = getData();
  if (eo instanceof data.SimpleEnumOptions) {
    return {
      type: 'simple',
      options: {
        value: eo.options?.value ? Array.from(eo.options.value) : null,
        reference: eo.options?.reference ?? null,
      },
    };
  } else if (eo instanceof data.PairedEnumOptions) {
    const pairs: PairedOptionConfig[] = eo.options?.value
      ? Array.from(eo.options.value).map((p: { label: string; value: string }) => ({ label: p.label, value: p.value }))
      : [];
    return {
      type: 'paired',
      options: {
        value: pairs.length > 0 ? pairs : null,
        reference: eo.options?.reference ?? null,
      },
    };
  }
  return null;
}

function fromDateTimeLimitation(dtl: unknown): DateTimeLimitConfig | null {
  if (!dtl) return null;
  const data = getData();
  if (dtl instanceof data.SimpleDateTimeLimit) {
    return { type: 'simple', value: dtl.value, isExclusive: dtl.isExclusive };
  } else if (dtl instanceof data.ComplexDateTimeLimit) {
    let operator = null;
    if (dtl.operator) {
      const op = dtl.operator;
      const isPlus = op instanceof data.Plus;
      const dtv = (op as { dateOrTimeValue: unknown }).dateOrTimeValue;
      let dateOrTimeValue;
      if (dtv instanceof data.DateTimeValue) {
        dateOrTimeValue = { type: 'dateTime' as const, years: dtv.years, months: dtv.months, days: dtv.days, hours: dtv.hours, minutes: dtv.minutes };
      } else if (dtv instanceof data.DateValue) {
        dateOrTimeValue = { type: 'date' as const, years: dtv.years, months: dtv.months, days: dtv.days };
      } else if (dtv instanceof data.TimeValue) {
        dateOrTimeValue = { type: 'time' as const, hours: (dtv as { hours: number }).hours, minutes: (dtv as { minutes: number }).minutes };
      } else {
        return { type: 'simple', value: (dtl as { value: string }).value, isExclusive: (dtl as { isExclusive: boolean | null }).isExclusive };
      }
      operator = { type: isPlus ? 'plus' as const : 'minus' as const, dateOrTimeValue };
    }
    return { type: 'complex', value: dtl.value, operator, isExclusive: dtl.isExclusive };
  }
  return null;
}

function fromToggleOperators(ops: unknown[] | null | undefined): ToggleOperatorConfig[] {
  if (!ops) return [];
  const operator = getOperator();
  return Array.from(ops).map((op: unknown) => {
    const top = op as { condition: unknown; accessToWidgets: string[] };
    let condition;
    if (top.condition instanceof operator.EqualTo) {
      condition = { type: 'equalTo' as const, value: top.condition.value };
    } else if (top.condition instanceof operator.ToggleExpression) {
      condition = { type: 'expression' as const, comparison: top.condition.comparison as 'eq' | 'ne' | 'lt' | 'gt', referenceToWidget: top.condition.referenceToWidget };
    } else {
      condition = { type: 'equalTo' as const, value: '' };
    }
    return { condition, accessToWidgets: Array.from(top.accessToWidgets) };
  });
}

export function widgetConfigToField(wc: unknown): FieldConfig {
  const data = getData();
  const id = uuidv4();
  const w = wc as Record<string, unknown>;
  const widgetName = (w.widgetName as string) ?? '';
  const title = (w.title as string) ?? null;
  const description = (w.description as string) ?? null;
  const isUneditable = (w.isUneditable as boolean) ?? false;
  const isRequired = (w.isRequired as boolean) ?? false;
  const isHidden = (w.isHidden as boolean) ?? false;

  const base = { id, widgetName, title, description, isUneditable, isRequired, isHidden };

  if (wc instanceof data.DescriptionWidgetConfig) {
    return { ...base, fieldType: 'description' };
  }

  if (wc instanceof data.NumericEditTextWidgetConfig) {
    const n = wc as InstanceType<typeof data.NumericEditTextWidgetConfig>;
    const isInteger = n.type === data.NumericWidgetType.INTEGER;
    return {
      ...base,
      fieldType: isInteger ? 'integer' : 'number',
      defaultValue: n.defaultValue ?? null,
      parameterName: n.parameterName ?? null,
      hint: n.hint ?? null,
      pattern: n.pattern ?? null,
      patternErrorMessage: n.patternErrorMessage ?? null,
      minLength: fromRefValue(n.minLength),
      maxLength: fromRefValue(n.maxLength),
      minimumValue: fromRefValue(n.minimumValue),
      maximumValue: fromRefValue(n.maximumValue),
      exclusiveMinimum: n.exclusiveMinimum ?? false,
      exclusiveMaximum: n.exclusiveMaximum ?? false,
      toggleOperators: fromToggleOperators(n.toggleOperators),
    };
  }

  if (wc instanceof data.EditTextWidgetConfig) {
    const e = wc as InstanceType<typeof data.EditTextWidgetConfig>;
    return {
      ...base,
      fieldType: 'text',
      defaultValue: e.defaultValue ?? null,
      parameterName: e.parameterName ?? null,
      hint: e.hint ?? null,
      pattern: e.pattern ?? null,
      patternErrorMessage: e.patternErrorMessage ?? null,
      minLength: fromRefValue(e.minLength),
      maxLength: fromRefValue(e.maxLength),
      toggleOperators: fromToggleOperators(e.toggleOperators),
    };
  }

  if (wc instanceof data.BooleanWidgetConfig) {
    const b = wc as InstanceType<typeof data.BooleanWidgetConfig>;
    return {
      ...base,
      fieldType: 'boolean',
      defaultValue: b.defaultValue ?? null,
      parameterName: b.parameterName ?? null,
      enumOptions: fromEnumOptions(b.enumOptions),
      toggleOperators: fromToggleOperators(b.toggleOperators),
    };
  }

  if (wc instanceof data.CheckBoxWidgetConfig) {
    const c = wc as InstanceType<typeof data.CheckBoxWidgetConfig>;
    return {
      ...base,
      fieldType: 'checkbox',
      defaultValue: c.defaultValue ?? null,
      parameterName: c.parameterName ?? null,
      toggleOperators: fromToggleOperators(c.toggleOperators),
    };
  }

  if (wc instanceof data.RadioButtonWidgetConfig) {
    const r = wc as InstanceType<typeof data.RadioButtonWidgetConfig>;
    return {
      ...base,
      fieldType: 'radio',
      defaultValue: r.defaultValue ?? null,
      parameterName: r.parameterName ?? null,
      enumOptions: fromEnumOptions(r.enumOptions),
      toggleOperators: fromToggleOperators(r.toggleOperators),
    };
  }

  if (wc instanceof data.DropdownWidgetConfig) {
    const d = wc as InstanceType<typeof data.DropdownWidgetConfig>;
    return {
      ...base,
      fieldType: 'dropdown',
      defaultValue: d.defaultValue ?? null,
      parameterName: d.parameterName ?? null,
      enumOptions: fromEnumOptions(d.enumOptions),
      toggleOperators: fromToggleOperators(d.toggleOperators),
    };
  }

  if (wc instanceof data.DateTimeWidgetConfig) {
    const dt = wc as InstanceType<typeof data.DateTimeWidgetConfig>;
    return {
      ...base,
      fieldType: 'dateTime',
      defaultValue: dt.defaultValue ?? null,
      parameterName: dt.parameterName ?? null,
      timeZoneId: dt.timeZoneId ?? null,
      minLimitation: fromDateTimeLimitation(dt.minLimitation),
      maxLimitation: fromDateTimeLimitation(dt.maxLimitation),
      toggleOperators: fromToggleOperators(dt.toggleOperators),
    };
  }

  if (wc instanceof data.HosClockWidgetConfig) {
    const h = wc as InstanceType<typeof data.HosClockWidgetConfig>;
    return {
      ...base,
      fieldType: 'hosClock',
      defaultValue: h.defaultValue ?? null,
      parameterName: h.parameterName ?? null,
      minLimitation: fromDateTimeLimitation(h.minLimitation),
      maxLimitation: fromDateTimeLimitation(h.maxLimitation),
      hosClockType: h.hosClockType ?? 'UNKNOWN_HOS_CLOCK',
      toggleOperators: fromToggleOperators(h.toggleOperators),
    };
  }

  if (wc instanceof data.DateWidgetConfig) {
    const d = wc as InstanceType<typeof data.DateWidgetConfig>;
    return {
      ...base,
      fieldType: d.isCalendarStyle ? 'dateCalendar' : 'date',
      defaultValue: d.defaultValue ?? null,
      parameterName: d.parameterName ?? null,
      timeZoneId: d.timeZoneId ?? null,
      minLimitation: fromDateTimeLimitation(d.minLimitation),
      maxLimitation: fromDateTimeLimitation(d.maxLimitation),
      isCalendarStyle: d.isCalendarStyle ?? false,
      toggleOperators: fromToggleOperators(d.toggleOperators),
    };
  }

  if (wc instanceof data.TimeWidgetConfig) {
    const t = wc as InstanceType<typeof data.TimeWidgetConfig>;
    return {
      ...base,
      fieldType: 'time',
      defaultValue: t.defaultValue ?? null,
      parameterName: t.parameterName ?? null,
      minLimitation: fromDateTimeLimitation(t.minLimitation),
      maxLimitation: fromDateTimeLimitation(t.maxLimitation),
      toggleOperators: fromToggleOperators(t.toggleOperators),
    };
  }

  if (wc instanceof data.InstructionWidgetConfig) {
    const i = wc as InstanceType<typeof data.InstructionWidgetConfig>;
    return {
      ...base,
      fieldType: 'instruction',
      stringFormatArgs: i.stringFormatArgs ? Array.from(i.stringFormatArgs) : [],
    };
  }

  if (wc instanceof data.SeparatorWidgetConfig) {
    const s = wc as InstanceType<typeof data.SeparatorWidgetConfig>;
    return { ...base, fieldType: 'separator', defaultValue: s.defaultValue ?? null };
  }

  if (wc instanceof data.CalculationWidgetConfig) {
    const c = wc as InstanceType<typeof data.CalculationWidgetConfig>;
    return {
      ...base,
      fieldType: 'calculation',
      calculationFormula: c.calculationFormula ?? '',
      parameterName: c.parameterName ?? null,
      decimalPlaces: c.decimalPlaces ?? null,
    };
  }

  if (wc instanceof data.EvaluationWidgetConfig) {
    const e = wc as InstanceType<typeof data.EvaluationWidgetConfig>;
    return {
      ...base,
      fieldType: 'evaluation',
      referenceToValue: e.referenceToValue ?? '',
      referenceToDecreaseValue: e.referenceToDecreaseValue ?? '',
      parameterName: e.parameterName ?? null,
    };
  }

  if (wc instanceof data.PhotoCaptureWidgetConfig) {
    const p = wc as InstanceType<typeof data.PhotoCaptureWidgetConfig>;
    return {
      ...base,
      fieldType: 'photoCapture',
      minNumberOfPhotos: fromRefValue(p.minNumberOfPhotos),
      maxNumberOfPhotos: fromRefValue(p.maxNumberOfPhotos),
    };
  }

  if (wc instanceof data.SignatureWidgetConfig) {
    const s = wc as InstanceType<typeof data.SignatureWidgetConfig>;
    let signatureEntries: ReferenceValueConfig<SignatureEntryConfig[]> | null = null;
    if (s.signatureEntries) {
      const entries = s.signatureEntries.value
        ? Array.from(s.signatureEntries.value).map((e: { label: string; value: string }) => ({ label: e.label, value: e.value }))
        : null;
      signatureEntries = { value: entries, reference: s.signatureEntries.reference ?? null };
    }
    return {
      ...base,
      fieldType: 'signature',
      signatureEntries,
      signatureMessage: s.signatureMessage ?? null,
    };
  }

  if (wc instanceof data.BarcodeWidgetConfig) {
    const b = wc as InstanceType<typeof data.BarcodeWidgetConfig>;
    return {
      ...base,
      fieldType: 'barcode',
      allowDuplicates: fromRefValue(b.allowDuplicates),
      minCharacters: fromRefValue(b.minCharacters),
      maxCharacters: fromRefValue(b.maxCharacters),
      minBarcodes: fromRefValue(b.minBarcodes),
      maxBarcodes: fromRefValue(b.maxBarcodes),
    };
  }

  if (wc instanceof data.DeepLinkWidgetConfig) {
    const d = wc as InstanceType<typeof data.DeepLinkWidgetConfig>;
    const isObj = d.deepLink instanceof data.DeepLinkObject;
    return {
      ...base,
      fieldType: 'deepLink',
      label: d.label ?? 'Open',
      deepLinkType: isObj ? 'object' : 'url',
      deepLinkValue: isObj ? (d.deepLink as InstanceType<typeof data.DeepLinkObject>).jsonString : (d.deepLink as InstanceType<typeof data.DeepLinkUrl>).url,
    };
  }

  if (wc instanceof data.CommodityWidgetConfig) {
    const c = wc as InstanceType<typeof data.CommodityWidgetConfig>;
    return {
      ...base,
      fieldType: 'commodity',
      commodityId: c.commodityId ?? 0,
      parameterName: c.parameterName ?? null,
    };
  }

  if (wc instanceof data.EmbeddedWidgetConfig) {
    const e = wc as InstanceType<typeof data.EmbeddedWidgetConfig>;
    return {
      ...base,
      fieldType: 'embedded',
      referenceContainerId: e.referenceContainerId ?? '',
    };
  }

  if (wc instanceof data.MetadataWidgetConfig) {
    const m = wc as InstanceType<typeof data.MetadataWidgetConfig>;
    const entries: MetadataEntryConfig[] = m.metadataEntries
      ? Array.from(m.metadataEntries).map((e: { key: string; value: string }) => ({ key: e.key, value: e.value }))
      : [];
    return {
      ...base,
      fieldType: 'metadata',
      metadataId: m.metadataId ?? '',
      metadataEntries: entries,
    };
  }

  if (wc instanceof data.ArrayWidgetConfig) {
    const a = wc as InstanceType<typeof data.ArrayWidgetConfig>;
    return {
      ...base,
      fieldType: 'array',
      children: a.widgetConfigs ? Array.from(a.widgetConfigs).map(widgetConfigToField) : [],
      switchOperators: a.switchOperators ? Array.from(a.switchOperators).map(conditionalOperatorFromBuilder) : [],
      minLength: fromRefValue(a.minLength),
      maxLength: fromRefValue(a.maxLength),
      isFixed: a.isFixed ?? false,
    };
  }

  if (wc instanceof data.ObjectWidgetConfig) {
    const o = wc as InstanceType<typeof data.ObjectWidgetConfig>;
    return {
      ...base,
      fieldType: 'object',
      children: o.widgetConfigs ? Array.from(o.widgetConfigs).map(widgetConfigToField) : [],
      switchOperators: o.switchOperators ? Array.from(o.switchOperators).map(conditionalOperatorFromBuilder) : [],
      orientationType: o.orientationType === data.WidgetOrientationType.HORIZONTAL_ORIENTATION ? 'horizontal' : 'vertical',
    };
  }

  // Fallback: treat as text
  return {
    ...base,
    fieldType: 'text',
    defaultValue: null,
    parameterName: null,
    hint: null,
    pattern: null,
    patternErrorMessage: null,
    minLength: null,
    maxLength: null,
    toggleOperators: [],
  };
}

function conditionFromBuilder(c: unknown): ConditionConfig {
  const op = getOperator();
  const id = uuidv4();
  if (c instanceof op.Equal) return { id, operator: 'eq', leftValue: c.leftValue, rightValue: String(c.rightValue) };
  if (c instanceof op.NotEqual) return { id, operator: 'ne', leftValue: c.leftValue, rightValue: String(c.rightValue) };
  if (c instanceof op.GreaterThan) return { id, operator: 'gt', leftValue: c.leftValue, rightValue: String(c.rightValue) };
  if (c instanceof op.LessThan) return { id, operator: 'lt', leftValue: c.leftValue, rightValue: String(c.rightValue) };
  return { id, operator: 'eq', leftValue: '', rightValue: '' };
}

function actionsFromBuilder(actions: unknown[]): ActionConfig[] {
  const op = getOperator();
  return actions.map((a: unknown) => {
    if (a instanceof op.Show) return { type: 'show' as const, fields: Array.from(a.accessToWidgets) };
    if (a instanceof op.Exclude) return { type: 'exclude' as const, fields: Array.from(a.accessToWidgets) };
    if (a instanceof op.SetRequired) return { type: 'setRequired' as const, fields: Array.from(a.accessToWidgets) };
    if (a instanceof op.SetValue) {
      return { type: 'setValue' as const, values: Array.from(a.values).map((v: { widgetAccess: string; value: unknown }) => ({ widgetAccess: v.widgetAccess, value: String(v.value) })) };
    }
    if (a instanceof op.SetObservableValue) {
      return { type: 'setObservableValue' as const, widgetReferences: Array.from(a.widgetReferences).map((w: { widgetAccess: string; widgetReference: string }) => ({ widgetAccess: w.widgetAccess, widgetReference: w.widgetReference })) };
    }
    if (a instanceof op.SetEnumOptions) {
      return { type: 'setEnum' as const, options: Array.from(a.options).map((o: { widgetAccess: string; enumOptions: unknown }) => ({ widgetAccess: o.widgetAccess, enumOptions: fromEnumOptions(o.enumOptions)! })) };
    }
    if (a instanceof op.SetChoiceOptions) {
      return { type: 'setChoices' as const, options: Array.from(a.options).map((o: { widgetAccess: string; enumOptions: unknown }) => ({ widgetAccess: o.widgetAccess, enumOptions: fromEnumOptions(o.enumOptions)! })) };
    }
    return { type: 'show' as const, fields: [] };
  });
}

export function conditionalOperatorFromBuilder(co: unknown): ConditionalOperatorConfig {
  const op = getOperator();
  const cond = co as InstanceType<typeof op.ConditionalOperator>;
  const id = uuidv4();

  let expression;
  if (cond.expression instanceof op.AllOf) {
    expression = { type: 'allOf' as const, conditions: Array.from(cond.expression.conditions).map(conditionFromBuilder) };
  } else {
    expression = { type: 'anyOf' as const, conditions: Array.from((cond.expression as InstanceType<typeof op.AnyOf>).conditions).map(conditionFromBuilder) };
  }

  let thenActions: ActionConfig[] = [];
  if (cond.thenStatement instanceof op.Actions) {
    thenActions = actionsFromBuilder(Array.from(cond.thenStatement.statementActions));
  }

  let elseOperator: ConditionalOperatorConfig | null = null;
  let elseActions: ActionConfig[] | null = null;
  if (cond.elseStatement) {
    if (cond.elseStatement instanceof op.NestedOperator) {
      elseOperator = conditionalOperatorFromBuilder(cond.elseStatement.operator);
    } else if (cond.elseStatement instanceof op.Actions) {
      elseActions = actionsFromBuilder(Array.from(cond.elseStatement.statementActions));
    }
  }

  return {
    id,
    expression,
    thenActions,
    elseOperator,
    elseActions,
    containsBreak: cond.containsBreak ?? false,
  };
}

export function containerConfigToFields(
  container: InstanceType<typeof builderLib.com.pltsci.jsonschemalib.builder.config.data.WidgetContainerConfig>,
): { fields: FieldConfig[]; switchOperators: ConditionalOperatorConfig[] } {
  const fields = container.widgetConfigs
    ? Array.from(container.widgetConfigs).map(widgetConfigToField)
    : [];
  const switchOperators = container.switchOperators
    ? Array.from(container.switchOperators).map(conditionalOperatorFromBuilder)
    : [];
  return { fields, switchOperators };
}
