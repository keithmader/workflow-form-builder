import { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Download,
  RotateCcw,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { useJobTesterStore } from '@/stores/jobTesterStore';

export function JobTesterResults() {
  const { parsedJob, responses, flatTaskList, reset } = useJobTesterStore();

  if (!parsedJob) return null;

  const responseList = flatTaskList.map((entry) => ({
    ...entry,
    response: responses.get(entry.task.id),
  }));

  const submitted = responseList.filter((r) => r.response).length;
  const skipped = flatTaskList.length - submitted;

  const handleExport = () => {
    const exportData = {
      exportedAt: new Date().toISOString(),
      jobId: parsedJob.raw.external_id ?? parsedJob.raw.id,
      summary: { total: flatTaskList.length, submitted, skipped },
      responses: responseList
        .filter((r) => r.response)
        .map((r) => r.response),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `job-tester-results-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h2 className="text-sm font-semibold">Test Results</h2>
        <p className="text-xs text-muted-foreground mt-0.5">
          {submitted} submitted, {skipped} skipped out of {flatTaskList.length} tasks
        </p>
      </div>

      {/* Results list */}
      <div className="flex-1 overflow-y-auto">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-background border-b border-border">
            <tr>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Step
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Task
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Status
              </th>
              <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {responseList.map((entry, idx) => (
              <ResultRow key={idx} entry={entry} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border bg-muted/30 flex items-center gap-2">
        <button
          onClick={handleExport}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          <Download size={14} />
          Export All
        </button>
        <button
          onClick={reset}
          className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-border hover:bg-accent transition-colors"
        >
          <RotateCcw size={14} />
          Start Over
        </button>
      </div>
    </div>
  );
}

interface ResultRowProps {
  entry: {
    stepName: string;
    task: { id: string; name: string; type: string };
    response?: {
      isValid: boolean;
      errors: string[];
      formValues: Record<string, unknown>;
      submittedAt: number;
    };
  };
}

function ResultRow({ entry }: ResultRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { response } = entry;

  return (
    <>
      <tr
        className="border-b border-border hover:bg-accent/30 cursor-pointer"
        onClick={() => response && setExpanded(!expanded)}
      >
        <td className="px-4 py-2">{entry.stepName}</td>
        <td className="px-4 py-2">
          {entry.task.name}
          <span className="ml-1 text-muted-foreground font-mono">
            ({entry.task.type})
          </span>
        </td>
        <td className="px-4 py-2">
          {response ? (
            <span className="flex items-center gap-1">
              {response.isValid ? (
                <CheckCircle2 size={12} className="text-green-500" />
              ) : (
                <XCircle size={12} className="text-red-500" />
              )}
              {response.isValid ? 'Submitted' : 'Has errors'}
            </span>
          ) : (
            <span className="text-muted-foreground">Skipped</span>
          )}
        </td>
        <td className="px-4 py-2">
          {response && (
            <button className="text-muted-foreground hover:text-foreground">
              {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            </button>
          )}
        </td>
      </tr>
      {expanded && response && (
        <tr>
          <td colSpan={4} className="px-4 py-2 bg-muted/30">
            {response.errors.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-medium text-red-500 mb-1">Errors:</p>
                <ul className="list-disc pl-4 text-xs text-red-500">
                  {response.errors.map((e, i) => (
                    <li key={i}>{e}</li>
                  ))}
                </ul>
              </div>
            )}
            <pre className="text-[10px] bg-background border border-border rounded p-2 overflow-x-auto max-h-48">
              {JSON.stringify(response.formValues, null, 2)}
            </pre>
          </td>
        </tr>
      )}
    </>
  );
}
