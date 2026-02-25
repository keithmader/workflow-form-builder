/**
 * Stub implementation of the WorkflowEngine builder.js API.
 * This provides the full builderLib namespace so the form builder UI works.
 * Replace with the real builder.js from:
 *   cd WorkflowEngine && ./gradlew :builder:jsBrowserProductionWebpack -Pplatform=js
 *   cp builder/build/distributions/js/builder.js ../workflow-form-builder/public/lib/
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.builderLib = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // ---- Data Classes ----

  class WidgetConfig {
    constructor(widgetName, title, description, isUneditable, isRequired, isHidden, widgetStyle) {
      this.widgetName = widgetName || '';
      this.title = title || null;
      this.description = description || null;
      this.isUneditable = isUneditable || false;
      this.isRequired = isRequired || false;
      this.isHidden = isHidden || false;
      this.widgetStyle = widgetStyle || null;
    }
  }

  class WidgetStyleConfig {
    constructor(backgroundColor, textColor) {
      this.backgroundColor = backgroundColor;
      this.textColor = textColor;
    }
  }

  class ReferenceValue {
    constructor(value, reference) {
      this.value = (value !== undefined) ? value : null;
      this.reference = (reference !== undefined) ? reference : null;
    }
  }

  class ParentWidgetConfig extends WidgetConfig {
    constructor(base, widgetConfigs, switchOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.widgetConfigs = widgetConfigs || [];
      this.switchOperators = switchOperators || [];
    }
  }

  class WidgetContainerConfig extends ParentWidgetConfig {
    constructor(widgetConfigs, switchOperators) {
      const base = new WidgetConfig('', null, null);
      super(base, widgetConfigs || [], switchOperators || []);
    }
  }

  class DescriptionWidgetConfig extends WidgetConfig {
    constructor(widgetName, description) {
      super(widgetName, null, description);
    }
  }

  class EditTextWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, hint, pattern, patternErrorMessage, minLength, maxLength, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.hint = hint || null;
      this.pattern = pattern || null;
      this.patternErrorMessage = patternErrorMessage || null;
      this.minLength = minLength || null;
      this.maxLength = maxLength || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class NumericEditTextWidgetConfig extends EditTextWidgetConfig {
    constructor(base, defaultValue, parameterName, hint, pattern, patternErrorMessage, minLength, maxLength, toggleOperators, type, minimumValue, maximumValue, exclusiveMinimum, exclusiveMaximum) {
      super(base, defaultValue, parameterName, hint, pattern, patternErrorMessage, minLength, maxLength, toggleOperators);
      this.type = type || 'int';
      this.minimumValue = minimumValue || null;
      this.maximumValue = maximumValue || null;
      this.exclusiveMinimum = exclusiveMinimum || false;
      this.exclusiveMaximum = exclusiveMaximum || false;
    }
  }

  class BooleanWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, enumOptions, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.enumOptions = enumOptions || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class CheckBoxWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class RadioButtonWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, enumOptions, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.enumOptions = enumOptions || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class DropdownWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, enumOptions, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.enumOptions = enumOptions || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class DateWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, timeZoneId, minLimitation, maxLimitation, isCalendarStyle, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.timeZoneId = timeZoneId || null;
      this.minLimitation = minLimitation || null;
      this.maxLimitation = maxLimitation || null;
      this.isCalendarStyle = isCalendarStyle || false;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class DateTimeWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, timeZoneId, minLimitation, maxLimitation, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.timeZoneId = timeZoneId || null;
      this.minLimitation = minLimitation || null;
      this.maxLimitation = maxLimitation || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class TimeWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, minLimitation, maxLimitation, toggleOperators) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.minLimitation = minLimitation || null;
      this.maxLimitation = maxLimitation || null;
      this.toggleOperators = toggleOperators || [];
    }
  }

  class HosClockWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue, parameterName, minLimitation, maxLimitation, toggleOperators, hosClockType) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
      this.parameterName = parameterName || null;
      this.minLimitation = minLimitation || null;
      this.maxLimitation = maxLimitation || null;
      this.toggleOperators = toggleOperators || [];
      this.hosClockType = hosClockType || 'UNKNOWN_HOS_CLOCK';
    }
  }

  class InstructionWidgetConfig extends WidgetConfig {
    constructor(base, stringFormatArgs) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.stringFormatArgs = stringFormatArgs || [];
    }
  }

  class SeparatorWidgetConfig extends WidgetConfig {
    constructor(base, defaultValue) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.defaultValue = defaultValue || null;
    }
  }

  class CalculationWidgetConfig extends WidgetConfig {
    constructor(base, calculationFormula, parameterName, decimalPlaces) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.calculationFormula = calculationFormula || '';
      this.parameterName = parameterName || null;
      this.decimalPlaces = decimalPlaces || null;
    }
  }

  class EvaluationWidgetConfig extends WidgetConfig {
    constructor(base, referenceToValue, referenceToDecreaseValue, parameterName) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.referenceToValue = referenceToValue || '';
      this.referenceToDecreaseValue = referenceToDecreaseValue || '';
      this.parameterName = parameterName || null;
    }
  }

  class PhotoCaptureWidgetConfig extends WidgetConfig {
    constructor(base, minNumberOfPhotos, maxNumberOfPhotos) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.minNumberOfPhotos = minNumberOfPhotos || null;
      this.maxNumberOfPhotos = maxNumberOfPhotos || null;
    }
  }

  class SignatureWidgetConfig extends WidgetConfig {
    constructor(base, signatureEntries, signatureMessage) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.signatureEntries = signatureEntries || null;
      this.signatureMessage = signatureMessage || null;
    }
  }

  class SignatureEntry {
    constructor(label, value) { this.label = label; this.value = value; }
  }

  class BarcodeWidgetConfig extends WidgetConfig {
    constructor(base, allowDuplicates, minCharacters, maxCharacters, minBarcodes, maxBarcodes) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.allowDuplicates = allowDuplicates || null;
      this.minCharacters = minCharacters || null;
      this.maxCharacters = maxCharacters || null;
      this.minBarcodes = minBarcodes || null;
      this.maxBarcodes = maxBarcodes || null;
    }
  }

  class DeepLinkWidgetConfig extends WidgetConfig {
    constructor(base, label, deepLink, activityResultHandling) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.label = label || '';
      this.deepLink = deepLink || null;
      this.activityResultHandling = activityResultHandling || null;
    }
  }

  class DeepLinkObject { constructor(jsonString) { this.jsonString = jsonString; } }
  class DeepLinkUrl { constructor(url) { this.url = url; } }

  class CommodityWidgetConfig extends WidgetConfig {
    constructor(base, commodityId, parameterName) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.commodityId = commodityId || 0;
      this.parameterName = parameterName || null;
    }
  }

  class EmbeddedWidgetConfig extends WidgetConfig {
    constructor(base, referenceContainerId) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.referenceContainerId = referenceContainerId || '';
    }
  }

  class MetadataWidgetConfig extends WidgetConfig {
    constructor(base, metadataId, metadataEntries) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.metadataId = metadataId || '';
      this.metadataEntries = metadataEntries || [];
    }
  }

  class MetadataEntry { constructor(key, value) { this.key = key; this.value = value; } }

  class ObjectWidgetConfig extends ParentWidgetConfig {
    constructor(base, widgetConfigs, switchOperators, orientationType) {
      super(base, widgetConfigs, switchOperators);
      this.orientationType = orientationType || 'VERTICAL';
    }
  }

  class ArrayWidgetConfig extends ParentWidgetConfig {
    constructor(base, widgetConfigs, switchOperators, minLength, maxLength, isFixed) {
      super(base, widgetConfigs, switchOperators);
      this.minLength = minLength || null;
      this.maxLength = maxLength || null;
      this.isFixed = isFixed || false;
    }
  }

  class TextBuilderWidgetConfig extends WidgetConfig {
    constructor(base, values, separator) {
      super(base.widgetName, base.title, base.description, base.isUneditable, base.isRequired, base.isHidden, base.widgetStyle);
      this.values = values || [];
      this.separator = separator || '';
    }
  }

  // Enum options
  class EnumOptions {}
  class SimpleEnumOptions extends EnumOptions { constructor(options) { super(); this.options = options; } }
  class PairedEnumOptions extends EnumOptions { constructor(options) { super(); this.options = options; } }
  class PairedOption { constructor(label, value) { this.label = label; this.value = value; } }

  // DateTime limitations
  class DateTimeLimitation {}
  class SimpleDateTimeLimit extends DateTimeLimitation {
    constructor(value, isExclusive) { super(); this.value = value; this.isExclusive = isExclusive !== undefined ? isExclusive : null; }
  }
  class ComplexDateTimeLimit extends DateTimeLimitation {
    constructor(value, operator, isExclusive) { super(); this.value = value; this.operator = operator || null; this.isExclusive = isExclusive !== undefined ? isExclusive : null; }
  }
  class Plus { constructor(dateOrTimeValue) { this.dateOrTimeValue = dateOrTimeValue; } }
  class Minus { constructor(dateOrTimeValue) { this.dateOrTimeValue = dateOrTimeValue; } }
  class DateValue { constructor(years, months, days) { this.years = years || 0; this.months = months || 0; this.days = days || 0; } }
  class TimeValue { constructor(hours, minutes) { this.hours = hours || 0; this.minutes = minutes || 0; } }
  class DateTimeValue { constructor(years, months, days, hours, minutes) { this.years = years || 0; this.months = months || 0; this.days = days || 0; this.hours = hours || 0; this.minutes = minutes || 0; } }

  // Statics
  const NumericWidgetType = { INTEGER: 'int', NUMBER: 'number' };
  const WidgetOrientationType = { HORIZONTAL_ORIENTATION: 'HORIZONTAL', VERTICAL_ORIENTATION: 'VERTICAL' };
  const HosClockType = { HOS_11_HOUR_CLOCK: 'HOS_11_HOUR_CLOCK', HOS_14_HOUR_CLOCK: 'HOS_14_HOUR_CLOCK', HOS_70_HOUR_CLOCK: 'HOS_70_HOUR_CLOCK', UNKNOWN_HOS_CLOCK: 'UNKNOWN_HOS_CLOCK' };

  // ---- Operator Classes ----
  class ConditionalOperator {
    constructor(expression, thenStatement, elseStatement, containsBreak) {
      this.expression = expression;
      this.thenStatement = thenStatement;
      this.elseStatement = elseStatement || null;
      this.containsBreak = containsBreak || false;
    }
  }

  class Expression {}
  class AllOf extends Expression { constructor(conditions) { super(); this.conditions = conditions || []; } }
  class AnyOf extends Expression { constructor(conditions) { super(); this.conditions = conditions || []; } }

  class Condition {}
  class Equal extends Condition { constructor(leftValue, rightValue) { super(); this.leftValue = leftValue; this.rightValue = rightValue; } }
  class NotEqual extends Condition { constructor(leftValue, rightValue) { super(); this.leftValue = leftValue; this.rightValue = rightValue; } }
  class GreaterThan extends Condition { constructor(leftValue, rightValue) { super(); this.leftValue = leftValue; this.rightValue = rightValue; } }
  class LessThan extends Condition { constructor(leftValue, rightValue) { super(); this.leftValue = leftValue; this.rightValue = rightValue; } }

  class Statement {}
  class Actions extends Statement { constructor(statementActions) { super(); this.statementActions = statementActions || []; } }
  class NestedOperator extends Statement { constructor(operator) { super(); this.operator = operator; } }

  class StatementAction {}
  class Show extends StatementAction { constructor(accessToWidgets) { super(); this.accessToWidgets = accessToWidgets || []; } }
  class Exclude extends StatementAction { constructor(accessToWidgets) { super(); this.accessToWidgets = accessToWidgets || []; } }
  class SetRequired extends StatementAction { constructor(accessToWidgets) { super(); this.accessToWidgets = accessToWidgets || []; } }
  class SetValue extends StatementAction { constructor(values) { super(); this.values = values || []; } }
  class SetObservableValue extends StatementAction { constructor(widgetReferences) { super(); this.widgetReferences = widgetReferences || []; } }
  class SetEnumOptions extends StatementAction { constructor(options) { super(); this.options = options || []; } }
  class SetChoiceOptions extends StatementAction { constructor(options) { super(); this.options = options || []; } }

  class ValueInfo { constructor(widgetAccess, value) { this.widgetAccess = widgetAccess; this.value = value; } }
  class WidgetReferenceInfo { constructor(widgetAccess, widgetReference) { this.widgetAccess = widgetAccess; this.widgetReference = widgetReference; } }
  class EnumOptionsInfo { constructor(widgetAccess, enumOptions) { this.widgetAccess = widgetAccess; this.enumOptions = enumOptions; } }

  class ToggleCondition {}
  class EqualTo extends ToggleCondition { constructor(value) { super(); this.value = value; } }
  class ToggleExpression extends ToggleCondition { constructor(comparison, referenceToWidget) { super(); this.comparison = comparison; this.referenceToWidget = referenceToWidget; } }
  class ToggleOperator { constructor(condition, accessToWidgets) { this.condition = condition; this.accessToWidgets = accessToWidgets || []; } }

  const ToggleComparison = { EQUAL: 'eq', NOT_EQUAL: 'ne', LESS_THAN: 'lt', GREATER_THAN: 'gt' };

  // ---- Schema Builder (stub) ----

  function buildWidgetSchema(widget, required, hidden, uneditable) {
    const props = {};
    const name = widget.widgetName;
    if (!name) return { props: {}, required, hidden, uneditable };

    if (widget.isRequired) required.push(name);
    if (widget.isHidden) hidden.push(name);
    if (widget.isUneditable) uneditable.push(name);

    if (widget instanceof DescriptionWidgetConfig) {
      // Description is form-level, handled separately
      return { props, required, hidden, uneditable, formName: name, formDescription: widget.description };
    }

    const field = {};

    if (widget instanceof NumericEditTextWidgetConfig) {
      field.type = widget.type === 'int' ? 'integer' : 'number';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue != null) field.default = widget.defaultValue;
      if (widget.hint) field.hint = widget.hint;
      if (widget.pattern) { field.pattern = widget.pattern; if (widget.patternErrorMessage) field.pattern_error_message = widget.patternErrorMessage; }
      if (widget.minLength) field.minLength = widget.minLength.reference || widget.minLength.value;
      if (widget.maxLength) field.maxLength = widget.maxLength.reference || widget.maxLength.value;
      if (widget.minimumValue) {
        field.minimum = widget.minimumValue.reference || widget.minimumValue.value;
        if (widget.exclusiveMinimum) field.exclusiveMinimum = true;
      }
      if (widget.maximumValue) {
        field.maximum = widget.maximumValue.reference || widget.maximumValue.value;
        if (widget.exclusiveMaximum) field.exclusiveMaximum = true;
      }
      if (widget.parameterName) field.default = widget.parameterName;
    } else if (widget instanceof EditTextWidgetConfig) {
      field.type = 'string';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue != null) field.default = widget.defaultValue;
      if (widget.parameterName) field.default = widget.parameterName;
      if (widget.hint) field.hint = widget.hint;
      if (widget.pattern) { field.pattern = widget.pattern; if (widget.patternErrorMessage) field.pattern_error_message = widget.patternErrorMessage; }
      if (widget.minLength) field.minLength = widget.minLength.reference || widget.minLength.value;
      if (widget.maxLength) field.maxLength = widget.maxLength.reference || widget.maxLength.value;
    } else if (widget instanceof BooleanWidgetConfig) {
      field.type = 'boolean';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue != null) field.default = widget.defaultValue;
      if (widget.enumOptions instanceof SimpleEnumOptions && widget.enumOptions.options && widget.enumOptions.options.value) {
        field.enum = widget.enumOptions.options.value;
      }
    } else if (widget instanceof CheckBoxWidgetConfig) {
      field.type = 'boolean';
      if (widget.title) field.title = widget.title;
      if (widget.defaultValue != null) field.default = widget.defaultValue;
    } else if (widget instanceof RadioButtonWidgetConfig) {
      field.type = 'string';
      field.field_type = 'radio';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue) field.default = widget.defaultValue;
      if (widget.enumOptions instanceof SimpleEnumOptions && widget.enumOptions.options) {
        field.enum = widget.enumOptions.options.reference || widget.enumOptions.options.value;
      } else if (widget.enumOptions instanceof PairedEnumOptions && widget.enumOptions.options) {
        field.choices = (widget.enumOptions.options.value || []).map(function(p) { return [p.value, p.label]; });
      }
    } else if (widget instanceof DropdownWidgetConfig) {
      field.type = 'string';
      field.field_type = 'dropdown';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue) field.default = widget.defaultValue;
      if (widget.enumOptions instanceof SimpleEnumOptions && widget.enumOptions.options) {
        field.enum = widget.enumOptions.options.reference || widget.enumOptions.options.value;
      } else if (widget.enumOptions instanceof PairedEnumOptions && widget.enumOptions.options) {
        field.choices = (widget.enumOptions.options.value || []).map(function(p) { return [p.value, p.label]; });
      }
    } else if (widget instanceof DateTimeWidgetConfig) {
      field.type = 'string';
      field.format = 'date_time';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue) field.default = widget.defaultValue;
      if (widget.timeZoneId) field.timeZoneId = widget.timeZoneId;
    } else if (widget instanceof HosClockWidgetConfig) {
      field.type = 'string';
      field.format = 'time';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue) field.default = widget.defaultValue;
      if (widget.hosClockType) field.hos_clock_type = widget.hosClockType;
    } else if (widget instanceof DateWidgetConfig) {
      field.type = 'string';
      field.format = widget.isCalendarStyle ? 'date_calendar' : 'date';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue) field.default = widget.defaultValue;
      if (widget.timeZoneId) field.timeZoneId = widget.timeZoneId;
    } else if (widget instanceof TimeWidgetConfig) {
      field.type = 'string';
      field.format = 'time';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.defaultValue) field.default = widget.defaultValue;
    } else if (widget instanceof InstructionWidgetConfig) {
      field.type = 'instruction';
      if (widget.description) field.description = widget.description;
      if (widget.stringFormatArgs && widget.stringFormatArgs.length) field.string_format_args = widget.stringFormatArgs;
    } else if (widget instanceof SeparatorWidgetConfig) {
      field.type = 'string';
      field.format = 'separator';
      if (widget.defaultValue) field.default = widget.defaultValue;
    } else if (widget instanceof CalculationWidgetConfig) {
      field.type = 'calculation';
      if (widget.title) field.title = widget.title;
      field.calculation = widget.calculationFormula;
      if (widget.parameterName) field.parameter_name = widget.parameterName;
    } else if (widget instanceof EvaluationWidgetConfig) {
      field.type = 'evaluation';
      field.reference_to_value = widget.referenceToValue;
      field.reference_to_decrease_value = widget.referenceToDecreaseValue;
      if (widget.parameterName) field.parameter_name = widget.parameterName;
    } else if (widget instanceof PhotoCaptureWidgetConfig) {
      field.type = 'string';
      field.format = 'photo_capture';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.minNumberOfPhotos) field.min_number_of_photos = widget.minNumberOfPhotos.reference || widget.minNumberOfPhotos.value;
      if (widget.maxNumberOfPhotos) field.max_number_of_photos = widget.maxNumberOfPhotos.reference || widget.maxNumberOfPhotos.value;
    } else if (widget instanceof SignatureWidgetConfig) {
      field.type = 'string';
      field.format = 'signature';
      if (widget.title) field.title = widget.title;
      if (widget.signatureMessage) field.signature_message = widget.signatureMessage;
    } else if (widget instanceof BarcodeWidgetConfig) {
      field.type = 'string';
      field.format = 'barcode';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.allowDuplicates) field.allowDuplicates = widget.allowDuplicates.reference || widget.allowDuplicates.value;
      if (widget.minCharacters) field.minCharacters = widget.minCharacters.reference || widget.minCharacters.value;
      if (widget.maxCharacters) field.maxCharacters = widget.maxCharacters.reference || widget.maxCharacters.value;
      if (widget.minBarcodes) field.minBarcodes = widget.minBarcodes.reference || widget.minBarcodes.value;
      if (widget.maxBarcodes) field.maxBarcodes = widget.maxBarcodes.reference || widget.maxBarcodes.value;
    } else if (widget instanceof DeepLinkWidgetConfig) {
      field.type = 'object';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.deepLink instanceof DeepLinkUrl) {
        field.deeplink = widget.deepLink.url;
      } else if (widget.deepLink instanceof DeepLinkObject) {
        try { field.deeplink = JSON.parse(widget.deepLink.jsonString); } catch(e) { field.deeplink = widget.deepLink.jsonString; }
      }
    } else if (widget instanceof CommodityWidgetConfig) {
      field.type = 'commodity';
      if (widget.title) field.title = widget.title;
      field.commodity_id = widget.commodityId;
      if (widget.parameterName) field.parameter_name = widget.parameterName;
    } else if (widget instanceof EmbeddedWidgetConfig) {
      field.type = 'object';
      if (widget.title) field.title = widget.title;
      field.reference_container_id = widget.referenceContainerId;
    } else if (widget instanceof MetadataWidgetConfig) {
      field.type = 'metadata';
      field.metadata_id = widget.metadataId;
      if (widget.metadataEntries) {
        field.metadata_entries = {};
        widget.metadataEntries.forEach(function(e) { field.metadata_entries[e.key] = e.value; });
      }
    } else if (widget instanceof ArrayWidgetConfig) {
      field.type = 'array';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      var itemRequired = [], itemHidden = [], itemUneditable = [];
      var itemProps = {};
      (widget.widgetConfigs || []).forEach(function(child) {
        var result = buildWidgetSchema(child, itemRequired, itemHidden, itemUneditable);
        Object.assign(itemProps, result.props);
      });
      field.items = { type: 'object', properties: itemProps };
      if (itemRequired.length) field.items.required = itemRequired;
      if (widget.minLength) field.minLength = widget.minLength.reference || widget.minLength.value;
      if (widget.maxLength) field.maxLength = widget.maxLength.reference || widget.maxLength.value;
      if (widget.isFixed) field.isFixed = true;
    } else if (widget instanceof ObjectWidgetConfig) {
      field.type = 'object';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
      if (widget.orientationType === 'HORIZONTAL') field.layout = 'horizontal';
      var objRequired = [], objHidden = [], objUneditable = [];
      var objProps = {};
      (widget.widgetConfigs || []).forEach(function(child) {
        var result = buildWidgetSchema(child, objRequired, objHidden, objUneditable);
        Object.assign(objProps, result.props);
      });
      field.properties = objProps;
      if (objRequired.length) field.required = objRequired;
      if (objHidden.length) field.hidden = objHidden;
      if (objUneditable.length) field.uneditable = objUneditable;
    } else {
      field.type = 'string';
      if (widget.title) field.title = widget.title;
      if (widget.description) field.description = widget.description;
    }

    props[name] = field;
    return { props, required, hidden, uneditable };
  }

  function buildSwitchSchema(operators) {
    if (!operators || !operators.length) return undefined;
    return operators.map(function(op) {
      var entry = {};
      // Build if
      if (op.expression) {
        var ifObj = {};
        var conditions = (op.expression.conditions || []).map(function(c) {
          var condObj = {};
          var compOp = 'eq';
          if (c instanceof Equal) compOp = 'eq';
          else if (c instanceof NotEqual) compOp = 'ne';
          else if (c instanceof GreaterThan) compOp = 'gt';
          else if (c instanceof LessThan) compOp = 'lt';
          condObj[c.leftValue] = {};
          condObj[c.leftValue][compOp] = c.rightValue;
          return condObj;
        });
        if (op.expression instanceof AllOf) ifObj.allOf = conditions;
        else ifObj.anyOf = conditions;
        entry['if'] = ifObj;
      }
      // Build then
      if (op.thenStatement instanceof Actions) {
        var then = {};
        (op.thenStatement.statementActions || []).forEach(function(action) {
          if (action instanceof Show) then.show = action.accessToWidgets;
          else if (action instanceof Exclude) then.exclude = action.accessToWidgets;
          else if (action instanceof SetRequired) then.setRequired = action.accessToWidgets;
          else if (action instanceof SetValue) {
            then.setValue = {};
            action.values.forEach(function(v) { then.setValue[v.widgetAccess] = v.value; });
          }
          else if (action instanceof SetObservableValue) {
            then.setObservableValue = {};
            action.widgetReferences.forEach(function(w) { then.setObservableValue[w.widgetAccess] = w.widgetReference; });
          }
          else if (action instanceof SetEnumOptions) {
            then.setEnum = {};
            action.options.forEach(function(o) {
              if (o.enumOptions instanceof SimpleEnumOptions) then.setEnum[o.widgetAccess] = o.enumOptions.options.value;
            });
          }
          else if (action instanceof SetChoiceOptions) {
            then.setChoices = {};
            action.options.forEach(function(o) {
              if (o.enumOptions instanceof PairedEnumOptions) {
                then.setChoices[o.widgetAccess] = (o.enumOptions.options.value || []).map(function(p) { return [p.value, p.label]; });
              }
            });
          }
        });
        entry['then'] = then;
      }
      // Build else
      if (op.elseStatement instanceof NestedOperator) {
        var nestedSwitch = buildSwitchSchema([op.elseStatement.operator]);
        if (nestedSwitch && nestedSwitch[0]) {
          entry['else'] = nestedSwitch[0];
        }
      }
      if (op.containsBreak === false) entry['continue'] = true;
      return entry;
    });
  }

  function buildSchema(widgetContainerConfig) {
    if (!widgetContainerConfig) return null;
    var required = [], hidden = [], uneditable = [];
    var properties = {};
    var formName = 'Form';
    var formDescription = '';

    (widgetContainerConfig.widgetConfigs || []).forEach(function(widget) {
      var result = buildWidgetSchema(widget, required, hidden, uneditable);
      Object.assign(properties, result.props);
      if (result.formName) formName = result.formName;
      if (result.formDescription) formDescription = result.formDescription;
    });

    var schema = {};
    var formObj = { type: 'object' };
    if (formName) formObj.title = formName;
    if (formDescription) formObj.description = formDescription;
    if (required.length) formObj.required = required;
    if (hidden.length) formObj.hidden = hidden;
    if (uneditable.length) formObj.uneditable = uneditable;
    formObj.properties = properties;

    var switchSchema = buildSwitchSchema(widgetContainerConfig.switchOperators);
    if (switchSchema) formObj['switch'] = switchSchema;

    schema[formName] = formObj;
    return JSON.stringify(schema);
  }

  // ---- Schema Parser (stub - basic parsing) ----

  function parseFieldToWidget(name, field) {
    var base = new WidgetConfig(name, field.title || null, field.description || null,
      false, false, false);

    var t = field.type;
    var fmt = field.format;

    if (t === 'string' && !fmt && !field.enum && !field.choices && field.field_type !== 'radio' && field.field_type !== 'dropdown') {
      return new EditTextWidgetConfig(base, field.default || null, null,
        field.hint || null, field.pattern || null, field.pattern_error_message || null,
        field.minLength ? new ReferenceValue(field.minLength) : null,
        field.maxLength ? new ReferenceValue(field.maxLength) : null, []);
    }

    if (t === 'integer' || t === 'number') {
      return new NumericEditTextWidgetConfig(base, field.default ? String(field.default) : null, null,
        field.hint || null, field.pattern || null, field.pattern_error_message || null,
        field.minLength ? new ReferenceValue(field.minLength) : null,
        field.maxLength ? new ReferenceValue(field.maxLength) : null, [],
        t === 'integer' ? 'int' : 'number',
        field.minimum != null ? new ReferenceValue(field.minimum) : null,
        field.maximum != null ? new ReferenceValue(field.maximum) : null,
        field.exclusiveMinimum || false, field.exclusiveMaximum || false);
    }

    if (t === 'boolean') {
      var enumOpts = field.enum ? new SimpleEnumOptions(new ReferenceValue(field.enum)) : null;
      return new BooleanWidgetConfig(base, field.default || null, null, enumOpts, []);
    }

    if ((t === 'string' && (field.enum || field.choices)) || field.field_type === 'radio' || field.field_type === 'dropdown') {
      var opts = null;
      if (field.choices) {
        opts = new PairedEnumOptions(new ReferenceValue(field.choices.map(function(c) { return new PairedOption(c[1], c[0]); })));
      } else if (field.enum) {
        opts = new SimpleEnumOptions(new ReferenceValue(field.enum));
      }
      if (field.field_type === 'radio') return new RadioButtonWidgetConfig(base, field.default || null, null, opts, []);
      if (field.field_type === 'dropdown') return new DropdownWidgetConfig(base, field.default || null, null, opts, []);
      // Default: 2 options = radio, more = dropdown
      if (field.enum && field.enum.length <= 2) return new RadioButtonWidgetConfig(base, field.default || null, null, opts, []);
      return new DropdownWidgetConfig(base, field.default || null, null, opts, []);
    }

    if (t === 'string' && fmt === 'date') return new DateWidgetConfig(base, field.default || null, null, field.timeZoneId || null, null, null, false, []);
    if (t === 'string' && fmt === 'date_calendar') return new DateWidgetConfig(base, field.default || null, null, field.timeZoneId || null, null, null, true, []);
    if (t === 'string' && fmt === 'date_time') return new DateTimeWidgetConfig(base, field.default || null, null, field.timeZoneId || null, null, null, []);
    if (t === 'string' && fmt === 'time') return new TimeWidgetConfig(base, field.default || null, null, null, null, []);
    if (t === 'string' && fmt === 'hours_minutes') return new TimeWidgetConfig(base, field.default || null, null, null, null, []);
    if (t === 'string' && fmt === 'separator') return new SeparatorWidgetConfig(base, field.default || null);
    if (t === 'string' && fmt === 'signature') return new SignatureWidgetConfig(base, null, field.signature_message || null);
    if (t === 'string' && fmt === 'barcode') return new BarcodeWidgetConfig(base,
      field.allowDuplicates != null ? new ReferenceValue(field.allowDuplicates) : null,
      field.minCharacters != null ? new ReferenceValue(field.minCharacters) : null,
      field.maxCharacters != null ? new ReferenceValue(field.maxCharacters) : null,
      field.minBarcodes != null ? new ReferenceValue(field.minBarcodes) : null,
      field.maxBarcodes != null ? new ReferenceValue(field.maxBarcodes) : null);
    if (t === 'string' && fmt === 'photo_capture') return new PhotoCaptureWidgetConfig(base,
      field.min_number_of_photos != null ? new ReferenceValue(field.min_number_of_photos) : null,
      field.max_number_of_photos != null ? new ReferenceValue(field.max_number_of_photos) : null);

    if (t === 'instruction') return new InstructionWidgetConfig(base, field.string_format_args || []);
    if (t === 'calculation') return new CalculationWidgetConfig(base, field.calculation || '', field.parameter_name || null, null);
    if (t === 'evaluation') return new EvaluationWidgetConfig(base, field.reference_to_value || '', field.reference_to_decrease_value || '', field.parameter_name || null);
    if (t === 'commodity') return new CommodityWidgetConfig(base, field.commodity_id || 0, field.parameter_name || null);
    if (t === 'metadata') {
      var entries = [];
      if (field.metadata_entries) { Object.keys(field.metadata_entries).forEach(function(k) { entries.push(new MetadataEntry(k, field.metadata_entries[k])); }); }
      return new MetadataWidgetConfig(base, field.metadata_id || '', entries);
    }

    if (t === 'array') {
      var children = [];
      if (field.items && field.items.properties) {
        var itemReq = field.items.required || [];
        Object.keys(field.items.properties).forEach(function(k) {
          var child = parseFieldToWidget(k, field.items.properties[k]);
          if (itemReq.indexOf(k) !== -1) child.isRequired = true;
          children.push(child);
        });
      }
      return new ArrayWidgetConfig(base, children, [],
        field.minLength != null ? new ReferenceValue(field.minLength) : null,
        field.maxLength != null ? new ReferenceValue(field.maxLength) : null,
        field.isFixed || false);
    }

    if (t === 'object' && field.properties) {
      var children = [];
      var objReq = field.required || [];
      var objHidden = field.hidden || [];
      var objUneditable = field.uneditable || [];
      Object.keys(field.properties).forEach(function(k) {
        var child = parseFieldToWidget(k, field.properties[k]);
        if (objReq.indexOf(k) !== -1) child.isRequired = true;
        if (objHidden.indexOf(k) !== -1) child.isHidden = true;
        if (objUneditable.indexOf(k) !== -1) child.isUneditable = true;
        children.push(child);
      });
      var orient = field.layout === 'horizontal' ? 'HORIZONTAL' : 'VERTICAL';
      return new ObjectWidgetConfig(base, children, [], orient);
    }

    // Fallback
    return new EditTextWidgetConfig(base, field.default || null, null, null, null, null, null, null, []);
  }

  function buildWidgetConfigs(schema, currentTime) {
    if (!schema) return null;
    try {
      var parsed = typeof schema === 'string' ? JSON.parse(schema) : schema;
      var formName = Object.keys(parsed)[0];
      if (!formName) return null;
      var formDef = parsed[formName];

      var widgets = [];
      var required = formDef.required || [];
      var hidden = formDef.hidden || [];
      var uneditable = formDef.uneditable || [];

      // Add description widget
      widgets.push(new DescriptionWidgetConfig(formName, formDef.description || formDef.title || ''));

      // Parse properties
      if (formDef.properties) {
        Object.keys(formDef.properties).forEach(function(key) {
          var widget = parseFieldToWidget(key, formDef.properties[key]);
          if (required.indexOf(key) !== -1) widget.isRequired = true;
          if (hidden.indexOf(key) !== -1) widget.isHidden = true;
          if (uneditable.indexOf(key) !== -1) widget.isUneditable = true;
          widgets.push(widget);
        });
      }

      // Parse switch operators
      var switchOps = [];
      if (formDef['switch']) {
        switchOps = parseSwitchOperators(formDef['switch']);
      }

      return new WidgetContainerConfig(widgets, switchOps);
    } catch (e) {
      console.error('buildWidgetConfigs error:', e);
      return null;
    }
  }

  function parseSwitchOperators(switchArray) {
    if (!switchArray || !Array.isArray(switchArray)) return [];
    return switchArray.map(function(entry) {
      var expression;
      var ifObj = entry['if'];
      if (ifObj) {
        var conditions = [];
        var condArray = ifObj.allOf || ifObj.anyOf || [];
        condArray.forEach(function(condObj) {
          var field = Object.keys(condObj)[0];
          var ops = condObj[field];
          if (ops) {
            Object.keys(ops).forEach(function(op) {
              if (op === 'eq') conditions.push(new Equal(field, ops[op]));
              else if (op === 'ne') conditions.push(new NotEqual(field, ops[op]));
              else if (op === 'gt') conditions.push(new GreaterThan(field, ops[op]));
              else if (op === 'lt') conditions.push(new LessThan(field, ops[op]));
            });
          }
        });
        expression = ifObj.allOf ? new AllOf(conditions) : new AnyOf(conditions);
      } else {
        expression = new AnyOf([]);
      }

      var thenStatement = new Actions([]);
      if (entry['then']) {
        var actions = [];
        var t = entry['then'];
        if (t.show) actions.push(new Show(t.show));
        if (t.exclude) actions.push(new Exclude(t.exclude));
        if (t.setRequired) actions.push(new SetRequired(t.setRequired));
        if (t.setValue) {
          var vals = Object.keys(t.setValue).map(function(k) { return new ValueInfo(k, t.setValue[k]); });
          actions.push(new SetValue(vals));
        }
        thenStatement = new Actions(actions);
      }

      var elseStatement = null;
      if (entry['else']) {
        var nested = parseSwitchOperators([entry['else']]);
        if (nested.length) elseStatement = new NestedOperator(nested[0]);
      }

      return new ConditionalOperator(expression, thenStatement, elseStatement, entry['continue'] !== true);
    });
  }

  // ---- Assemble namespace ----

  var data = {
    WidgetConfig: WidgetConfig,
    WidgetStyleConfig: WidgetStyleConfig,
    ReferenceValue: ReferenceValue,
    ParentWidgetConfig: ParentWidgetConfig,
    WidgetContainerConfig: WidgetContainerConfig,
    DescriptionWidgetConfig: DescriptionWidgetConfig,
    EditTextWidgetConfig: EditTextWidgetConfig,
    NumericEditTextWidgetConfig: NumericEditTextWidgetConfig,
    BooleanWidgetConfig: BooleanWidgetConfig,
    CheckBoxWidgetConfig: CheckBoxWidgetConfig,
    RadioButtonWidgetConfig: RadioButtonWidgetConfig,
    DropdownWidgetConfig: DropdownWidgetConfig,
    DateWidgetConfig: DateWidgetConfig,
    DateTimeWidgetConfig: DateTimeWidgetConfig,
    TimeWidgetConfig: TimeWidgetConfig,
    HosClockWidgetConfig: HosClockWidgetConfig,
    InstructionWidgetConfig: InstructionWidgetConfig,
    SeparatorWidgetConfig: SeparatorWidgetConfig,
    CalculationWidgetConfig: CalculationWidgetConfig,
    EvaluationWidgetConfig: EvaluationWidgetConfig,
    PhotoCaptureWidgetConfig: PhotoCaptureWidgetConfig,
    SignatureWidgetConfig: SignatureWidgetConfig,
    SignatureEntry: SignatureEntry,
    BarcodeWidgetConfig: BarcodeWidgetConfig,
    DeepLinkWidgetConfig: DeepLinkWidgetConfig,
    DeepLinkObject: DeepLinkObject,
    DeepLinkUrl: DeepLinkUrl,
    CommodityWidgetConfig: CommodityWidgetConfig,
    EmbeddedWidgetConfig: EmbeddedWidgetConfig,
    MetadataWidgetConfig: MetadataWidgetConfig,
    MetadataEntry: MetadataEntry,
    ObjectWidgetConfig: ObjectWidgetConfig,
    ArrayWidgetConfig: ArrayWidgetConfig,
    TextBuilderWidgetConfig: TextBuilderWidgetConfig,
    SimpleEnumOptions: SimpleEnumOptions,
    PairedEnumOptions: PairedEnumOptions,
    PairedOption: PairedOption,
    EnumOptions: EnumOptions,
    DateTimeLimitation: DateTimeLimitation,
    SimpleDateTimeLimit: SimpleDateTimeLimit,
    ComplexDateTimeLimit: ComplexDateTimeLimit,
    Plus: Plus,
    Minus: Minus,
    DateValue: DateValue,
    TimeValue: TimeValue,
    DateTimeValue: DateTimeValue,
    NumericWidgetType: NumericWidgetType,
    WidgetOrientationType: WidgetOrientationType,
    HosClockType: HosClockType,
    operator: {
      ConditionalOperator: ConditionalOperator,
      Expression: Expression,
      AllOf: AllOf,
      AnyOf: AnyOf,
      Condition: Condition,
      Equal: Equal,
      NotEqual: NotEqual,
      GreaterThan: GreaterThan,
      LessThan: LessThan,
      Statement: Statement,
      Actions: Actions,
      NestedOperator: NestedOperator,
      StatementAction: StatementAction,
      Show: Show,
      Exclude: Exclude,
      SetRequired: SetRequired,
      SetValue: SetValue,
      SetObservableValue: SetObservableValue,
      SetEnumOptions: SetEnumOptions,
      SetChoiceOptions: SetChoiceOptions,
      ValueInfo: ValueInfo,
      WidgetReferenceInfo: WidgetReferenceInfo,
      EnumOptionsInfo: EnumOptionsInfo,
      ToggleOperator: ToggleOperator,
      ToggleCondition: ToggleCondition,
      EqualTo: EqualTo,
      ToggleExpression: ToggleExpression,
      ToggleComparison: ToggleComparison
    }
  };

  return {
    com: {
      pltsci: {
        jsonschemalib: {
          builder: {
            buildSchema: buildSchema,
            buildWidgetConfigs: buildWidgetConfigs,
            config: {
              data: data
            }
          }
        }
      }
    },
    buildSchema: buildSchema,
    buildWidgetConfigs: buildWidgetConfigs
  };
}));
