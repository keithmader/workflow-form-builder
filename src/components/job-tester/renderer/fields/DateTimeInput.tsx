import type {
  DateFieldConfig,
  DateTimeFieldConfig,
  TimeFieldConfig,
  HosClockFieldConfig,
} from '@/types/schema';

type DateTimeField = DateFieldConfig | DateTimeFieldConfig | TimeFieldConfig | HosClockFieldConfig;

interface DateTimeInputProps {
  field: DateTimeField;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

export function DateTimeInput({ field, value, onChange, disabled, error }: DateTimeInputProps) {
  let inputType: string;
  switch (field.fieldType) {
    case 'date':
    case 'dateCalendar':
      inputType = 'date';
      break;
    case 'dateTime':
      inputType = 'datetime-local';
      break;
    case 'time':
    case 'hosClock':
      inputType = 'time';
      break;
    default:
      inputType = 'text';
  }

  return (
    <div className="space-y-1">
      <input
        type={inputType}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || field.isUneditable}
        className={`w-full px-3 py-2 rounded-md border text-sm bg-background ${
          error ? 'border-red-500' : 'border-border'
        } focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50`}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
