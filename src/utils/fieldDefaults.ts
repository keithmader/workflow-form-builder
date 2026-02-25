import { v4 as uuidv4 } from 'uuid';
import type { FieldConfig, FieldType } from '@/types/schema';

let fieldCounter = 0;

function nextName(prefix: string): string {
  fieldCounter++;
  return `${prefix}${fieldCounter}`;
}

export function resetFieldCounter(): void {
  fieldCounter = 0;
}

export function createDefaultField(type: FieldType, name?: string): FieldConfig {
  const id = uuidv4();
  const base = {
    id,
    isUneditable: false,
    isRequired: false,
    isHidden: false,
  };

  switch (type) {
    case 'text':
      return {
        ...base,
        fieldType: 'text',
        widgetName: name ?? nextName('TextField'),
        title: 'Text Field',
        description: null,
        defaultValue: null,
        parameterName: null,
        hint: null,
        pattern: null,
        patternErrorMessage: null,
        minLength: null,
        maxLength: null,
        toggleOperators: [],
      };
    case 'integer':
      return {
        ...base,
        fieldType: 'integer',
        widgetName: name ?? nextName('IntegerField'),
        title: 'Integer Field',
        description: null,
        defaultValue: null,
        parameterName: null,
        hint: null,
        pattern: null,
        patternErrorMessage: null,
        minLength: null,
        maxLength: null,
        minimumValue: null,
        maximumValue: null,
        exclusiveMinimum: false,
        exclusiveMaximum: false,
        toggleOperators: [],
      };
    case 'number':
      return {
        ...base,
        fieldType: 'number',
        widgetName: name ?? nextName('NumberField'),
        title: 'Number Field',
        description: null,
        defaultValue: null,
        parameterName: null,
        hint: null,
        pattern: null,
        patternErrorMessage: null,
        minLength: null,
        maxLength: null,
        minimumValue: null,
        maximumValue: null,
        exclusiveMinimum: false,
        exclusiveMaximum: false,
        toggleOperators: [],
      };
    case 'boolean':
      return {
        ...base,
        fieldType: 'boolean',
        widgetName: name ?? nextName('BooleanField'),
        title: 'Yes/No Field',
        description: null,
        defaultValue: null,
        parameterName: null,
        enumOptions: { type: 'simple', options: { value: ['Yes', 'No'], reference: null } },
        toggleOperators: [],
      };
    case 'checkbox':
      return {
        ...base,
        fieldType: 'checkbox',
        widgetName: name ?? nextName('CheckboxField'),
        title: 'Checkbox',
        description: null,
        defaultValue: false,
        parameterName: null,
        toggleOperators: [],
      };
    case 'radio':
      return {
        ...base,
        fieldType: 'radio',
        widgetName: name ?? nextName('RadioField'),
        title: 'Radio Selection',
        description: null,
        defaultValue: null,
        parameterName: null,
        enumOptions: { type: 'simple', options: { value: ['Option 1', 'Option 2', 'Option 3'], reference: null } },
        toggleOperators: [],
      };
    case 'dropdown':
      return {
        ...base,
        fieldType: 'dropdown',
        widgetName: name ?? nextName('DropdownField'),
        title: 'Dropdown',
        description: null,
        defaultValue: null,
        parameterName: null,
        enumOptions: { type: 'simple', options: { value: ['Option 1', 'Option 2', 'Option 3'], reference: null } },
        toggleOperators: [],
      };
    case 'date':
      return {
        ...base,
        fieldType: 'date',
        widgetName: name ?? nextName('DateField'),
        title: 'Date',
        description: null,
        defaultValue: null,
        parameterName: null,
        timeZoneId: null,
        minLimitation: null,
        maxLimitation: null,
        isCalendarStyle: false,
        toggleOperators: [],
      };
    case 'dateCalendar':
      return {
        ...base,
        fieldType: 'dateCalendar',
        widgetName: name ?? nextName('CalendarDateField'),
        title: 'Calendar Date',
        description: null,
        defaultValue: null,
        parameterName: null,
        timeZoneId: null,
        minLimitation: null,
        maxLimitation: null,
        isCalendarStyle: true,
        toggleOperators: [],
      };
    case 'dateTime':
      return {
        ...base,
        fieldType: 'dateTime',
        widgetName: name ?? nextName('DateTimeField'),
        title: 'Date & Time',
        description: null,
        defaultValue: null,
        parameterName: null,
        timeZoneId: null,
        minLimitation: null,
        maxLimitation: null,
        toggleOperators: [],
      };
    case 'time':
      return {
        ...base,
        fieldType: 'time',
        widgetName: name ?? nextName('TimeField'),
        title: 'Time',
        description: null,
        defaultValue: null,
        parameterName: null,
        minLimitation: null,
        maxLimitation: null,
        toggleOperators: [],
      };
    case 'hosClock':
      return {
        ...base,
        fieldType: 'hosClock',
        widgetName: name ?? nextName('HosClockField'),
        title: 'HOS Clock',
        description: null,
        defaultValue: null,
        parameterName: null,
        minLimitation: null,
        maxLimitation: null,
        hosClockType: 'UNKNOWN_HOS_CLOCK',
        toggleOperators: [],
      };
    case 'instruction':
      return {
        ...base,
        fieldType: 'instruction',
        widgetName: name ?? nextName('Instruction'),
        title: null,
        description: 'Enter instruction text here.',
        stringFormatArgs: [],
      };
    case 'separator':
      return {
        ...base,
        fieldType: 'separator',
        widgetName: name ?? nextName('Separator'),
        title: null,
        description: null,
        defaultValue: ':',
      };
    case 'calculation':
      return {
        ...base,
        fieldType: 'calculation',
        widgetName: name ?? nextName('CalculationField'),
        title: 'Calculation',
        description: null,
        calculationFormula: '',
        parameterName: null,
        decimalPlaces: null,
      };
    case 'evaluation':
      return {
        ...base,
        fieldType: 'evaluation',
        widgetName: name ?? nextName('EvaluationField'),
        title: null,
        description: null,
        referenceToValue: '',
        referenceToDecreaseValue: '',
        parameterName: null,
      };
    case 'photoCapture':
      return {
        ...base,
        fieldType: 'photoCapture',
        widgetName: name ?? nextName('PhotoCapture'),
        title: 'Photo Capture',
        description: null,
        minNumberOfPhotos: { value: 1, reference: null },
        maxNumberOfPhotos: { value: 5, reference: null },
      };
    case 'signature':
      return {
        ...base,
        fieldType: 'signature',
        widgetName: name ?? nextName('Signature'),
        title: 'Signature',
        description: null,
        signatureEntries: null,
        signatureMessage: null,
      };
    case 'barcode':
      return {
        ...base,
        fieldType: 'barcode',
        widgetName: name ?? nextName('Barcode'),
        title: 'Barcode Scanner',
        description: null,
        allowDuplicates: { value: false, reference: null },
        minCharacters: { value: 1, reference: null },
        maxCharacters: { value: 50, reference: null },
        minBarcodes: { value: 1, reference: null },
        maxBarcodes: { value: 10, reference: null },
      };
    case 'deepLink':
      return {
        ...base,
        fieldType: 'deepLink',
        widgetName: name ?? nextName('DeepLink'),
        title: 'Deep Link',
        description: null,
        label: 'Open',
        deepLinkType: 'url',
        deepLinkValue: '',
      };
    case 'commodity':
      return {
        ...base,
        fieldType: 'commodity',
        widgetName: name ?? nextName('Commodity'),
        title: 'Commodity',
        description: null,
        commodityId: 0,
        parameterName: null,
      };
    case 'embedded':
      return {
        ...base,
        fieldType: 'embedded',
        widgetName: name ?? nextName('Embedded'),
        title: 'Embedded Form',
        description: null,
        referenceContainerId: '',
      };
    case 'metadata':
      return {
        ...base,
        fieldType: 'metadata',
        widgetName: name ?? nextName('Metadata'),
        title: null,
        description: null,
        metadataId: '',
        metadataEntries: [],
      };
    case 'object':
      return {
        ...base,
        fieldType: 'object',
        widgetName: name ?? nextName('ObjectGroup'),
        title: 'Group',
        description: null,
        children: [],
        switchOperators: [],
        orientationType: 'vertical',
      };
    case 'array':
      return {
        ...base,
        fieldType: 'array',
        widgetName: name ?? nextName('ArrayGroup'),
        title: 'Repeating Group',
        description: null,
        children: [],
        switchOperators: [],
        minLength: { value: 1, reference: null },
        maxLength: { value: 5, reference: null },
        isFixed: false,
      };
    case 'description':
      return {
        ...base,
        fieldType: 'description',
        widgetName: name ?? nextName('FormDescription'),
        title: null,
        description: 'Form description',
      };
  }
}
