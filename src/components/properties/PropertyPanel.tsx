import { useFormBuilderStore } from '@/stores/formBuilderStore';
import type { FieldConfig } from '@/types/schema';
import { CommonProperties } from './CommonProperties';
import { EditTextProperties } from './EditTextProperties';
import { NumericProperties } from './NumericProperties';
import { BooleanProperties, CheckboxProperties } from './BooleanProperties';
import { DropdownProperties } from './DropdownProperties';
import { DateProperties } from './DateProperties';
import { ObjectProperties, ArrayProperties } from './ObjectProperties';
import {
  InstructionProperties, SeparatorProperties, CalculationProperties,
  EvaluationProperties, PhotoCaptureProperties, SignatureProperties,
  BarcodeProperties, DeepLinkProperties, CommodityProperties,
  EmbeddedProperties, MetadataProperties,
} from './AdvancedProperties';

function findField(fields: FieldConfig[], id: string): FieldConfig | null {
  for (const f of fields) {
    if (f.id === id) return f;
    if ('children' in f && f.children) {
      const found = findField(f.children, id);
      if (found) return found;
    }
  }
  return null;
}

function TypeSpecificEditor({ field }: { field: FieldConfig }) {
  switch (field.fieldType) {
    case 'text': return <EditTextProperties field={field} />;
    case 'integer':
    case 'number': return <NumericProperties field={field} />;
    case 'boolean': return <BooleanProperties field={field} />;
    case 'checkbox': return <CheckboxProperties field={field} />;
    case 'radio':
    case 'dropdown': return <DropdownProperties field={field} />;
    case 'date':
    case 'dateCalendar':
    case 'dateTime':
    case 'time':
    case 'hosClock': return <DateProperties field={field} />;
    case 'object': return <ObjectProperties field={field} />;
    case 'array': return <ArrayProperties field={field} />;
    case 'instruction': return <InstructionProperties field={field} />;
    case 'separator': return <SeparatorProperties field={field} />;
    case 'calculation': return <CalculationProperties field={field} />;
    case 'evaluation': return <EvaluationProperties field={field} />;
    case 'photoCapture': return <PhotoCaptureProperties field={field} />;
    case 'signature': return <SignatureProperties field={field} />;
    case 'barcode': return <BarcodeProperties field={field} />;
    case 'deepLink': return <DeepLinkProperties field={field} />;
    case 'commodity': return <CommodityProperties field={field} />;
    case 'embedded': return <EmbeddedProperties field={field} />;
    case 'metadata': return <MetadataProperties field={field} />;
    case 'description': return null;
    default: return null;
  }
}

export function PropertyPanel() {
  const { selectedFieldId, fields } = useFormBuilderStore();

  if (!selectedFieldId) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4">
        <p className="text-center">Select a field to edit its properties</p>
      </div>
    );
  }

  const field = findField(fields, selectedFieldId);
  if (!field) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground text-sm p-4">
        <p>Field not found</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 space-y-4">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Properties
      </h3>
      <CommonProperties field={field} />
      <div className="border-t border-border pt-3">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Type Settings
        </h4>
        <TypeSpecificEditor field={field} />
      </div>
    </div>
  );
}
