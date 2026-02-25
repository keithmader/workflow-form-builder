import type {
  InstructionFieldConfig, SeparatorFieldConfig, CalculationFieldConfig,
  EvaluationFieldConfig, PhotoCaptureFieldConfig, SignatureFieldConfig,
  BarcodeFieldConfig, DeepLinkFieldConfig, CommodityFieldConfig,
  EmbeddedFieldConfig, MetadataFieldConfig,
} from '@/types/schema';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { NumberRefInput, BooleanRefInput } from '@/components/shared/ReferenceValueInput';
import { Plus, Trash2 } from 'lucide-react';

export function InstructionProperties({ field }: { field: InstructionFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<InstructionFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">Use %s in the description to reference other fields.</p>
      <div>
        <label className="text-xs font-medium">Format Arguments</label>
        {field.stringFormatArgs.map((arg, i) => (
          <div key={i} className="flex items-center gap-1 mt-1">
            <input
              className="flex-1 bg-transparent border border-border rounded px-2 py-0.5 text-sm font-mono text-xs focus:outline-none focus:ring-1 focus:ring-ring"
              value={arg}
              onChange={(e) => {
                const args = [...field.stringFormatArgs];
                args[i] = e.target.value;
                update({ stringFormatArgs: args });
              }}
              placeholder="$this.FieldName"
            />
            <button className="p-0.5 text-destructive" onClick={() => {
              update({ stringFormatArgs: field.stringFormatArgs.filter((_, j) => j !== i) });
            }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
          onClick={() => update({ stringFormatArgs: [...field.stringFormatArgs, ''] })}
        >
          <Plus size={12} /> Add argument
        </button>
      </div>
    </div>
  );
}

export function SeparatorProperties({ field }: { field: SeparatorFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Separator Text</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.defaultValue ?? ''}
          onChange={(e) => updateField(field.id, { defaultValue: e.target.value || null })}
          placeholder=":"
        />
      </div>
    </div>
  );
}

export function CalculationProperties({ field }: { field: CalculationFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<CalculationFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Formula</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.calculationFormula}
          onChange={(e) => update({ calculationFormula: e.target.value })}
          placeholder="$this.Field1 - $this.Field2"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Parameter Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.parameterName ?? ''}
          onChange={(e) => update({ parameterName: e.target.value || null })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">Decimal Places</label>
        <input
          type="number"
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.decimalPlaces ?? ''}
          onChange={(e) => update({ decimalPlaces: e.target.value ? Number(e.target.value) : null })}
        />
      </div>
    </div>
  );
}

export function EvaluationProperties({ field }: { field: EvaluationFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<EvaluationFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Reference to Value</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.referenceToValue}
          onChange={(e) => update({ referenceToValue: e.target.value })}
          placeholder="$this.FieldName"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Reference to Decrease Value</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.referenceToDecreaseValue}
          onChange={(e) => update({ referenceToDecreaseValue: e.target.value })}
          placeholder="$this.FieldName"
        />
      </div>
      <div>
        <label className="text-xs font-medium">Parameter Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.parameterName ?? ''}
          onChange={(e) => update({ parameterName: e.target.value || null })}
        />
      </div>
    </div>
  );
}

export function PhotoCaptureProperties({ field }: { field: PhotoCaptureFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<PhotoCaptureFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <NumberRefInput label="Min Photos" value={field.minNumberOfPhotos} onChange={(v) => update({ minNumberOfPhotos: v })} />
      <NumberRefInput label="Max Photos" value={field.maxNumberOfPhotos} onChange={(v) => update({ maxNumberOfPhotos: v })} />
    </div>
  );
}

export function SignatureProperties({ field }: { field: SignatureFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<SignatureFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Signature Message</label>
        <textarea
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring resize-none"
          rows={3}
          value={field.signatureMessage ?? ''}
          onChange={(e) => update({ signatureMessage: e.target.value || null })}
          placeholder="Certification message..."
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Signature entries can be configured in the JSON editor for advanced use cases.
      </p>
    </div>
  );
}

