import type { ObjectFieldConfig, ArrayFieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { NumberRefInput } from '@/components/shared/ReferenceValueInput';

export function ObjectProperties({ field }: { field: ObjectFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<ObjectFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Orientation</label>
        <select
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.orientationType}
          onChange={(e) => update({ orientationType: e.target.value as 'horizontal' | 'vertical' })}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </select>
      </div>
      <p className="text-xs text-muted-foreground">
        {field.children.length} child field{field.children.length !== 1 ? 's' : ''}.
        Add children via the canvas.
      </p>
    </div>
  );
}

export function ArrayProperties({ field }: { field: ArrayFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<ArrayFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <NumberRefInput
        label="Min Items"
        value={field.minLength}
        onChange={(v) => update({ minLength: v })}
      />
      <NumberRefInput
        label="Max Items"
        value={field.maxLength}
        onChange={(v) => update({ maxLength: v })}
      />
      <label className="flex items-center gap-1.5 text-sm">
        <input
          type="checkbox"
          checked={field.isFixed}
          onChange={(e) => update({ isFixed: e.target.checked })}
        />
        Fixed number of items
      </label>
      <p className="text-xs text-muted-foreground">
        {field.children.length} child field{field.children.length !== 1 ? 's' : ''}.
        Add children via the canvas.
      </p>
    </div>
  );
}
