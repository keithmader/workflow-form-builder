import type { DateFieldConfig, DateTimeFieldConfig, TimeFieldConfig, HosClockFieldConfig } from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';

type DateLikeField = DateFieldConfig | DateTimeFieldConfig | TimeFieldConfig | HosClockFieldConfig;

export function DateProperties({ field }: { field: DateLikeField }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<DateLikeField>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Default Value</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.defaultValue ?? ''}
          onChange={(e) => update({ defaultValue: e.target.value || null } as Partial<DateLikeField>)}
          placeholder='e.g., "current" or a date string'
        />
      </div>
      <div>
        <label className="text-xs font-medium">Parameter Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.parameterName ?? ''}
          onChange={(e) => update({ parameterName: e.target.value || null } as Partial<DateLikeField>)}
          placeholder="$form.fieldName"
        />
      </div>
      {'timeZoneId' in field && (
        <div>
          <label className="text-xs font-medium">Time Zone</label>
          <input
            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
            value={(field as DateFieldConfig).timeZoneId ?? ''}
            onChange={(e) => update({ timeZoneId: e.target.value || null } as Partial<DateLikeField>)}
            placeholder="America/Denver, EET, Z"
          />
        </div>
      )}
      {'isCalendarStyle' in field && (
        <label className="flex items-center gap-1.5 text-sm">
          <input
            type="checkbox"
            checked={(field as DateFieldConfig).isCalendarStyle}
            onChange={(e) => update({ isCalendarStyle: e.target.checked } as Partial<DateLikeField>)}
          />
          Calendar style picker
        </label>
      )}
      {'hosClockType' in field && (
        <div>
          <label className="text-xs font-medium">HOS Clock Type</label>
          <select
            className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
            value={(field as HosClockFieldConfig).hosClockType}
            onChange={(e) => update({ hosClockType: e.target.value } as Partial<DateLikeField>)}
          >
            <option value="UNKNOWN_HOS_CLOCK">Unknown</option>
            <option value="HOS_11_HOUR_CLOCK">11 Hour Clock</option>
            <option value="HOS_14_HOUR_CLOCK">14 Hour Clock</option>
            <option value="HOS_70_HOUR_CLOCK">70 Hour Clock</option>
          </select>
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Min/max date limitations can be configured in the JSON editor for advanced use cases.
      </p>
    </div>
  );
}
