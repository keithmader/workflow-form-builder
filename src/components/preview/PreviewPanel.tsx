import { useEffect, useRef, useState, useCallback } from 'react';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { isBuilderReady } from '@/lib/builderBridge';
import { RefreshCw } from 'lucide-react';

export function PreviewPanel() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { fields, switchOperators, generateSchema } = useFormBuilderStore();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [previewAvailable, setPreviewAvailable] = useState(false);

  // Check if preview files exist
  useEffect(() => {
    fetch('/preview/index.html', { method: 'HEAD' })
      .then(res => setPreviewAvailable(res.ok))
      .catch(() => setPreviewAvailable(false));
  }, []);

  const refreshPreview = useCallback(() => {
    if (!isBuilderReady() || !iframeRef.current || !previewAvailable) return;
    const schema = generateSchema();
    if (!schema) return;

    try {
      const iframe = iframeRef.current;
      // We need to set sessionStorage in the iframe's context
      // Since same-origin, we can access contentWindow
      if (iframe.contentWindow) {
        iframe.contentWindow.sessionStorage.setItem('schema', schema);
        iframe.src = '/preview/index.html';
      }
    } catch (e) {
      console.error('Preview refresh error:', e);
    }
  }, [generateSchema, previewAvailable]);

  useEffect(() => {
    if (!autoRefresh) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(refreshPreview, 1000);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [fields, switchOperators, autoRefresh, refreshPreview]);

  if (!previewAvailable) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card">
          <span className="text-xs font-medium text-muted-foreground">Preview</span>
        </div>
        <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm p-4">
          <div className="text-center space-y-2">
            <p>Preview not available</p>
            <p className="text-xs">
              Build the WorkflowEngine web module and copy files to <code className="bg-muted px-1 rounded">public/preview/</code>
            </p>
            <p className="text-xs">
              Run: <code className="bg-muted px-1 rounded">scripts/build-kotlin.sh</code>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-border bg-card">
        <span className="text-xs font-medium text-muted-foreground">Preview</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1 text-xs">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            Auto
          </label>
          <button
            className="p-1 rounded hover:bg-accent"
            onClick={refreshPreview}
            title="Refresh preview"
          >
            <RefreshCw size={12} />
          </button>
        </div>
      </div>
      <div className="flex-1">
        <iframe
          ref={iframeRef}
          src="/preview/index.html"
          className="w-full h-full border-0"
          title="Form Preview"
        />
      </div>
    </div>
  );
}
