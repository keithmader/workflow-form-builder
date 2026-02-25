import { useEffect, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { initBuilder } from '@/lib/builderBridge';
import { useProjectStore } from '@/stores/projectStore';

function App() {
  const [builderReady, setBuilderReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Load project data from localStorage
    useProjectStore.getState().loadFromStorage();

    const tryInit = () => {
      if (initBuilder()) {
        setBuilderReady(true);
        return true;
      }
      return false;
    };

    if (tryInit()) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (tryInit() || attempts > 20) {
        clearInterval(interval);
        if (!tryInit()) {
          setError('Builder library not loaded. Make sure builder.js is available at /lib/builder.js');
        }
      }
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <div className="text-center space-y-4 max-w-md p-8">
          <h1 className="text-xl font-semibold">WorkflowEngine Form Builder</h1>
          <p className="text-sm text-muted-foreground">{error}</p>
          <div className="text-xs text-muted-foreground bg-muted p-3 rounded text-left space-y-1">
            <p>To build the library:</p>
            <code className="block bg-card p-2 rounded mt-1">
              cd WorkflowEngine && ./gradlew :builder:jsBrowserProductionWebpack -Pplatform=js
            </code>
            <p className="mt-2">Then copy the output:</p>
            <code className="block bg-card p-2 rounded mt-1">
              cp builder/build/distributions/js/builder.js ../workflow-form-builder/public/lib/
            </code>
          </div>
          <button
            className="px-4 py-2 bg-primary text-primary-foreground rounded text-sm hover:bg-primary/90"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!builderReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
        <p className="text-muted-foreground">Loading builder library...</p>
      </div>
    );
  }

  return <AppShell />;
}

export default App;
