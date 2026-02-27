import { Plus, Trash2 } from 'lucide-react';
import type { ArrayFieldConfig } from '@/types/schema';
import type { ConditionalState, ReferenceContext } from '@/types/jobTester';
import { FormRenderer } from '../FormRenderer';

interface ArrayRepeaterProps {
  field: ArrayFieldConfig;
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
  context: ReferenceContext;
  conditionalState: ConditionalState;
}

export function ArrayRepeater({ field, values, onChange, context, conditionalState }: ArrayRepeaterProps) {
  const items = (values[field.widgetName] as Record<string, unknown>[]) ?? [];

  const addItem = () => {
    const newItems = [...items, {}];
    onChange(field.widgetName, newItems);
  };

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(field.widgetName, newItems);
  };

  const updateItem = (index: number, name: string, value: unknown) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [name]: value };
    onChange(field.widgetName, newItems);
  };

  const maxReached = field.maxLength?.value != null && items.length >= field.maxLength.value;

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="border border-border rounded-md p-3 relative">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">
              Item {index + 1}
            </span>
            {!field.isFixed && (
              <button
                onClick={() => removeItem(index)}
                className="text-muted-foreground hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
          <FormRenderer
            fields={field.children}
            switchOperators={field.switchOperators}
            values={item}
            onValueChange={(name, value) => updateItem(index, name, value)}
            context={context}
            parentConditionalState={conditionalState}
          />
        </div>
      ))}

      {!field.isFixed && !maxReached && (
        <button
          onClick={addItem}
          className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
        >
          <Plus size={14} />
          Add Item
        </button>
      )}
    </div>
  );
}
