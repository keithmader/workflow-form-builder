import type { FieldType } from '@/types/schema';
import { Plus } from 'lucide-react';

interface FieldTypeCardProps {
  type: FieldType;
  label: string;
  description: string;
  onAdd: (type: FieldType) => void;
}

export function FieldTypeCard({ type, label, description, onAdd }: FieldTypeCardProps) {
  return (
    <button
      className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-sm rounded hover:bg-accent transition-colors group"
      onClick={() => onAdd(type)}
    >
      <Plus size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
      <div className="min-w-0">
        <div className="font-medium text-foreground truncate">{label}</div>
        <div className="text-xs text-muted-foreground truncate">{description}</div>
      </div>
    </button>
  );
}
