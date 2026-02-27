import type { FieldConfig } from '@/types/schema';

interface StubFieldProps {
  field: FieldConfig;
}

const STUB_LABELS: Record<string, string> = {
  signature: 'Signature Pad',
  photoCapture: 'Photo Capture',
  barcode: 'Barcode Scanner',
  deepLink: 'Deep Link',
  commodity: 'Commodity',
  embedded: 'Embedded Form',
  metadata: 'Metadata',
  calculation: 'Calculation',
  evaluation: 'Evaluation',
};

export function StubField({ field }: StubFieldProps) {
  const label = STUB_LABELS[field.fieldType] ?? field.fieldType;

  return (
    <div className="px-3 py-3 bg-muted/30 border border-dashed border-border rounded-md">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
          <span className="text-xs text-muted-foreground font-mono">
            {field.fieldType.slice(0, 2).toUpperCase()}
          </span>
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-xs text-muted-foreground/60">
            Not available in tester (device-only feature)
          </p>
        </div>
      </div>
    </div>
  );
}
