import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { FieldItem } from './FieldItem';

export function FormCanvas() {
  const { fields, formName, formDescription, setFormName, setFormDescription } = useFormBuilderStore();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="p-3 border-b border-border space-y-2">
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-ring"
          value={formName}
          onChange={(e) => setFormName(e.target.value)}
          placeholder="Form Name"
        />
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-xs text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          value={formDescription}
          onChange={(e) => setFormDescription(e.target.value)}
          placeholder="Form description (optional)"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="px-3 pt-3 pb-1">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Form Definition</h3>
        </div>
        {fields.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            <div className="text-center">
              <p>No fields yet</p>
              <p className="text-xs mt-1">Click a field type in the left panel to add one</p>
            </div>
          </div>
        ) : (
          <div className="py-1">
            {fields.map((field) => (
              <FieldItem key={field.id} field={field} />
            ))}
          </div>
        )}
      </div>

      <div className="p-2 border-t border-border text-xs text-muted-foreground">
        {fields.length} field{fields.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}
