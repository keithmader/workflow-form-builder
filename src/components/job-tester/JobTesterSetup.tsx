import { useCallback, useRef } from 'react';
import { Upload, AlertTriangle, Play, RotateCcw, CheckCircle2, FileText, Package } from 'lucide-react';
import { useJobTesterStore } from '@/stores/jobTesterStore';
import { useProjectStore } from '@/stores/projectStore';

export function JobTesterSetup() {
  const {
    parsedJob,
    rawJobJson,
    rawSchemasJson,
    schemaDefinitions,
    loadJobJson,
    loadSchemasJson,
    startTesting,
    hasFormForTask,
    reset,
  } = useJobTesterStore();

  const savedForms = useProjectStore((s) => s.savedForms);

  const jobInputRef = useRef<HTMLInputElement>(null);
  const schemasInputRef = useRef<HTMLInputElement>(null);

  const handleFileLoad = useCallback(
    (handler: (json: string) => { success: boolean; error?: string }) =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          const result = handler(reader.result as string);
          if (!result.success) {
            alert(result.error ?? 'Failed to parse file');
          }
        };
        reader.readAsText(file);
        e.target.value = '';
      },
    [],
  );

  // Count project forms
  const projectFormNames = Object.values(savedForms).map((f) => f.formName);
  const projectFormCount = projectFormNames.length;

  // Compute missing/matched form definitions
  const missingTypes: string[] = [];
  const matchedTypes: { type: string; source: 'project' | 'schemas' }[] = [];
  if (parsedJob) {
    const seen = new Set<string>();
    for (const step of parsedJob.steps) {
      for (const task of step.tasks) {
        if (task.type && !seen.has(task.type)) {
          seen.add(task.type);
          if (hasFormForTask(task.type, savedForms)) {
            // Determine source
            const inProject = projectFormNames.some(
              (n) => n.toLowerCase() === task.type.toLowerCase(),
            );
            matchedTypes.push({
              type: task.type,
              source: inProject ? 'project' : 'schemas',
            });
          } else {
            missingTypes.push(task.type);
          }
        }
      }
    }
  }

  const totalTasks = parsedJob?.steps.reduce((sum, s) => sum + s.tasks.length, 0) ?? 0;
  const canStart = !!parsedJob;

  const handleStart = () => {
    const result = startTesting();
    if (!result.success) {
      alert(result.error);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Job Tester</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Load a job JSON to test your forms
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {/* Project forms summary */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Package size={12} className="text-muted-foreground" />
            <span className="text-xs font-medium">Project Forms</span>
          </div>
          {projectFormCount > 0 ? (
            <div className="text-xs pl-1">
              <p>
                <span className="font-medium text-green-600">{projectFormCount}</span>
                <span className="text-muted-foreground"> form{projectFormCount !== 1 ? 's' : ''} available: </span>
              </p>
              <div className="flex flex-wrap gap-1 mt-1">
                {projectFormNames.map((name) => (
                  <span
                    key={name}
                    className="px-1.5 py-0.5 bg-green-500/10 text-green-700 text-[10px] rounded font-mono"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground pl-1">
              No forms in project. Import or build forms first, or load a schemas JSON below.
            </p>
          )}
        </div>

        {/* Job JSON upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText size={12} className="text-muted-foreground" />
            <span className="text-xs font-medium">Job JSON</span>
            {rawJobJson && <CheckCircle2 size={12} className="text-green-500" />}
          </div>
          <input
            ref={jobInputRef}
            type="file"
            accept=".json"
            onChange={handleFileLoad(loadJobJson)}
            className="hidden"
          />
          <button
            onClick={() => jobInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors"
          >
            <Upload size={14} />
            {rawJobJson ? 'Replace Job JSON' : 'Load Job JSON'}
          </button>

          {parsedJob && (
            <div className="text-xs space-y-0.5 pl-1">
              <p>
                <span className="text-muted-foreground">Steps:</span>{' '}
                <span className="font-medium">{parsedJob.steps.length}</span>
                <span className="text-muted-foreground ml-2">Tasks:</span>{' '}
                <span className="font-medium">{totalTasks}</span>
              </p>
              {parsedJob.raw.external_id != null && (
                <p>
                  <span className="text-muted-foreground">ID:</span>{' '}
                  <span className="font-mono text-[10px]">
                    {String(parsedJob.raw.external_id)}
                  </span>
                </p>
              )}
            </div>
          )}
        </div>

        {/* Optional schemas JSON upload */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              Schemas JSON
            </span>
            <span className="text-[10px] text-muted-foreground/60">(optional fallback)</span>
            {rawSchemasJson && <CheckCircle2 size={12} className="text-green-500" />}
          </div>
          <input
            ref={schemasInputRef}
            type="file"
            accept=".json"
            onChange={handleFileLoad(loadSchemasJson)}
            className="hidden"
          />
          <button
            onClick={() => schemasInputRef.current?.click()}
            className="w-full flex items-center gap-2 px-3 py-2 border border-dashed border-border rounded-md text-xs text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors"
          >
            <Upload size={14} />
            {rawSchemasJson ? 'Replace Schemas JSON' : 'Load Schemas JSON'}
          </button>
          <p className="text-[10px] text-muted-foreground/60 pl-1">
            Used for task types not found in your project forms
          </p>

          {schemaDefinitions && (
            <p className="text-xs pl-1">
              <span className="text-muted-foreground">Schema definitions:</span>{' '}
              <span className="font-medium">{Object.keys(schemaDefinitions).length}</span>
            </p>
          )}
        </div>

        {/* Form coverage */}
        {parsedJob && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Form Coverage</span>
            {matchedTypes.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {matchedTypes.map((m) => (
                  <span
                    key={m.type}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                      m.source === 'project'
                        ? 'bg-green-500/10 text-green-700'
                        : 'bg-blue-500/10 text-blue-700'
                    }`}
                    title={m.source === 'project' ? 'From project' : 'From schemas JSON'}
                  >
                    {m.type}
                  </span>
                ))}
              </div>
            )}

            {missingTypes.length > 0 && (
              <div className="border border-yellow-500/30 bg-yellow-500/10 rounded-md p-2 space-y-1">
                <div className="flex items-center gap-1">
                  <AlertTriangle size={12} className="text-yellow-500" />
                  <span className="text-xs font-medium text-yellow-600">
                    Missing definitions ({missingTypes.length})
                  </span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {missingTypes.map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 bg-yellow-500/20 text-yellow-700 text-[10px] rounded font-mono"
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-yellow-600/80">
                  Load a schemas JSON or add these forms to your project
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step/Task overview */}
        {parsedJob && (
          <div className="space-y-1.5">
            <span className="text-xs font-medium">Steps & Tasks</span>
            {parsedJob.steps.map((step, si) => (
              <div key={si} className="text-xs pl-1">
                <p className="font-medium">
                  {step.name}{' '}
                  <span className="text-muted-foreground font-normal">({step.type})</span>
                </p>
                <ul className="pl-3 space-y-0.5">
                  {step.tasks.map((task, ti) => {
                    const hasForm = hasFormForTask(task.type, savedForms);
                    return (
                      <li key={ti} className="text-muted-foreground flex items-center gap-1">
                        {hasForm ? (
                          <CheckCircle2 size={10} className="text-green-500 flex-shrink-0" />
                        ) : (
                          <AlertTriangle size={10} className="text-yellow-500 flex-shrink-0" />
                        )}
                        <span>{task.name}</span>
                        <span className="font-mono text-[10px]">{task.type}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom actions */}
      <div className="p-3 border-t border-border space-y-2">
        <button
          onClick={handleStart}
          disabled={!canStart}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 hover:bg-primary/90 transition-colors"
        >
          <Play size={14} />
          Start Testing
        </button>
        {rawJobJson && (
          <button
            onClick={reset}
            className="w-full flex items-center justify-center gap-2 px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <RotateCcw size={12} />
            Reset
          </button>
        )}
      </div>
    </div>
  );
}
