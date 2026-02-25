import type { FieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import {
  ChevronUp, ChevronDown, Copy, Trash2,
  Type, Hash, ToggleLeft, CheckSquare, CircleDot, ChevronDown as DropdownIcon,
  Calendar, Clock, Image, PenTool, Barcode, Link, Package, FileText,
  Layers, List, Minus, Info, Calculator, ArrowLeftRight, Database, Box,
} from 'lucide-react';

const FIELD_ICONS: Record<string, React.ElementType> = {
  text: Type,
  integer: Hash,
  number: Hash,
  boolean: ToggleLeft,
  checkbox: CheckSquare,
  radio: CircleDot,
  dropdown: DropdownIcon,
  date: Calendar,
  dateCalendar: Calendar,
  dateTime: Calendar,
  time: Clock,
  hosClock: Clock,
  instruction: Info,
  separator: Minus,
  calculation: Calculator,
  evaluation: ArrowLeftRight,
  photoCapture: Image,
  signature: PenTool,
  barcode: Barcode,
  deepLink: Link,
  commodity: Package,
  embedded: Box,
  metadata: Database,
  object: Layers,
  array: List,
  description: FileText,
};

const TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  integer: 'Integer',
  number: 'Number',
  boolean: 'Boolean',
  checkbox: 'Checkbox',
  radio: 'Radio',
  dropdown: 'Dropdown',
  date: 'Date',
  dateCalendar: 'Calendar',
  dateTime: 'DateTime',
  time: 'Time',
  hosClock: 'HOS Clock',
  instruction: 'Instruction',
  separator: 'Separator',
  calculation: 'Calculation',
  evaluation: 'Evaluation',
  photoCapture: 'Photo',
  signature: 'Signature',
  barcode: 'Barcode',
  deepLink: 'Deep Link',
  commodity: 'Commodity',
  embedded: 'Embedded',
  metadata: 'Metadata',
  object: 'Object',
  array: 'Array',
  description: 'Description',
};

interface FieldItemProps {
  field: FieldConfig;
  depth?: number;
  parentId?: string;
}

export function FieldItem({ field, depth = 0, parentId }: FieldItemProps) {
  const { selectedFieldId, selectField, removeField, moveField, duplicateField, addField } = useFormBuilderStore();
  const isSelected = selectedFieldId === field.id;
  const Icon = FIELD_ICONS[field.fieldType] ?? Type;
  const hasChildren = 'children' in field && field.children;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer border-l-2 transition-colors ${
          isSelected
            ? 'border-primary bg-primary/5'
            : 'border-transparent hover:bg-accent/50'
        }`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => selectField(field.id)}
      >
        <Icon size={14} className="text-muted-foreground flex-shrink-0" />
        <span className="text-xs font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded flex-shrink-0">
          {TYPE_LABELS[field.fieldType] ?? field.fieldType}
        </span>
        <span className="text-sm truncate flex-1">
          {field.title || field.widgetName}
        </span>
        {field.isRequired && (
          <span className="text-destructive text-xs flex-shrink-0">*</span>
        )}
        {field.isHidden && (
          <span className="text-muted-foreground text-xs flex-shrink-0">(hidden)</span>
        )}

        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 hover:opacity-100 flex-shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="p-0.5 rounded hover:bg-accent"
            onClick={() => moveField(field.id, 'up', parentId)}
            title="Move up"
          >
            <ChevronUp size={12} />
          </button>
          <button
            className="p-0.5 rounded hover:bg-accent"
            onClick={() => moveField(field.id, 'down', parentId)}
            title="Move down"
          >
            <ChevronDown size={12} />
          </button>
          <button
            className="p-0.5 rounded hover:bg-accent"
            onClick={() => duplicateField(field.id)}
            title="Duplicate"
          >
            <Copy size={12} />
          </button>
          <button
            className="p-0.5 rounded hover:bg-accent text-destructive"
            onClick={() => removeField(field.id)}
            title="Delete"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {hasChildren && (field as { children: FieldConfig[] }).children.map((child) => (
        <FieldItem
          key={child.id}
          field={child}
          depth={depth + 1}
          parentId={field.id}
        />
      ))}

      {hasChildren && (
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground py-1 transition-colors"
          style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
          onClick={(e) => {
            e.stopPropagation();
            addField('text', undefined, field.id);
          }}
        >
          <span className="text-xs">+ Add child field</span>
        </button>
      )}
    </div>
  );
}
