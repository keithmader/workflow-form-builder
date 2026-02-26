import { useState, useCallback } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Pin, PinOff } from 'lucide-react';
import { Toolbar } from './Toolbar';
import { ResizeHandle } from './ResizeHandle';
import { FieldPalette } from '@/components/sidebar/FieldPalette';
import { FormCanvas } from '@/components/canvas/FormCanvas';
import { PropertyPanel } from '@/components/properties/PropertyPanel';
import { JsonEditor } from '@/components/json/JsonEditor';
import { SwitchEditor } from '@/components/conditionals/SwitchEditor';
// import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ProjectExplorer } from '@/components/explorer/ProjectExplorer';

type RightPanel = 'properties' | 'conditionals';

const LEFT_MIN = 180;
const LEFT_MAX = 480;
const JSON_MIN = 240;
const JSON_MAX = 720;

export function AppShell() {
  const [showJson, setShowJson] = useState(false);
  const [jsonPinned, setJsonPinned] = useState(false);
  const [showProps, setShowProps] = useState(true);
  const [propsPinned, setPropsPinned] = useState(true);
  // const [showPreview, setShowPreview] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>('properties');
  const [leftWidth, setLeftWidth] = useState(256);
  const [jsonWidth, setJsonWidth] = useState(384);

  const handleLeftResize = useCallback((delta: number) => {
    setLeftWidth(w => Math.min(LEFT_MAX, Math.max(LEFT_MIN, w + delta)));
  }, []);

  const handleJsonResize = useCallback((delta: number) => {
    setJsonWidth(w => Math.min(JSON_MAX, Math.max(JSON_MIN, w + delta)));
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toolbar
        // onTogglePreview={() => setShowPreview(!showPreview)}
        onToggleJson={() => { setShowJson(s => !s); if (!showJson) setJsonPinned(false); }}
        onToggleProps={() => { setShowProps(s => !s); if (!showProps) setPropsPinned(false); }}
        // showPreview={showPreview}
        showJson={showJson}
        showProps={showProps}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Explorer + Field Palette (tabbed) */}
        <Tabs.Root
          defaultValue="explorer"
          className="border-r border-border flex-shrink-0 flex flex-col overflow-hidden"
          style={{ width: leftWidth }}
        >
          <Tabs.List className="flex border-b border-border flex-shrink-0">
            <Tabs.Trigger
              value="explorer"
              className="flex-1 px-3 py-1.5 text-xs font-medium transition-colors data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground"
            >
              Explorer
            </Tabs.Trigger>
            <Tabs.Trigger
              value="fields"
              className="flex-1 px-3 py-1.5 text-xs font-medium transition-colors data-[state=active]:bg-accent data-[state=active]:text-foreground text-muted-foreground hover:text-foreground"
            >
              Fields
            </Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="explorer" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
            <ProjectExplorer />
          </Tabs.Content>
          <Tabs.Content value="fields" className="flex-1 overflow-hidden data-[state=inactive]:hidden">
            <FieldPalette />
          </Tabs.Content>
        </Tabs.Root>

        {/* Resize handle: left panel */}
        <ResizeHandle side="left" onResize={handleLeftResize} />

        {/* Center: Form Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <FormCanvas />
        </div>

        {/* Right: Properties / Conditionals */}
        {showProps && (
          <div className="w-72 border-l border-border flex-shrink-0 flex flex-col overflow-hidden">
            <div className="flex border-b border-border">
              <button
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  rightPanel === 'properties' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setRightPanel('properties')}
              >
                Properties
              </button>
              <button
                className={`flex-1 px-3 py-1.5 text-xs font-medium transition-colors ${
                  rightPanel === 'conditionals' ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setRightPanel('conditionals')}
              >
                Conditionals
              </button>
              <button
                className="px-2 py-1.5 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => {
                  if (propsPinned) {
                    setPropsPinned(false);
                    setShowProps(false);
                  } else {
                    setPropsPinned(true);
                  }
                }}
                title={propsPinned ? 'Unpin panel (hide)' : 'Pin panel'}
              >
                {propsPinned ? <Pin size={12} /> : <PinOff size={12} />}
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {rightPanel === 'properties' ? <PropertyPanel /> : <SwitchEditor />}
            </div>
          </div>
        )}

        {/* JSON Editor (toggleable) with resize handle */}
        {showJson && (
          <>
            <ResizeHandle side="right" onResize={handleJsonResize} />
            <div
              className="border-l border-border flex-shrink-0 overflow-hidden"
              style={{ width: jsonWidth }}
            >
              <JsonEditor
                pinned={jsonPinned}
                onTogglePin={() => {
                  if (jsonPinned) {
                    setJsonPinned(false);
                    setShowJson(false);
                  } else {
                    setJsonPinned(true);
                  }
                }}
              />
            </div>
          </>
        )}

        {/* Preview (toggleable) — commented out
        {showPreview && (
          <div className="w-96 border-l border-border flex-shrink-0 overflow-hidden">
            <PreviewPanel />
          </div>
        )}
        */}
      </div>
    </div>
  );
}
