import type { ObjectFieldConfig } from '@/types/schema';
import type { ConditionalState, ReferenceContext } from '@/types/jobTester';
import { FormRenderer } from '../FormRenderer';

interface ObjectGroupProps {
  field: ObjectFieldConfig;
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  context: ReferenceContext;
  conditionalState: ConditionalState;
}

export function ObjectGroup({ field, values, onChange, context, conditionalState }: ObjectGroupProps) {
  const objValues = (values[field.widgetName] as Record<string, unknown>) ?? {};

  const handleChange = (name: string, value: unknown) => {
    const updated = { ...objValues, [name]: value };
    onChange(field.widgetName, updated);
  };

  return (
    <fieldset
      className={`border border-border rounded-md p-3 space-y-3 ${
        field.orientationType === 'horizontal' ? 'flex gap-3 flex-wrap' : ''
      }`}
    >
      {field.title && (
        <legend className="px-2 text-xs font-medium text-muted-foreground">
          {field.title}
        </legend>
      )}
      <FormRenderer
        fields={field.children}
        switchOperators={field.switchOperators}
        values={objValues}
        onValueChange={handleChange}
        context={context}
        parentConditionalState={conditionalState}
      />
    </fieldset>
  );
}
