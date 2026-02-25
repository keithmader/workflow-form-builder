import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import { Toolbar } from './Toolbar';
import { FieldPalette } from '@/components/sidebar/FieldPalette';
import { FormCanvas } from '@/components/canvas/FormCanvas';
import { PropertyPanel } from '@/components/properties/PropertyPanel';
import { JsonEditor } from '@/components/json/JsonEditor';
import { SwitchEditor } from '@/components/conditionals/SwitchEditor';
import { PreviewPanel } from '@/components/preview/PreviewPanel';
import { ProjectExplorer } from '@/components/explorer/ProjectExplorer';

type RightPanel = 'properties' | 'conditionals';

export function AppShell() {
  const [showJson, setShowJson] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [rightPanel, setRightPanel] = useState<RightPanel>('properties');

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      <Toolbar
        onTogglePreview={() => setShowPreview(!showPreview)}
        onToggleJson={() => setShowJson(!showJson)}
        showPreview={showPreview}
        showJson={showJson}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Explorer + Field Palette (tabbed) */}
        <Tabs.Root defaultValue="explorer" className="w-64 border-r border-border flex-shrink-0 flex flex-col overflow-hidden">
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

        {/* Center: Form Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <FormCanvas />
        </div>

        {/* Right: Properties / Conditionals */}
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
          </div>
          <div className="flex-1 overflow-hidden">
            {rightPanel === 'properties' ? <PropertyPanel /> : <SwitchEditor />}
          </div>
        </div>

        {/* JSON Editor (toggleable) */}
        {showJson && (
          <div className="w-96 border-l border-border flex-shrink-0 overflow-hidden">
            <JsonEditor />
          </div>
        )}

        {/* Preview (toggleable) */}
        {showPreview && (
          <div className="w-96 border-l border-border flex-shrink-0 overflow-hidden">
            <PreviewPanel />
          </div>
        )}
      </div>
    </div>
  );
}
