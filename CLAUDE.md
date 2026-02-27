# Workflow Form Builder

## What This Is

A browser-based form builder and tester for the **WorkflowEngine** Android app. WorkflowEngine organizes trucking/logistics work as **Jobs → Steps → Tasks**, where each Task has a `type` that maps to a JSON schema form definition. This tool lets you visually build those form definitions and test them against real job data — all locally, no backend.

## WorkflowEngine Context

For requests about workflows, jobs, tasks, form schemas, conditional operators, reference resolution, or the Job Tester feature, consult `docs/WorkflowEngine-reference.md` and the Kotlin source in `WorkflowEngine/`. The reference doc covers the full data model, all 27+ widget types, switch/toggle operators, reference syntax (`$job.*`, `$step.*`, `$task.*`, `$step_location.*`, `$this.*`), schema keywords, and the submission flow. The Job Tester simulates this engine's form rendering pipeline in the browser.

## Tech Stack

React 19 + TypeScript, Vite, Zustand (state), Radix UI (primitives), TailwindCSS 4, Lucide icons, Monaco editor, dnd-kit (drag-and-drop), uuid.

## The Two Main Features

### 1. Form Builder (the original feature)
- **Explorer** sidebar: recursive folder/form tree with drag-and-drop reordering
- **Canvas**: visual field list for the active form (formName, description, fields)
- **Properties panel**: edit selected field config (type-specific editors)
- **Conditionals panel**: switch operator editor
- **JSON panel**: Monaco editor showing rawSchema with Apply/Discard

### 2. Job Tester (new feature, uncommitted)
- **Purpose**: Load a real job JSON, step through each task's form, fill in values, submit, review responses
- **Sidebar tab**: "Tester" (PlayCircle icon) — third tab alongside Explorer and Fields
- **Form sources**: Uses project's savedForms (matched by formName) as primary; optional schemas.json file as fallback
- **Phases**: setup → stepping → results
- **No persistence**: tester state is in-memory only

## Architecture

### Three Zustand Stores (independent by design)

| Store | File | Purpose |
|-------|------|---------|
| `formBuilderStore` | `src/stores/formBuilderStore.ts` | Active form editing: fields, undo/redo, rawSchema, formLoadCounter |
| `projectStore` | `src/stores/projectStore.ts` | Explorer tree + savedForms, localStorage persistence |
| `jobTesterStore` | `src/stores/jobTesterStore.ts` | Job tester workflow, in-memory only |

- `formBuilderStore` ↔ `projectStore` communicate via `loadForm(savedForm)` / `getFormSnapshot()`
- `jobTesterStore` reads from `projectStore.savedForms` (via React hook in components) but doesn't write to it

### Type System

| File | Contents |
|------|----------|
| `src/types/schema.ts` | 27 FieldType variants, FieldConfig union, ConditionalOperatorConfig, ActionConfig, EnumOptionsConfig |
| `src/types/project.ts` | ExplorerNode (recursive folder/form), SavedForm, DragItem/DropTarget |
| `src/types/jobTester.ts` | ParsedJob/Step/Task, TaskResponse, FlatTaskEntry, ReferenceContext, ConditionalState |

### Key Utilities

| File | Purpose |
|------|---------|
| `src/utils/schemaParser.ts` | Pure TS JSON→FieldConfig parser. Handles all 27 types, 3 wrapper formats, switch/toggle operators. `parseFormDefinition` is exported for direct use. |
| `src/utils/widgetConfigMapper.ts` | FieldConfig↔builderLib conversions (used by buildSchema direction) |
| `src/utils/conditionalEngine.ts` | Evaluates switch/toggle operators → ConditionalState (hidden/shown/required fields, value/enum overrides) |
| `src/utils/referenceResolver.ts` | Resolves `$job.*`, `$step.*`, `$task.*`, `$step_location.*`, `$this.*` dot-path references |
| `src/utils/formValidator.ts` | Validates form values against FieldConfig + ConditionalState (required, minLength, pattern, etc.) |
| `src/lib/builderBridge.ts` | parseSchema (uses schemaParser as primary, stub builder.js as fallback), buildSchema |

### Component Map

