/* TypeScript declarations for the builderLib namespace (builder.js UMD library) */

declare namespace builderLib {
  function buildSchema(config: com.pltsci.jsonschemalib.builder.config.data.WidgetContainerConfig | null): string | null;
  function buildWidgetConfigs(schema: string | null, currentTime?: number): com.pltsci.jsonschemalib.builder.config.data.WidgetContainerConfig | null;

  namespace com.pltsci.jsonschemalib.builder {
    function buildSchema(config: config.data.WidgetContainerConfig | null): string | null;
    function buildWidgetConfigs(schema: string | null, currentTime?: number): config.data.WidgetContainerConfig | null;

    namespace config.data {
      class WidgetConfig {
        constructor(
          widgetName: string,
          title?: string | null,
          description?: string | null,
          isUneditable?: boolean,
          isRequired?: boolean,
          isHidden?: boolean,
          widgetStyle?: ReferenceValue<WidgetStyleConfig> | null
        );
        widgetName: string;
        title: string | null;
        description: string | null;
        isUneditable: boolean;
        isRequired: boolean;
        isHidden: boolean;
        widgetStyle: ReferenceValue<WidgetStyleConfig> | null;
      }

      class WidgetStyleConfig {
        constructor(backgroundColor: string, textColor: string);
        backgroundColor: string;
        textColor: string;
      }

      class ReferenceValue<T> {
        constructor(value?: T | null, reference?: string | null);
        value: T | null;
        reference: string | null;
      }

      class ParentWidgetConfig extends WidgetConfig {
        widgetConfigs: WidgetConfig[];
        switchOperators: operator.ConditionalOperator[];
      }

      class WidgetContainerConfig extends ParentWidgetConfig {
        constructor(
          widgetConfigs: WidgetConfig[],
          switchOperators?: operator.ConditionalOperator[]
        );
      }

      class DescriptionWidgetConfig extends WidgetConfig {
        constructor(widgetName: string, description: string);
      }

      class EditTextWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          hint?: string | null,
          pattern?: string | null,
          patternErrorMessage?: string | null,
          minLength?: ReferenceValue<number> | null,
          maxLength?: ReferenceValue<number> | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        hint: string | null;
        pattern: string | null;
        patternErrorMessage: string | null;
        minLength: ReferenceValue<number> | null;
        maxLength: ReferenceValue<number> | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class NumericEditTextWidgetConfig extends EditTextWidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          hint?: string | null,
          pattern?: string | null,
          patternErrorMessage?: string | null,
          minLength?: ReferenceValue<number> | null,
          maxLength?: ReferenceValue<number> | null,
          toggleOperators?: operator.ToggleOperator[],
          type?: typeof NumericWidgetType[keyof typeof NumericWidgetType],
          minimumValue?: ReferenceValue<number> | null,
          maximumValue?: ReferenceValue<number> | null,
          exclusiveMinimum?: boolean,
          exclusiveMaximum?: boolean
        );
        type: string;
        minimumValue: ReferenceValue<number> | null;
        maximumValue: ReferenceValue<number> | null;
        exclusiveMinimum: boolean;
        exclusiveMaximum: boolean;
      }

