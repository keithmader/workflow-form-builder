import type { BooleanFieldConfig, CheckboxFieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { EnumOptionsEditor } from '@/components/shared/EnumOptionsEditor';

export function BooleanProperties({ field }: { field: BooleanFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<BooleanFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Default Value</label>
        <select
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.defaultValue ?? ''}
          onChange={(e) => update({ defaultValue: e.target.value || null })}
        >
          <option value="">None</option>
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
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

export function CheckboxProperties({ field }: { field: CheckboxFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<CheckboxFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          checked={field.defaultValue ?? false}
          onChange={(e) => update({ defaultValue: e.target.checked })}
        />
        Default checked
      </label>
      <div>
        <label className="text-xs font-medium">Parameter Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.parameterName ?? ''}
          onChange={(e) => update({ parameterName: e.target.value || null })}
          placeholder="$form.fieldName"
        />
      </div>
    </div>
  );
}
