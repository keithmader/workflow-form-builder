import type { NumericFieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { NumberRefInput } from '@/components/shared/ReferenceValueInput';

interface NumericPropertiesProps {
  field: NumericFieldConfig;
}

export function NumericProperties({ field }: NumericPropertiesProps) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<NumericFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Default Value</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.defaultValue ?? ''}
          onChange={(e) => update({ defaultValue: e.target.value || null })}
          placeholder="Default value"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Parameter Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.parameterName ?? ''}
          onChange={(e) => update({ parameterName: e.target.value || null })}
          placeholder="$form.fieldName"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Hint</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.hint ?? ''}
          onChange={(e) => update({ hint: e.target.value || null })}
        />
      </div>
      <NumberRefInput
        label="Minimum Value"
        value={field.minimumValue}
        onChange={(v) => update({ minimumValue: v })}
      />
      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={field.exclusiveMinimum}
          onChange={(e) => update({ exclusiveMinimum: e.target.checked })}
        />
        Exclusive minimum
      </label>
      <NumberRefInput
        label="Maximum Value"
        value={field.maximumValue}
        onChange={(v) => update({ maximumValue: v })}
      />
      <label className="flex items-center gap-1.5 text-xs">
        <input
          type="checkbox"
          checked={field.exclusiveMaximum}
          onChange={(e) => update({ exclusiveMaximum: e.target.checked })}
        />
        Exclusive maximum
      </label>
      <NumberRefInput
        label="Min Length"
        value={field.minLength}
        onChange={(v) => update({ minLength: v })}
      />
      <NumberRefInput
        label="Max Length"
        value={field.maxLength}
        onChange={(v) => update({ maxLength: v })}
      />
      <div>
        <label className="text-xs font-medium">Pattern (Regex)</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.pattern ?? ''}
          onChange={(e) => update({ pattern: e.target.value || null })}
        />
      </div>
    </div>
  );
}