export function BarcodeProperties({ field }: { field: BarcodeFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<BarcodeFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <BooleanRefInput label="Allow Duplicates" value={field.allowDuplicates} onChange={(v) => update({ allowDuplicates: v })} />
      <NumberRefInput label="Min Characters" value={field.minCharacters} onChange={(v) => update({ minCharacters: v })} />
      <NumberRefInput label="Max Characters" value={field.maxCharacters} onChange={(v) => update({ maxCharacters: v })} />
      <NumberRefInput label="Min Barcodes" value={field.minBarcodes} onChange={(v) => update({ minBarcodes: v })} />
      <NumberRefInput label="Max Barcodes" value={field.maxBarcodes} onChange={(v) => update({ maxBarcodes: v })} />
    </div>
  );
}

export function DeepLinkProperties({ field }: { field: DeepLinkFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<DeepLinkFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Button Label</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.label}
          onChange={(e) => update({ label: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">Link Type</label>
        <select
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.deepLinkType}
          onChange={(e) => update({ deepLinkType: e.target.value as 'object' | 'url' })}
        >
          <option value="url">URL</option>
          <option value="object">JSON Object</option>
        </select>
      </div>
      <div>
        <label className="text-xs font-medium">{field.deepLinkType === 'url' ? 'URL' : 'JSON'}</label>
        <textarea
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs resize-none"
          rows={3}
          value={field.deepLinkValue}
          onChange={(e) => update({ deepLinkValue: e.target.value })}
          placeholder={field.deepLinkType === 'url' ? 'dvir://main/tractor?...' : '{"scheme":"dvir",...}'}
        />
      </div>
    </div>
  );
}

export function CommodityProperties({ field }: { field: CommodityFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<CommodityFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Commodity ID</label>
        <input
          type="number"
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.commodityId}
          onChange={(e) => update({ commodityId: Number(e.target.value) || 0 })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">Parameter Name</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.parameterName ?? ''}
          onChange={(e) => update({ parameterName: e.target.value || null })}
        />
      </div>
    </div>
  );
}

export function EmbeddedProperties({ field }: { field: EmbeddedFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Reference Container ID</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring font-mono text-xs"
          value={field.referenceContainerId}
          onChange={(e) => updateField(field.id, { referenceContainerId: e.target.value })}
        />
      </div>
    </div>
  );
}

export function MetadataProperties({ field }: { field: MetadataFieldConfig }) {
  const updateField = useFormBuilderStore((s) => s.updateField);
  const update = (updates: Partial<MetadataFieldConfig>) => updateField(field.id, updates);

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium">Metadata ID</label>
        <input
          className="w-full bg-transparent border border-border rounded px-2 py-1 text-sm mt-1 focus:outline-none focus:ring-1 focus:ring-ring"
          value={field.metadataId}
          onChange={(e) => update({ metadataId: e.target.value })}
        />
      </div>
      <div>
        <label className="text-xs font-medium">Entries</label>
        {field.metadataEntries.map((entry, i) => (
          <div key={i} className="flex items-center gap-1 mt-1">
            <input
              className="flex-1 bg-transparent border border-border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={entry.key}
              onChange={(e) => {
                const entries = [...field.metadataEntries];
                entries[i] = { ...entries[i], key: e.target.value };
                update({ metadataEntries: entries });
              }}
              placeholder="Key"
            />
            <input
              className="flex-1 bg-transparent border border-border rounded px-2 py-0.5 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
              value={entry.value}
              onChange={(e) => {
                const entries = [...field.metadataEntries];
                entries[i] = { ...entries[i], value: e.target.value };
                update({ metadataEntries: entries });
              }}
              placeholder="Value"
            />
            <button className="p-0.5 text-destructive" onClick={() => {
              update({ metadataEntries: field.metadataEntries.filter((_, j) => j !== i) });
            }}>
              <Trash2 size={12} />
            </button>
          </div>
        ))}
        <button
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground mt-1"
          onClick={() => update({ metadataEntries: [...field.metadataEntries, { key: '', value: '' }] })}
        >
          <Plus size={12} /> Add entry
        </button>
      </div>
    </div>
  );
}
