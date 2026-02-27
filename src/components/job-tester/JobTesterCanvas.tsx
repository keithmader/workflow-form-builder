import { useMemo, useCallback } from 'react';
import { ChevronLeft, ChevronRight, SkipForward, Send, Flag } from 'lucide-react';
import { useJobTesterStore } from '@/stores/jobTesterStore';
import { useProjectStore } from '@/stores/projectStore';
import { buildReferenceContext } from '@/utils/referenceResolver';
import { validateForm } from '@/utils/formValidator';
import {
  evaluateConditionals,
  collectToggleOperators,
} from '@/utils/conditionalEngine';
import { FormRenderer } from './renderer/FormRenderer';

export function JobTesterCanvas() {
  const {
    parsedJob,
    currentStepIndex,
    currentTaskIndex,
    currentFormValues,
    flatTaskList,
    responses,
    resolveForm,
    updateFormValue,
    submitCurrentTask,
    skipCurrentTask,
    goToPrev,
    finishTesting,
  } = useJobTesterStore();

  const savedForms = useProjectStore((s) => s.savedForms);

  if (!parsedJob) return null;

  const step = parsedJob.steps[currentStepIndex];
  const task = step?.tasks[currentTaskIndex];
  if (!step || !task) return null;

  // Compute flat index for progress
  const currentFlatIndex = flatTaskList.findIndex(
    (e) => e.stepIndex === currentStepIndex && e.taskIndex === currentTaskIndex,
  );
  const totalTasks = flatTaskList.length;

  // Resolve the form for this task (project forms first, then schemas fallback)
  const resolved = useMemo(
    () => resolveForm(task.type, savedForms),
    [task.type, savedForms, resolveForm],
  );

  // Build reference context
  const context = useMemo(() => {
    const locations = parsedJob.raw.locations as Record<string, unknown>[] | undefined;
    return buildReferenceContext(parsedJob.raw, step.raw, task.raw, locations);
  }, [parsedJob.raw, step.raw, task.raw]);

  const handleValueChange = useCallback(
    (name: string, value: unknown) => {
      updateFormValue(name, value);
    },
    [updateFormValue],
  );

  const handleSubmit = () => {
    if (!resolved) {
      submitCurrentTask(true, []);
      return;
    }

    const toggleOps = collectToggleOperators(resolved.fields);
    const condState = evaluateConditionals(
      resolved.switchOperators,
      toggleOps,
      currentFormValues,
      context,
    );
    const result = validateForm(resolved.fields, currentFormValues, condState);
    submitCurrentTask(result.isValid, result.errors);
  };

  const isAlreadySubmitted = responses.has(task.id);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{step.name}</span>
              <span>/</span>
              <span className="text-foreground font-medium">{task.name}</span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <p className="text-xs text-muted-foreground">
                Form: <span className="font-mono">{task.type}</span>
              </p>
              {resolved && (
                <span
                  className={`text-[10px] px-1 py-0.5 rounded ${
                    resolved.source === 'project'
                      ? 'bg-green-500/10 text-green-700'
                      : 'bg-blue-500/10 text-blue-700'
                  }`}
                >
                  {resolved.source === 'project' ? 'project' : 'schemas'}
                </span>
              )}
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Task {currentFlatIndex + 1} of {totalTasks}
          </div>
        </div>

        {/* Progress bar */}
        <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{
              width: `${((currentFlatIndex + 1) / totalTasks) * 100}%`,
            }}
          />
        </div>
      </div>

      {/* Body — scrollable form */}
      <div className="flex-1 overflow-y-auto p-4">
        {!resolved ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">
              No form definition found for type{' '}
              <span className="font-mono font-medium">{task.type}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Add this form to your project or load a schemas JSON. You can skip this task.
            </p>
          </div>
        ) : (
          <FormRenderer
            fields={resolved.fields}
            switchOperators={resolved.switchOperators}
            values={currentFormValues}
            onValueChange={handleValueChange}
            context={context}
          />
        )}
      </div>

      {/* Footer navigation */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center justify-between">
        <button
          onClick={goToPrev}
          disabled={currentFlatIndex === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent disabled:opacity-50 transition-colors"
        >
          <ChevronLeft size={14} />
          Prev
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={skipCurrentTask}
            className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border text-muted-foreground hover:bg-accent transition-colors"
          >
            <SkipForward size={14} />
            Skip
          </button>

          {currentFlatIndex === totalTasks - 1 ? (
            <button
              onClick={() => {
                handleSubmit();
                setTimeout(() => finishTesting(), 100);
              }}
              className="flex items-center gap-1 px-4 py-1.5 text-sm rounded-md bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Flag size={14} />
              Submit & Finish
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className={`flex items-center gap-1 px-4 py-1.5 text-sm rounded-md transition-colors ${
                isAlreadySubmitted
                  ? 'bg-primary/80 text-primary-foreground hover:bg-primary'
                  : 'bg-primary text-primary-foreground hover:bg-primary/90'
              }`}
            >
              <Send size={14} />
              {isAlreadySubmitted ? 'Resubmit & Next' : 'Submit & Next'}
              <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
