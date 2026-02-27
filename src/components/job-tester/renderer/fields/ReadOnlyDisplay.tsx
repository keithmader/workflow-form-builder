import type { InstructionFieldConfig, SeparatorFieldConfig, DescriptionFieldConfig } from '@/types/schema';

interface ReadOnlyDisplayProps {
  field: InstructionFieldConfig | SeparatorFieldConfig | DescriptionFieldConfig;
}

export function ReadOnlyDisplay({ field }: ReadOnlyDisplayProps) {
  if (field.fieldType === 'separator') {
    return (
      <div className="py-1">
        <hr className="border-border" />
        {field.title && (
          <span className="text-xs text-muted-foreground">{field.title}</span>
        )}
      </div>
    );
  }

  if (field.fieldType === 'instruction') {
    return (
      <div className="py-1 px-3 bg-muted/50 rounded-md">
        <p className="text-sm text-muted-foreground">
          {field.description || field.title || 'Instruction'}
        </p>
      </div>
    );
  }

  // description
  return (
    <div className="py-1">
      {field.description && (
        <p className="text-sm text-muted-foreground">{field.description}</p>
      )}
    </div>
  );
}
