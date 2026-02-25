import { FIELD_TYPE_CATEGORIES, type FieldType } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { FieldTypeCard } from './FieldTypeCard';

export function FieldPalette() {
  const addField = useFormBuilderStore((s) => s.addField);

  const handleAdd = (type: FieldType) => {
    addField(type);
  };

  return (
    <div className="h-full overflow-y-auto p-2">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
        Add Field
      </h3>
      {FIELD_TYPE_CATEGORIES.map((cat) => (
        <div key={cat.name} className="mb-3">
          <div className="text-xs font-medium text-muted-foreground px-2 py-1">
            {cat.name}
          </div>
          {cat.types.map((ft) => (
            <FieldTypeCard
              key={ft.type}
              type={ft.type}
              label={ft.label}
              description={ft.description}
              onAdd={handleAdd}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
