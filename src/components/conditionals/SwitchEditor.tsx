import { useFormBuilderStore } from '@/stores/formBuilderStore';
import type { ConditionalOperatorConfig, ConditionConfig, ActionConfig, ExpressionConfig } from '@/types/schema';
import { v4 as uuidv4 } from 'uuid';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

function ConditionRow({ condition, onChange, onRemove }: {
  condition: ConditionConfig;
  onChange: (c: ConditionConfig) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <input
        className="flex-1 bg-transparent border border-border rounded px-1.5 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
        value={condition.leftValue}
        onChange={(e) => onChange({ ...condition, leftValue: e.target.value })}
        placeholder="$this.FieldName"
      />
      <select
        className="bg-transparent border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
        value={condition.operator}
        onChange={(e) => onChange({ ...condition, operator: e.target.value as ConditionConfig['operator'] })}
      >
        <option value="eq">==</option>
        <option value="ne">!=</option>
        <option value="gt">&gt;</option>
        <option value="lt">&lt;</option>
      </select>
      <input
        className="flex-1 bg-transparent border border-border rounded px-1.5 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
        value={condition.rightValue}
        onChange={(e) => onChange({ ...condition, rightValue: e.target.value })}
        placeholder="value"
      />
      <button className="p-0.5 text-destructive" onClick={onRemove}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function ActionRow({ action, onChange, onRemove }: {
  action: ActionConfig;
  onChange: (a: ActionConfig) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-1 text-xs">
      <select
        className="bg-transparent border border-border rounded px-1 py-0.5 focus:outline-none focus:ring-1 focus:ring-ring"
        value={action.type}
        onChange={(e) => {
          const type = e.target.value as ActionConfig['type'];
          if (type === 'show' || type === 'exclude' || type === 'setRequired') {
            onChange({ type, fields: 'fields' in action ? action.fields : [] });
          } else if (type === 'setValue') {
            onChange({ type, values: [] });
          } else if (type === 'setObservableValue') {
            onChange({ type, widgetReferences: [] });
          } else {
            onChange({ type: type as 'setEnum', options: [] });
          }
        }}
      >
        <option value="show">Show</option>
        <option value="exclude">Exclude</option>
        <option value="setRequired">Set Required</option>
        <option value="setValue">Set Value</option>
        <option value="setObservableValue">Set Observable</option>
        <option value="setEnum">Set Enum</option>
        <option value="setChoices">Set Choices</option>
      </select>
      {'fields' in action && (
        <input
          className="flex-1 bg-transparent border border-border rounded px-1.5 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          value={action.fields.join(', ')}
          onChange={(e) => onChange({ ...action, fields: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
          placeholder="Field1, Field2"
        />
      )}
      {'values' in action && (
        <input
          className="flex-1 bg-transparent border border-border rounded px-1.5 py-0.5 font-mono focus:outline-none focus:ring-1 focus:ring-ring"
          value={action.values.map(v => `${v.widgetAccess}=${v.value}`).join(', ')}
          onChange={(e) => {
            const values = e.target.value.split(',').map(s => s.trim()).filter(Boolean).map(s => {
              const [widgetAccess, ...rest] = s.split('=');
              return { widgetAccess: widgetAccess.trim(), value: rest.join('=').trim() };
            });
            onChange({ ...action, values });
          }}
          placeholder="Field=value, Field2=value2"
        />
      )}
      <button className="p-0.5 text-destructive" onClick={onRemove}>
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function OperatorEditor({ op, onChange, onRemove, depth = 0 }: {
  op: ConditionalOperatorConfig;
  onChange: (o: ConditionalOperatorConfig) => void;
  onRemove: () => void;
  depth?: number;
}) {
  const [expanded, setExpanded] = useState(true);

  const updateConditions = (conditions: ConditionConfig[]) => {
    onChange({ ...op, expression: { ...op.expression, conditions } });
  };

  const updateActions = (actions: ActionConfig[]) => {
    onChange({ ...op, thenActions: actions });
  };

  return (
    <div className={`border border-border rounded p-2 space-y-2 ${depth > 0 ? 'ml-4' : ''}`}>
      <div className="flex items-center gap-2">
        <button onClick={() => setExpanded(!expanded)} className="p-0.5">
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span className="text-xs font-medium">IF</span>
        <select
          className="bg-transparent border border-border rounded px-1 py-0.5 text-xs focus:outline-none focus:ring-1 focus:ring-ring"
          value={op.expression.type}
          onChange={(e) => onChange({ ...op, expression: { ...op.expression, type: e.target.value as ExpressionConfig['type'] } })}
        >
          <option value="allOf">ALL of (AND)</option>
          <option value="anyOf">ANY of (OR)</option>
        </select>
        <div className="flex-1" />
        <label className="flex items-center gap-1 text-xs">
          <input
            type="checkbox"
            checked={op.containsBreak}
            onChange={(e) => onChange({ ...op, containsBreak: e.target.checked })}
          />
          break
        </label>
        <button className="p-0.5 text-destructive" onClick={onRemove}>
          <Trash2 size={14} />
        </button>
      </div>

      {expanded && (
        <>
          <div className="space-y-1 ml-4">
            {op.expression.conditions.map((cond, i) => (
              <ConditionRow
                key={cond.id}
                condition={cond}
                onChange={(c) => {
                  const conditions = [...op.expression.conditions];
                  conditions[i] = c;
                  updateConditions(conditions);
                }}
                onRemove={() => updateConditions(op.expression.conditions.filter((_, j) => j !== i))}
              />
            ))}
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => updateConditions([...op.expression.conditions, { id: uuidv4(), operator: 'eq', leftValue: '', rightValue: '' }])}
            >
              <Plus size={12} /> Add condition
            </button>
          </div>

          <div className="ml-4">
            <span className="text-xs font-medium">THEN</span>
            <div className="space-y-1 mt-1">
              {op.thenActions.map((action, i) => (
                <ActionRow
                  key={i}
                  action={action}
                  onChange={(a) => {
                    const actions = [...op.thenActions];
                    actions[i] = a;
                    updateActions(actions);
                  }}
                  onRemove={() => updateActions(op.thenActions.filter((_, j) => j !== i))}
                />
              ))}
              <button
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => updateActions([...op.thenActions, { type: 'show', fields: [] }])}
              >
                <Plus size={12} /> Add action
              </button>
            </div>
          </div>

          {op.elseOperator && (
            <div className="ml-4">
              <span className="text-xs font-medium">ELSE IF</span>
              <OperatorEditor
                op={op.elseOperator}
                onChange={(nested) => onChange({ ...op, elseOperator: nested })}
                onRemove={() => onChange({ ...op, elseOperator: null })}
                depth={depth + 1}
              />
            </div>
          )}

          {!op.elseOperator && (
            <button
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground ml-4"
              onClick={() => onChange({
                ...op,
                elseOperator: {
                  id: uuidv4(),
                  expression: { type: 'anyOf', conditions: [] },
                  thenActions: [],
                  elseOperator: null,
                  elseActions: null,
                  containsBreak: false,
                },
              })}
            >
              <Plus size={12} /> Add else-if
            </button>
          )}
        </>
      )}
    </div>
  );
}

export function SwitchEditor() {
  const { switchOperators, setSwitchOperators } = useFormBuilderStore();

  const addOperator = () => {
    setSwitchOperators([
      ...switchOperators,
      {
        id: uuidv4(),
        expression: { type: 'anyOf', conditions: [] },
        thenActions: [],
        elseOperator: null,
        elseActions: null,
        containsBreak: true,
      },
    ]);
  };

  return (
    <div className="p-3 space-y-3 overflow-y-auto h-full">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Conditional Logic (Switch)
        </h3>
        <button
          className="flex items-center gap-1 text-xs px-2 py-1 rounded hover:bg-accent"
          onClick={addOperator}
        >
          <Plus size={12} /> Add Rule
        </button>
      </div>

      {switchOperators.length === 0 ? (
        <p className="text-xs text-muted-foreground text-center py-4">
          No conditional rules. Add a rule to control field visibility and values.
        </p>
      ) : (
        switchOperators.map((op, i) => (
          <OperatorEditor
            key={op.id}
            op={op}
            onChange={(updated) => {
              const ops = [...switchOperators];
              ops[i] = updated;
              setSwitchOperators(ops);
            }}
            onRemove={() => setSwitchOperators(switchOperators.filter((_, j) => j !== i))}
          />
        ))
      )}
    </div>
  );
}
