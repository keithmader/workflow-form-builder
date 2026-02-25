import type { DropdownFieldConfig, RadioFieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { EnumOptionsEditor } from '@/components/shared/EnumOptionsEditor';

export function DropdownProperties({ field }: { field: DropdownFieldConfig | RadioFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<DropdownFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Default Value</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.defaultValue ?? ''}
          onChange={(e) => update({ defaultValue: e.target.value || null })}
          placeholder="Default selected option"
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
      <EnumOptionsEditor
        value={field.enumOptions}
        onChange={(v) => update({ enumOptions: v })}
      />
    </div>
  );
}
