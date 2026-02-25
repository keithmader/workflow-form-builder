import { useEffect, useState, useCallback, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { isBuilderReady } from '@/lib/builderBridge';

export function JsonEditor() {
  const { fields, switchOperators, generateSchema, importSchema, generatedSchema, rawSchema, formLoadCounter } = useFormBuilderStore();
  const [localJson, setLocalJson] = useState<string>('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const justAppliedRef = useRef(false);
  const prevLoadCounterRef = useRef(formLoadCounter);

  // Detect form load/switch — always reset and show the saved JSON
  useEffect(() => {
    if (prevLoadCounterRef.current !== formLoadCounter) {
      prevLoadCounterRef.current = formLoadCounter;
      setIsEditing(false);
      justAppliedRef.current = false;
      setParseError(null);

      // Use persisted raw schema if available
      const currentRaw = useFormBuilderStore.getState().rawSchema;
      if (currentRaw) {
        try {
          setLocalJson(JSON.stringify(JSON.parse(currentRaw), null, 2));
        } catch {
          setLocalJson(currentRaw);
        }
        return;
      }

      // Otherwise generate from fields
      if (isBuilderReady()) {
        const schema = generateSchema();
        if (schema) setLocalJson(schema);
      }
      return;
    }
  }, [formLoadCounter, generateSchema]);

  // Auto-generate schema when fields change from canvas edits
  useEffect(() => {
    if (justAppliedRef.current) {
      justAppliedRef.current = false;
      return;
    }
    if (!isEditing && isBuilderReady()) {
      const schema = generateSchema();
      if (schema) {
        setLocalJson(schema);
        setParseError(null);
      }
    }
  }, [fields, switchOperators]);

  // Sync from store when generated externally (e.g. Export)
  useEffect(() => {
    if (generatedSchema && !isEditing) {
      setLocalJson(generatedSchema);
    }
  }, [generatedSchema]);

  const handleChange = useCallback((value: string | undefined) => {
    if (!value) return;
    justAppliedRef.current = false;
    setIsEditing(true);
    setLocalJson(value);

    // Validate JSON
    try {
      JSON.parse(value);
      setParseError(null);
    } catch (e) {
      setParseError((e as Error).message);
    }
  }, []);

  const handleApply = () => {
    if (parseError) return;

    // Try to parse into fields
    importSchema(localJson);

    // Always persist raw JSON and mark dirty — AFTER importSchema so it can't be overwritten
    useFormBuilderStore.setState({ rawSchema: localJson, isDirty: true });

    justAppliedRef.current = true;
    setParseError(null);
    setIsEditing(false);
  };

  const handleRefresh = () => {
    justAppliedRef.current = false;
    setIsEditing(false);
    const schema = generateSchema();
    if (schema) {
      setLocalJson(schema);
      setParseError(null);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card">
        <span className="text-xs font-medium text-muted-foreground">JSON Schema</span>
        <div className="flex gap-1">
          {isEditing && (
            <>
              <button
                className="px-2 py-0.5 text-xs rounded bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                onClick={handleApply}
                disabled={!!parseError}
              >
                Apply
              </button>
              <button
                className="px-2 py-0.5 text-xs rounded hover:bg-accent"
                onClick={handleRefresh}
              >
                Discard
              </button>
            </>
          )}
          <button
            className="px-2 py-0.5 text-xs rounded hover:bg-accent"
            onClick={() => {
              navigator.clipboard.writeText(localJson);
            }}
          >
            Copy
          </button>
        </div>
      </div>
      {parseError && (
        <div className="px-3 py-1 bg-destructive/10 text-destructive text-xs border-b border-border">
          {parseError}
        </div>
      )}
      <div className="flex-1">
        <Editor
          defaultLanguage="json"
          value={localJson}
          onChange={handleChange}
          theme="vs-light"
          options={{
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            formatOnPaste: true,
            automaticLayout: true,
            tabSize: 2,
          }}
        />
      </div>
    </div>
  );
}
