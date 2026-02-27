import { useMemo } from 'react';
import type { FieldConfig, ConditionalOperatorConfig } from '@/types/schema';
import type { ConditionalState, ReferenceContext } from '@/types/jobTester';
import {
  evaluateConditionals,
  collectToggleOperators,
  isFieldVisible,
} from '@/utils/conditionalEngine';
import { FieldRenderer } from './FieldRenderer';

interface FormRendererProps {
  fields: FieldConfig[];
  switchOperators: ConditionalOperatorConfig[];
  values: Record<string, unknown>;
  onValueChange: (name: string, value: unknown) => void;
  context: ReferenceContext;
  parentConditionalState?: ConditionalState;
}

export function FormRenderer({
  fields,
  switchOperators,
  values,
  onValueChange,
  context,
  parentConditionalState,
}: FormRendererProps) {
  const conditionalState = useMemo(() => {
    if (parentConditionalState && switchOperators.length === 0) {
      return parentConditionalState;
    }

    const toggleOps = collectToggleOperators(fields);
    return evaluateConditionals(switchOperators, toggleOps, values, context);
  }, [fields, switchOperators, values, context, parentConditionalState]);

  const visibleFields = useMemo(
    () => fields.filter((f) => isFieldVisible(f, conditionalState)),
    [fields, conditionalState],
  );

  if (visibleFields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground italic py-2">No fields to display</p>
    );
  }

  return (
    <div className="space-y-4">
      {visibleFields.map((field) => (
        <FieldRenderer
          key={field.id}
          field={field}
          values={values}
          onValueChange={onValueChange}
          context={context}
          conditionalState={conditionalState}
        />
      ))}
    </div>
  );
}
