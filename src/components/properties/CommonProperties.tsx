import type { FieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

interface CommonPropertiesProps {
  field: FieldConfig;
}

export function CommonProperties({ field }: CommonPropertiesProps) {
  const updateField = useFormBuilderStore((s) => s.updateField);

  const update = (updates: Partial<FieldConfig>) => {
    updateField(field.id, updates);
  };

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-foreground">Widget Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono"
          value={field.widgetName}
          onChange={(e) => update({ widgetName: e.target.value })}
        />
      </div>

      {field.fieldType !== 'description' && field.fieldType !== 'separator' && (
        <div>
          <label className="text-xs font-medium text-foreground">Title</label>
          <input
            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
            value={field.title ?? ''}
            onChange={(e) => update({ title: e.target.value || null })}
            placeholder="Field title"
          />
        </div>
      )}

      <div>
        <label className="text-xs font-medium text-foreground">Description</label>
        <textarea
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          rows={2}
          value={field.description ?? ''}
          onChange={(e) => update({ description: e.target.value || null })}
          placeholder="Field description"
        />
      </div>

      <div className="flex flex-wrap gap-4">
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={field.isRequired}
            onChange={(e) => update({ isRequired: e.target.checked })}
            className="rounded"
          />
          Required
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={field.isHidden}
            onChange={(e) => update({ isHidden: e.target.checked })}
            className="rounded"
          />
          Hidden
        </label>
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={field.isUneditable}
            onChange={(e) => update({ isUneditable: e.target.checked })}
            className="rounded"
          />
          Read-only
        </label>
      </div>
    </div>
  );
}