      class BooleanWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          enumOptions?: EnumOptions | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        enumOptions: EnumOptions | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class CheckBoxWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: boolean | null,
          parameterName?: string | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: boolean | null;
        parameterName: string | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class RadioButtonWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          enumOptions?: EnumOptions | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        enumOptions: EnumOptions | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class DropdownWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          enumOptions?: EnumOptions | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        enumOptions: EnumOptions | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class DateWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          timeZoneId?: string | null,
          minLimitation?: DateTimeLimitation | null,
          maxLimitation?: DateTimeLimitation | null,
          isCalendarStyle?: boolean,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        timeZoneId: string | null;
        minLimitation: DateTimeLimitation | null;
        maxLimitation: DateTimeLimitation | null;
        isCalendarStyle: boolean;
        toggleOperators: operator.ToggleOperator[];
      }

      class DateTimeWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          timeZoneId?: string | null,
          minLimitation?: DateTimeLimitation | null,
          maxLimitation?: DateTimeLimitation | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        timeZoneId: string | null;
        minLimitation: DateTimeLimitation | null;
        maxLimitation: DateTimeLimitation | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class TimeWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          minLimitation?: DateTimeLimitation | null,
          maxLimitation?: DateTimeLimitation | null,
          toggleOperators?: operator.ToggleOperator[]
        );
        defaultValue: string | null;
        parameterName: string | null;
        minLimitation: DateTimeLimitation | null;
        maxLimitation: DateTimeLimitation | null;
        toggleOperators: operator.ToggleOperator[];
      }

      class HosClockWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null,
          parameterName?: string | null,
          minLimitation?: DateTimeLimitation | null,
          maxLimitation?: DateTimeLimitation | null,
          toggleOperators?: operator.ToggleOperator[],
          hosClockType?: string
        );
        defaultValue: string | null;
        parameterName: string | null;
        minLimitation: DateTimeLimitation | null;
        maxLimitation: DateTimeLimitation | null;
        toggleOperators: operator.ToggleOperator[];
        hosClockType: string;
      }

      class InstructionWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          stringFormatArgs: string[]
        );
        stringFormatArgs: string[];
      }

      class SeparatorWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          defaultValue?: string | null
        );
        defaultValue: string | null;
      }

      class CalculationWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          calculationFormula: string,
          parameterName?: string | null,
          decimalPlaces?: number | null
        );
        calculationFormula: string;
        parameterName: string | null;
        decimalPlaces: number | null;
      }

      class EvaluationWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          referenceToValue: string,
          referenceToDecreaseValue: string,
          parameterName?: string | null
        );
        referenceToValue: string;
        referenceToDecreaseValue: string;
        parameterName: string | null;
      }

      class PhotoCaptureWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          minNumberOfPhotos?: ReferenceValue<number> | null,
          maxNumberOfPhotos?: ReferenceValue<number> | null
        );
        minNumberOfPhotos: ReferenceValue<number> | null;
        maxNumberOfPhotos: ReferenceValue<number> | null;
      }

      class SignatureWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          signatureEntries?: ReferenceValue<SignatureEntry[]> | null,
          signatureMessage?: string | null
        );
        signatureEntries: ReferenceValue<SignatureEntry[]> | null;
        signatureMessage: string | null;
      }

      class SignatureEntry {
        constructor(label: string, value: string);
        label: string;
        value: string;
      }

      class BarcodeWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          allowDuplicates?: ReferenceValue<boolean> | null,
          minCharacters?: ReferenceValue<number> | null,
          maxCharacters?: ReferenceValue<number> | null,
          minBarcodes?: ReferenceValue<number> | null,
          maxBarcodes?: ReferenceValue<number> | null
        );
        allowDuplicates: ReferenceValue<boolean> | null;
        minCharacters: ReferenceValue<number> | null;
        maxCharacters: ReferenceValue<number> | null;
        minBarcodes: ReferenceValue<number> | null;
        maxBarcodes: ReferenceValue<number> | null;
      }

      class DeepLinkWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          label: string,
          deepLink: DeepLinkObject | DeepLinkUrl,
          activityResultHandling?: unknown
        );
        label: string;
        deepLink: DeepLinkObject | DeepLinkUrl;
      }

      class DeepLinkObject {
        constructor(jsonString: string);
        jsonString: string;
      }

      class DeepLinkUrl {
        constructor(url: string);
        url: string;
      }

      class CommodityWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          commodityId: number,
          parameterName?: string | null
        );
        commodityId: number;
        parameterName: string | null;
      }

      class EmbeddedWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          referenceContainerId: string
        );
        referenceContainerId: string;
      }

      class MetadataWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          metadataId: string,
          metadataEntries: MetadataEntry[]
        );
        metadataId: string;
        metadataEntries: MetadataEntry[];
      }

      class MetadataEntry {
        constructor(key: string, value: string);
        key: string;
        value: string;
      }

      class ObjectWidgetConfig extends ParentWidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          widgetConfigs: WidgetConfig[],
          switchOperators: operator.ConditionalOperator[],
          orientationType: string
        );
        orientationType: string;
      }

      class ArrayWidgetConfig extends ParentWidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          widgetConfigs: WidgetConfig[],
          switchOperators: operator.ConditionalOperator[],
          minLength?: ReferenceValue<number> | null,
          maxLength?: ReferenceValue<number> | null,
          isFixed?: boolean
        );
        minLength: ReferenceValue<number> | null;
        maxLength: ReferenceValue<number> | null;
        isFixed: boolean;
      }

      class TextBuilderWidgetConfig extends WidgetConfig {
        constructor(
          baseWidgetConfig: WidgetConfig,
          values: string[],
          separator: string
        );
        values: string[];
        separator: string;
      }

      // Enum options
      class EnumOptions {}

      class SimpleEnumOptions extends EnumOptions {
        constructor(options: ReferenceValue<string[]>);
        options: ReferenceValue<string[]>;
      }

      class PairedEnumOptions extends EnumOptions {
        constructor(options: ReferenceValue<PairedOption[]>);
        options: ReferenceValue<PairedOption[]>;
      }

      class PairedOption {
        constructor(label: string, value: string);
        label: string;
        value: string;
      }

      // DateTime limitations
      class DateTimeLimitation {}

      class SimpleDateTimeLimit extends DateTimeLimitation {
        constructor(value: string, isExclusive?: boolean | null);
        value: string;
        isExclusive: boolean | null;
      }

      class ComplexDateTimeLimit extends DateTimeLimitation {
        constructor(
          value: string,
          operator?: Plus | Minus | null,
          isExclusive?: boolean | null
        );
        value: string;
        operator: Plus | Minus | null;
        isExclusive: boolean | null;
      }

      class Plus {
        constructor(dateOrTimeValue: DateValue | TimeValue | DateTimeValue);
        dateOrTimeValue: DateValue | TimeValue | DateTimeValue;
      }

      class Minus {
        constructor(dateOrTimeValue: DateValue | TimeValue | DateTimeValue);
        dateOrTimeValue: DateValue | TimeValue | DateTimeValue;
      }

      class DateValue {
        constructor(years?: number, months?: number, days?: number);
        years: number;
        months: number;
        days: number;
      }

      class TimeValue {
        constructor(hours?: number, minutes?: number);
        hours: number;
        minutes: number;
      }

      class DateTimeValue {
        constructor(years?: number, months?: number, days?: number, hours?: number, minutes?: number);
        years: number;
        months: number;
        days: number;
        hours: number;
        minutes: number;
      }

      // Static enums
      const NumericWidgetType: {
        INTEGER: string;
        NUMBER: string;
      };

      const WidgetOrientationType: {
        HORIZONTAL_ORIENTATION: string;
        VERTICAL_ORIENTATION: string;
      };

      const HosClockType: {
        HOS_11_HOUR_CLOCK: string;
        HOS_14_HOUR_CLOCK: string;
        HOS_70_HOUR_CLOCK: string;
        UNKNOWN_HOS_CLOCK: string;
      };

      namespace operator {
        class ConditionalOperator {
          constructor(
            expression: Expression,
            thenStatement: Statement,
            elseStatement?: Statement | null,
            containsBreak?: boolean
          );
          expression: Expression;
          thenStatement: Statement;
          elseStatement: Statement | null;
          containsBreak: boolean;
        }

        class Expression {}

        class AllOf extends Expression {
          constructor(conditions: Condition[]);
          conditions: Condition[];
        }

        class AnyOf extends Expression {
          constructor(conditions: Condition[]);
          conditions: Condition[];
        }

        class Condition {}

        class Equal extends Condition {
          constructor(leftValue: string, rightValue: unknown);
          leftValue: string;
          rightValue: unknown;
        }

        class NotEqual extends Condition {
          constructor(leftValue: string, rightValue: unknown);
          leftValue: string;
          rightValue: unknown;
        }

        class GreaterThan extends Condition {
          constructor(leftValue: string, rightValue: unknown);
          leftValue: string;
          rightValue: unknown;
        }

        class LessThan extends Condition {
          constructor(leftValue: string, rightValue: unknown);
          leftValue: string;
          rightValue: unknown;
        }

        class Statement {}

        class Actions extends Statement {
          constructor(statementActions: StatementAction[]);
          statementActions: StatementAction[];
        }

        class NestedOperator extends Statement {
          constructor(operator: ConditionalOperator);
          operator: ConditionalOperator;
        }

        class StatementAction {}

        class Show extends StatementAction {
          constructor(accessToWidgets: string[]);
          accessToWidgets: string[];
        }

        class Exclude extends StatementAction {
          constructor(accessToWidgets: string[]);
          accessToWidgets: string[];
        }

        class SetRequired extends StatementAction {
          constructor(accessToWidgets: string[]);
          accessToWidgets: string[];
        }

        class SetValue extends StatementAction {
          constructor(values: ValueInfo[]);
          values: ValueInfo[];
        }

        class SetObservableValue extends StatementAction {
          constructor(widgetReferences: WidgetReferenceInfo[]);
          widgetReferences: WidgetReferenceInfo[];
        }

        class SetEnumOptions extends StatementAction {
          constructor(options: EnumOptionsInfo[]);
          options: EnumOptionsInfo[];
        }

        class SetChoiceOptions extends StatementAction {
          constructor(options: EnumOptionsInfo[]);
          options: EnumOptionsInfo[];
        }

        class ValueInfo {
          constructor(widgetAccess: string, value: unknown);
          widgetAccess: string;
          value: unknown;
        }

        class WidgetReferenceInfo {
          constructor(widgetAccess: string, widgetReference: string);
          widgetAccess: string;
          widgetReference: string;
        }

        class EnumOptionsInfo {
          constructor(widgetAccess: string, enumOptions: data.EnumOptions);
          widgetAccess: string;
          enumOptions: data.EnumOptions;
        }

        class ToggleOperator {
          constructor(condition: ToggleCondition, accessToWidgets: string[]);
          condition: ToggleCondition;
          accessToWidgets: string[];
        }

        class ToggleCondition {}

        class EqualTo extends ToggleCondition {
          constructor(value: string);
          value: string;
        }

        class ToggleExpression extends ToggleCondition {
          constructor(comparison: string, referenceToWidget: string);
          comparison: string;
          referenceToWidget: string;
        }

        const ToggleComparison: {
          EQUAL: "eq";
          NOT_EQUAL: "ne";
          LESS_THAN: "lt";
          GREATER_THAN: "gt";
        };
      }
    }
  }
}

interface Window {
  builderLib: typeof builderLib;
}