```
src/components/
├── layout/
│   ├── AppShell.tsx          # Root layout: 3-tab sidebar + center + right panels
│   ├── Toolbar.tsx           # Save, New, Import/Export, panel toggles
│   └── ResizeHandle.tsx      # Draggable panel resize
├── explorer/                 # Project tree (folders + forms, recursive)
├── sidebar/                  # Field palette (drag to add)
├── canvas/                   # Form field list + form name/description
├── properties/               # Field property editors (type-specific)
├── conditionals/             # Switch operator editor
├── json/                     # Monaco JSON editor with Apply/Discard
├── shared/                   # EnumOptionsEditor, ReferenceValueInput
├── preview/                  # PreviewPanel (commented out, preserved)
└── job-tester/
    ├── JobTesterSetup.tsx    # File upload, project form summary, coverage check
    ├── JobTesterCanvas.tsx   # Form renderer + navigation during stepping
    ├── JobTesterProgress.tsx # Step/task accordion sidebar during stepping
    ├── JobTesterResults.tsx  # Results table + export after testing
    └── renderer/
        ├── FormRenderer.tsx  # Top-level: conditional eval + visibility filtering
        ├── FieldRenderer.tsx # Dispatches FieldConfig → field component
        └── fields/           # 10 field components (Text, Numeric, Boolean, Radio,
                              #   Dropdown, DateTime, ObjectGroup, ArrayRepeater,
                              #   ReadOnlyDisplay, StubField)
```

## WorkflowEngine Data Model

```
Job (job.json)
  ├─ locations[], commodities[], external_data[]  (reference data)
  └─ steps[] (sorted by order)
       ├─ name, type ("Pickup"/"Delivery"), location_external_id
       └─ tasks[] (sorted by order)
            ├─ name, type (e.g. "arrived", "dropEmpty") → maps to formDefinitions key
            ├─ fields{} (previously submitted responses)
            └─ external_data{}

Schemas (schemas.json) — optional external file
  └─ data.form_schema.formDefinitions
       ├─ "arrived": { type: "object", properties: {...}, switch: [...] }
       └─ ... (48 form definitions in sample)
```

Task `type` values (e.g. "arrived", "dropEmpty") map to form definition keys. In the tester, these are resolved by matching against project `SavedForm.formName` (case-insensitive), falling back to loaded schemas.json.

## Critical Design Decisions

1. **rawSchema is source of truth for JSON** — stored in SavedForm, displayed directly in Monaco editor (avoids lossy builder library round-trip)
2. **formLoadCounter** — incremented on every loadForm() call; JSON editor watches this to detect form switches (not formName which can collide)
3. **Schema parser is primary** — pure TS parser handles all 27 types; external builder.js at `/public/lib/builder.js` is fallback only (still used for buildSchema direction)
4. **Job Tester uses project forms first** — `resolveForm(taskType, savedForms)` checks project by formName, then falls back to optional schemas JSON file
5. **No persistence for tester** — all tester state is in-memory only
6. **Single-click form selection** — clicking a form in explorer loads it immediately
7. **Preview panel commented out** — code preserved in PreviewPanel.tsx for re-enablement

## localStorage Keys

- `workflow-form-builder-projects` — explorer tree (nodes + rootIds)
- `workflow-form-builder-saved-forms` — form definitions (fields, switchOperators, rawSchema)

## Sample Data for Testing

Untracked files in `WorkflowEngine/app/src/main/assets/json/`:
- `job.json` — 2 steps (Pickup + Delivery), 4 tasks (arrived, pickupEmpty, dropEmpty, dropRelay)
- `schemas.json` — 48 form definitions
- Various single-form JSONs (boolean.json, date_time.json, etc.)

## Git Status

- Branch: `master`
- Remote: `https://github.com/keithmader/workflow-form-builder.git`
- Last committed: `91dac98` — Recursive explorer rewrite
- **Uncommitted**: Job Tester feature (all files in `src/components/job-tester/`, `src/stores/jobTesterStore.ts`, `src/types/jobTester.ts`, `src/utils/{conditionalEngine,referenceResolver,formValidator}.ts`, edits to `schemaParser.ts` and `AppShell.tsx`)

## User Preferences

- "Save changes and continue" / "Cancel" wording on unsaved dialog (no Discard option)
- Form Name input is on the canvas, NOT in the toolbar
- Schemas JSON should be optional — project forms are primary
- Build must compile cleanly: `npm run build`
