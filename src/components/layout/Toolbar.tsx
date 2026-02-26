import { useEffect, useCallback } from 'react';
import { useFormBuilderStore } from '@/stores/formBuilderStore';
import { useProjectStore } from '@/stores/projectStore';
import { isBuilderReady } from '@/lib/builderBridge';
import {
  Plus, Download, Upload, Undo2, Redo2, FileJson, /* Eye, */ Save,
} from 'lucide-react';
import { useState, useRef } from 'react';
import { UnsavedChangesDialog } from '@/components/explorer/ExplorerDialogs';

interface ToolbarProps {
  // onTogglePreview: () => void;
  onToggleJson: () => void;
  // showPreview: boolean;
  showJson: boolean;
}

export function Toolbar({ /* onTogglePreview, */ onToggleJson, /* showPreview, */ showJson }: ToolbarProps) {
  const {
    formName, newForm, undo, redo,
    historyIndex, history, generateSchema, importSchema,
    isDirty, getFormSnapshot,
  } = useFormBuilderStore();

  const { activeFormId, updateSavedForm, projects, saveForm, createProject } = useProjectStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importError, setImportError] = useState<string | null>(null);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;
  const builderReady = isBuilderReady();

  const handleSave = useCallback(() => {
    const snapshot = getFormSnapshot();

    if (activeFormId) {
      // Update existing saved form
      updateSavedForm(
        activeFormId,
        snapshot.formName, snapshot.formTitle, snapshot.formDescription,
        snapshot.fields, snapshot.switchOperators,
        snapshot.rawSchema,
      );
    } else {
      // No active form yet — save into the first project, or create one
      let projectId = projects[0]?.id;
      if (!projectId) {
        projectId = createProject('My Project');
      }
      saveForm(
        projectId,
        snapshot.formName || 'NewForm',
        snapshot.formTitle || 'New Form',
        snapshot.formDescription || '',
        snapshot.fields,
        snapshot.switchOperators,
        undefined,
        undefined,
        snapshot.rawSchema,
      );
    }
    useFormBuilderStore.setState({ isDirty: false });
  }, [activeFormId, getFormSnapshot, updateSavedForm, projects, saveForm, createProject]);

  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);

  const handleNew = useCallback(() => {
    if (isDirty) {
      setShowUnsavedDialog(true);
      return;
    }
    newForm();
    useProjectStore.getState().setActiveFormId(null);
  }, [isDirty, newForm]);

  const handleSaveAndNew = useCallback(() => {
    handleSave();
    newForm();
    useProjectStore.getState().setActiveFormId(null);
    setShowUnsavedDialog(false);
  }, [handleSave, newForm]);

  // Ctrl+S shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSave]);

  // Build breadcrumb for active form
  const breadcrumb = (() => {
    if (!activeFormId) return null;
    const parts: string[] = [];
    for (const project of projects) {
      if (project.uncategorizedForms.some(f => f.formId === activeFormId)) {
        parts.push(project.name);
        break;
      }
      for (const child of project.children) {
        if (child.uncategorizedForms.some(f => f.formId === activeFormId)) {
          parts.push(project.name, child.name);
          break;
        }
        for (const cat of child.categories) {
          if (cat.formRefs.some(f => f.formId === activeFormId)) {
            parts.push(project.name, child.name, cat.name);
            break;
          }
        }
        if (parts.length) break;
      }
      if (parts.length) break;
    }
    return parts.length > 0 ? parts : null;
  })();

  const handleExport = () => {
    const schema = generateSchema();
    if (!schema) return;
    const blob = new Blob([schema], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${formName}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      const success = importSchema(text);
      if (!success) {
        setImportError('Failed to parse schema. Check format.');
        setTimeout(() => setImportError(null), 3000);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const btnClass = 'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md hover:bg-accent transition-colors disabled:opacity-40';

  return (
    <div className="h-12 border-b border-border bg-card flex items-center px-4 gap-2">
      <div className="flex items-center gap-2 mr-4">
        <span className="font-semibold text-sm text-foreground">Form Builder</span>
        {breadcrumb && (
          <>
            <span className="text-muted-foreground">|</span>
            <span className="text-xs text-muted-foreground truncate max-w-48">
              {breadcrumb.join(' / ')}
            </span>
          </>
        )}
      </div>

      <button className={btnClass} onClick={handleNew} title="New Form">
        <Plus size={16} /> New
      </button>

      <button
        className={isDirty
          ? 'flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
          : btnClass
        }
        onClick={handleSave}
        title="Save Form (Ctrl+S)"
      >
        <Save size={16} /> Save
      </button>

      <div className="h-5 w-px bg-border" />

      <button className={btnClass} onClick={() => fileInputRef.current?.click()} title="Import JSON">
        <Upload size={16} /> Import
      </button>
      <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImportFile} />

      <button className={btnClass} onClick={handleExport} disabled={!builderReady} title="Export JSON">
        <Download size={16} /> Export
      </button>

      <div className="h-5 w-px bg-border" />

      <button className={btnClass} onClick={undo} disabled={!canUndo} title="Undo">
        <Undo2 size={16} />
      </button>
      <button className={btnClass} onClick={redo} disabled={!canRedo} title="Redo">
        <Redo2 size={16} />
      </button>

      <div className="flex-1" />

      {importError && (
        <span className="text-destructive text-xs mr-2">{importError}</span>
      )}

      <button
        className={`${btnClass} ${showJson ? 'bg-accent' : ''}`}
        onClick={onToggleJson}
        title="Toggle JSON Editor"
      >
        <FileJson size={16} /> JSON
      </button>

      {/* Preview button — commented out
      <button
        className={`${btnClass} ${showPreview ? 'bg-accent' : ''}`}
        onClick={onTogglePreview}
        title="Toggle Preview"
      >
        <Eye size={16} /> Preview
      </button>
      */}

      {!builderReady && (
        <span className="text-xs text-destructive ml-2">Builder not loaded</span>
      )}

      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onSave={handleSaveAndNew}
        onCancel={() => setShowUnsavedDialog(false)}
      />
    </div>
  );
}
