import { CheckCircle2, Circle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useJobTesterStore } from '@/stores/jobTesterStore';

export function JobTesterProgress() {
  const {
    parsedJob,
    currentStepIndex,
    currentTaskIndex,
    responses,
    goToTask,
  } = useJobTesterStore();

  if (!parsedJob) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="text-sm font-semibold">Progress</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          {responses.size} of{' '}
          {parsedJob.steps.reduce((s, st) => s + st.tasks.length, 0)} tasks
        </p>
      </div>
      <div className="flex-1 overflow-y-auto py-1">
        {parsedJob.steps.map((step, si) => (
          <StepAccordion
            key={si}
            stepName={step.name}
            stepType={step.type}
            stepIndex={si}
            tasks={step.tasks.map((task, ti) => ({
              name: task.name,
              type: task.type,
              taskIndex: ti,
              isActive: si === currentStepIndex && ti === currentTaskIndex,
              isCompleted: responses.has(task.id),
            }))}
            isCurrentStep={si === currentStepIndex}
            onTaskClick={(ti) => goToTask(si, ti)}
          />
        ))}
      </div>
    </div>
  );
}

interface StepAccordionProps {
  stepName: string;
  stepType: string;
  stepIndex: number;
  tasks: {
    name: string;
    type: string;
    taskIndex: number;
    isActive: boolean;
    isCompleted: boolean;
  }[];
  isCurrentStep: boolean;
  onTaskClick: (taskIndex: number) => void;
}

function StepAccordion({
  stepName,
  stepType,
  tasks,
  isCurrentStep,
  onTaskClick,
}: StepAccordionProps) {
  const [open, setOpen] = useState(isCurrentStep);

  return (
    <div>
      <button
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center gap-2 px-3 py-2 text-left text-xs hover:bg-accent/50 transition-colors ${
          isCurrentStep ? 'bg-accent/30' : ''
        }`}
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        <span className="font-medium truncate flex-1">{stepName}</span>
        <span className="text-[10px] text-muted-foreground">{stepType}</span>
      </button>

      {open && (
        <div className="pl-4">
          {tasks.map((task) => (
            <button
              key={task.taskIndex}
              onClick={() => onTaskClick(task.taskIndex)}
              className={`w-full flex items-center gap-2 px-3 py-1.5 text-xs text-left transition-colors ${
                task.isActive
                  ? 'bg-primary/10 text-primary font-medium'
                  : 'hover:bg-accent/50 text-foreground'
              }`}
            >
              {task.isCompleted ? (
                <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
              ) : (
                <Circle size={12} className="text-muted-foreground flex-shrink-0" />
              )}
              <span className="truncate">{task.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
