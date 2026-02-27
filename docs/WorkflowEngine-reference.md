# WorkflowEngine Reference

Comprehensive reference for the WorkflowEngine Android library (`WorkflowEngine/` directory). This library powers the trucking/logistics form system that the Workflow Form Builder simulates.

**Source location:** `WorkflowEngine/core/src/commonMain/kotlin/com/pltsci/jsonschemalib/` (core/shared) and `WorkflowEngine/android/src/main/java/com/pltsci/jsonschemalib/android/` (Android UI layer).

---

## Data Model

### Job → Steps → Tasks Hierarchy

```
Job
├─ locations[]              Location objects with external_id, name, address fields
├─ commodities[]            Commodity data referenced by commodity widgets
├─ external_data[]          Array of {label, value, key} objects for $job.external_data[] references
├─ shipment_details{}       Nested object with shipping_documents[] etc.
└─ steps[] (sorted by order)
     ├─ name                Display name (e.g. "Pickup at Warehouse")
     ├─ type                "Pickup" or "Delivery"
     ├─ order               Numeric sort key
     ├─ location_external_id  Links to locations[] entry → provides $step_location.*
     ├─ appointment{}       { start_time, end_time } → accessed via $step.appointment.start_time
     ├─ external_data[]     Step-level external data
     └─ tasks[] (sorted by order)
          ├─ name           Display name (e.g. "Record Arrival")
          ├─ type           Key into formDefinitions (e.g. "arrived", "dropEmpty")
          ├─ order          Numeric sort key
          ├─ fields{}       Previously submitted responses (savedWidgetData)
          └─ external_data{}  Task-level external data
```

### TaskContentData (core model)

```kotlin
data class TaskContentData(
    val taskExternalId: String? = null,
    val type: String,                            // task type → formDefinitions key
    val savedWidgetData: Map<String, Any>,        // previously submitted field values
    val isEnabled: Boolean,                      // false = completed/read-only
    val timeZone: TimeZone,
    val showLateReasonsForArrival: Boolean = true,
    val isIncompleteState: Boolean = false,
    val isReadOnlyWidgetAllowed: Boolean = true,
    val isTimeZoneValidationEnabled: Boolean = true,
)
```

`savedWidgetData` holds prior responses: `{"fieldName": "value", "objectField": {"subField": "val"}, "arrayField": [{"subField": "val"}]}`. Planned values use prefix `"Planned"` (e.g. `"PlannedArrivalTime"`), actual values use `"Actual"`.

### SchemaConfiguration (Android entry point)

```kotlin
data class SchemaConfiguration(
    val taskContentData: TaskContentData,
    val formDefinitions: JsonObject,        // ALL form schemas keyed by task type
    val referenceData: Map<String, String>, // "$job" → raw JSON, "$step" → raw JSON, etc.
)
```

---

## Form Schema Format

A form definition is a JSON object keyed by task type inside `formDefinitions`:

```json
{
  "arrived": {
    "type": "object",
    "properties": {
      "arrival_time": {
        "type": "string",
        "format": "date_time",
        "title": "Arrival Time",
        "order": 1
      },
      "notes": {
        "type": "string",
        "title": "Notes",
        "hint": "Enter any notes",
        "order": 2
      }
    },
    "required": ["arrival_time"],
    "hidden": ["some_hidden_field"],
    "uneditable": ["some_readonly_field"],
    "switch": [ ... ]
  }
}
```

### Top-Level Schema Keys

| Key | Type | Description |
|-----|------|-------------|
| `type` | string | Always `"object"` for a form definition |
| `properties` | object | Map of field name → field schema |
| `required` | string[] | Field names that must have values |
| `hidden` | string[] | Field names hidden from the start (regardless of switch) |
| `uneditable` | string[] | Field names rendered as read-only |
| `switch` | array | Conditional operators (see Switch Operators section) |
| `items` | object | For array-type definitions, contains the actual `properties` |

### Three Wrapper Formats

The parser handles three ways a form definition can be structured:

1. **Direct object**: `{ "type": "object", "properties": {...} }`
2. **Array wrapper**: `{ "type": "array", "items": { "type": "object", "properties": {...} } }`
3. **Nested in data envelope**: `{ "data": { "form_schema": { "formDefinitions": {...} } } }` (schemas.json format)

---

## Field/Widget Types

Field type is determined by the `type` string in the property schema, combined with `format`, `enum`, `choices`, and `field_type` modifiers. There is no single enum — the type is dispatched in `PsSchemaReader.getWidget()`.

### Complete Type Dispatch Table

| Schema `type` | Modifiers | Widget | Description |
|---------------|-----------|--------|-------------|
| `"string"` | (none) | EditableTextWidget | Free-text input |
| `"string"` | `format: "date_time"` | DateTimeWidget | Date + time picker |
| `"string"` | `format: "date"` or `"date_calendar"` | DateTimeWidget | Date-only picker |
| `"string"` | `format: "time"` or `"hours_minutes"` | TimeWidget / HosClockWidget | Time picker |
| `"string"` | `format: "document_capture"` | DocumentCaptureWidget | Document scanner |
| `"string"` | `format: "separator"` | TextWidget | Visual separator |
| `"string"` | `enum` + `field_type: "radio"` | RadioButtonWidget | Radio group |
| `"string"` | `enum` + `field_type: "dropdown"` | DropdownWidget | Dropdown select |
| `"string"` | `enum` (2 items, no field_type) | RadioButtonWidget | Auto radio for 2 options |
| `"string"` | `enum` (1 item, no field_type) | TextWidget | Pre-filled text |
| `"string"` | `enum` (3+ items, no field_type) | DropdownWidget | Auto dropdown for 3+ options |
| `"string"` | `choices` | DropdownWidget | Paired label/value dropdown |
| `"boolean"` | not required | CheckBoxWidget | Checkbox |
| `"boolean"` | required | RadioButtonWidget | Yes/No radio (required booleans) |
| `"integer"` | — | NumericWidget | Integer input |
| `"number"` | — | NumericWidget | Decimal input |
| `"object"` | — | ObjectWidget | Group of sub-fields (recurses into `properties`) |
| `"array"` | — | ArrayWidget | Repeating group (recurses into `items`) |
| `"instruction"` | — | InstructionWidget | Read-only instruction text |
| `"evaluation"` | — | EvaluationWidget | Hidden computed value from reference |
| `"calculation"` | — | CalculationWidget | Computed value with formula |
| `"metadata"` | — | MetadataWidget | Hidden metadata field |
| `"deeplink_button"` | — | DeepLinkWidget | Button linking to external app |
| `"photo_capture"` | — | PhotoCaptureWidget | Camera/photo input |
| `"commodity"` | — | CommodityWidget | Commodity selector |
| `"signature"` | — | SignatureWidget | Signature capture |
| `"barcode"` | — | BarcodeWidget | Barcode scanner |
| `"concat"` | — | TextBuilderWidget | Concatenated text builder |

### WidgetType Enum (structural roles)

```kotlin
enum class WidgetType {
    SIMPLE_WIDGET,
    SUB_WIDGET_VERTICAL,
    SUB_WIDGET_HORIZONTAL,
    SUB_ARRAY_WIDGET,
    ARRAY_WIDGET,
    OBJECT_WIDGET
}
```

Object widgets use `layout: "vertical"` (default) or `layout: "horizontal"` to determine sub-widget arrangement.

---

## Schema Property Keywords

Full keyword reference from `Keywords.kt`:

### Core Structure

| Keyword | Type | Description |
|---------|------|-------------|
| `type` | string | Field type (see dispatch table above) |
| `title` | string | Display label |
| `description` | string | Help text |
| `hint` | string | Placeholder text |
| `order` | number | Sort position within parent |
| `properties` | object | Child fields (for object type) |
| `items` | object | Item schema (for array type) |
| `ref` | string | Embed another form definition by name |
| `parent_property` | string | Parent property reference |

### Constraints

| Keyword | Type | Description |
|---------|------|-------------|
| `required` | string[] | (top-level) Required field names |
| `hidden` | string[] | (top-level) Initially hidden field names |
| `uneditable` | string[] | (top-level) Read-only field names |
| `default` | any | Default value (can be a reference like `$job.departure_time`) |
| `enum` | string[] | Allowed values list |
| `choices` | array | Paired label/value options for dropdowns |
| `pattern` | string | Regex validation pattern |
| `pattern_error_message` | string | Custom error for pattern failure |
| `minLength` | number | Minimum string length |
| `maxLength` | number | Maximum string length |
| `minimum` | number | Minimum numeric value |
| `maximum` | number | Maximum numeric value |
| `exclusiveMinimum` | number | Exclusive minimum |
| `exclusiveMaximum` | number | Exclusive maximum |
| `error` | string | Custom error message |

### Display & Behavior

| Keyword | Type | Description |
|---------|------|-------------|
| `format` | string | Sub-type modifier (see formats below) |
| `field_type` | string | `"radio"` or `"dropdown"` — overrides auto-selection for enum fields |
| `layout` | string | `"vertical"`, `"horizontal"`, or `"fixed"` for object groups |
| `style` | object | Visual styling |
| `background_color` | string | Background color |
| `text_color` | string | Text color |
| `modifiers` | array | Input modifiers |
| `embedded` | boolean | Embedded form flag |
| `value` | any | Static or reference value |
| `setParam` | string | Parameter setting |
| `setTitle` | string | Dynamic title |
| `timezone` | string | Timezone override |

### Format Values

| Format | Description |
|--------|-------------|
| `date_time` | Full date + time picker |
| `date` | Date picker |
| `date_calendar` | Calendar-style date picker |
| `time` | Time picker |
| `hours_minutes` | Hours:minutes input |
| `separator` | Visual separator (no input) |
| `document_capture` | Document scanning |

### Barcode-Specific

| Keyword | Description |
|---------|-------------|
| `allowDuplicates` | Allow duplicate barcode scans |
| `minCharacters` | Minimum characters per barcode |
| `maxCharacters` | Maximum characters per barcode |
| `minBarcodes` | Minimum number of barcodes |
| `maxBarcodes` | Maximum number of barcodes |
| `checksum_function` | Checksum validation function |

### Special Keywords

| Keyword | Description |
|---------|-------------|
| `switch` | Conditional operators array (see below) |
| `toggles` | Per-field toggle map (see below) |
| `calculate` | Calculation formula |
| `decimalPlaces` | Decimal precision for calculations |
| `Planned` | Planned value key in savedWidgetData |
| `Actual` | Actual value key in savedWidgetData |
| `temp` | Incomplete form temporary value |

---

## Switch Operators (Conditional System)

The `switch` array at the form schema level defines conditional logic that shows/hides fields, sets values, and modifies options based on field values or reference data.

### Switch Statement Structure

```json
{
  "switch": [
    {
      "if": { ... },
      "then": { ... },
      "else": { ... },
      "continue": true
    }
  ]
}
```

| Key | Required | Description |
|-----|----------|-------------|
| `if` | yes | Condition expression (see below) |
| `then` | yes | Actions when condition is true |
| `else` | no | Actions when condition is false, OR a nested `{"if":...,"then":...}` |
| `continue` | no | `true` (default) = evaluate next statement; `false` = stop (break) |

### Condition Expressions

#### Simple Condition (single comparison)

```json
{ "if": { "$this.fieldName": { "eq": "someValue" } } }
```

#### allOf (AND — all conditions must be true)

```json
{
  "if": {
    "allOf": [
      { "$this.fieldA": { "eq": "yes" } },
      { "$step.type": { "ne": "Pickup" } }
    ]
  }
}
```

#### anyOf (OR — at least one condition must be true)

```json
{
  "if": {
    "anyOf": [
      { "$this.fieldA": { "eq": "yes" } },
      { "$this.fieldB": { "eq": "yes" } }
    ]
  }
}
```

### Comparison Operators

| Operator | Keyword | Description |
|----------|---------|-------------|
| Equal | `eq` | Left value equals right value |
| Not Equal | `ne` | Left value does not equal right value |
| Greater Than | `gt` | Left value greater than right value |
| Less Than | `lt` | Left value less than right value |

The special value `"current"` in time comparisons means "current time".

### Arithmetic Operators (in calculated expressions)

| Operator | Symbol |
|----------|--------|
| Plus | `+` |
| Minus | `-` |
| Multiply | `*` |
| Divide | `/` |

### Then/Else Actions

Actions are objects where each key is an action type and the value specifies targets:

#### show — Make fields visible

```json
{ "then": { "show": ["fieldA", "fieldB"] } }
```

When the `if` condition becomes FALSE (in an if-only statement without else), shown fields are **hidden and their values are cleared**.

#### exclude — Hide fields and clear values

```json
{ "then": { "exclude": ["fieldA", "fieldB"] } }
```

When the `if` condition becomes FALSE (in an if-only statement), excluded fields are **shown** (reversal).

#### setRequired — Mark fields as required

```json
{ "then": { "setRequired": ["fieldA"] } }
```

When FALSE, the required state is **removed** (reversal).

#### setValue — Set field values

```json
{ "then": { "setValue": [{ "fieldName": "someValue" }] } }
```

Value can be a literal or a reference (`"$job.departure_time"`). When FALSE and the field is empty, the default value is restored.

#### setObservableValue — Subscribe to another field's value

```json
{ "then": { "setObservableValue": [{ "targetField": "$this.sourceField" }] } }
```

#### setEnum — Replace enum options

```json
{ "then": { "setEnum": [{ "fieldName": ["optionA", "optionB"] }] } }
```

#### setChoices — Replace choices (paired label/value options)

```json
{ "then": { "setChoices": [{ "fieldName": [["Label A", "valueA"], ["Label B", "valueB"]] }] } }
```

### Nested If/Else

The `else` block can contain another `if/then/else` instead of actions:

```json
{
  "if": { "$this.fieldA": { "eq": "yes" } },
  "then": { "show": ["fieldB"] },
  "else": {
    "if": { "$this.fieldA": { "eq": "no" } },
    "then": { "show": ["fieldC"] }
  }
}
```

---

## Toggle Operators (Per-Field Conditionals)

Toggles are defined on individual fields (not at the form level like switch). They control visibility of other fields based on the current field's value.

### Format

```json
{
  "status": {
    "type": "string",
    "enum": ["loaded", "empty", "partial"],
    "toggles": {
      "loaded": ["weight_field", "seal_number"],
      "empty": ["empty_reason"],
      "eq:$this.other_field": ["dynamic_field"]
    }
  }
}
```

| Toggle Key | Meaning |
|------------|---------|
| `"loaded"` | When this field's value is `"loaded"`, show the listed fields |
| `"eq:$this.other_field"` | When this field's value equals the current value of `other_field`, show the listed fields |

Fields not in any active toggle list are hidden by the toggle system.

---

## Reference Resolution

References use a `$` prefix followed by a dot-path to resolve values from context data or other form fields at runtime.

### Reference Types

| Prefix | Source | Example |
|--------|--------|---------|
| `$job` | Job-level data | `$job.departure_time` |
| `$step` | Current step data | `$step.appointment.start_time` |
| `$task` | Current task data | `$task.external_data.geofence.circle.radius` |
| `$step_location` | Location linked to current step | `$step_location.name` |
| `$this` | Another field's current value (dynamic) | `$this.arrival_time` |

### Reference Patterns

#### Simple Object Reference
```
$job.departure_time
$step.appointment.start_time
$task.external_data.geofence.circle.radius
```

Resolved by drilling into the JSON: `referenceData["$step"]["appointment"]["start_time"]`

#### Array Index Reference
```
$job.external_data[1].value
$job.shipment_details.shipping_documents[0].value
```

Resolved by: get array → access by index → get value key.

#### Array Label Lookup Reference
```
$job.external_data[label=trailer_number].value
$job.external_data[label = trailer_number].value
```

Resolved by: get array → find item where `item["label"] == "trailer_number"` → get `item["value"]`.

#### Dynamic Reference ($this)
```
$this.arrival_time
$this.status
```

Resolved by finding the form field with matching name and reading its current value. Unlike other references, `$this` is **dynamic** — it updates when the referenced field changes.

### Where References Appear

- `default`: default field value (`"default": "$job.departure_time"`)
- `value`: static/computed value (`"value": "$step.appointment.start_time"`)
- Switch `if` conditions: left side of comparison (`"$this.status": {"eq": "loaded"}`)
- Switch `setValue` actions: value to assign (`{"arrival_time": "$job.departure_time"}`)
- Toggle keys: `"eq:$this.other_field"`

### Resolution at Read Time vs Runtime

- **Read time**: Static references (`$job`, `$step`, `$task`, `$step_location`) are resolved when the schema is first parsed. Values are substituted directly into field defaults and properties.
- **Runtime**: `$this` references are resolved dynamically as the user interacts with the form. Switch operators re-evaluate on every field change.

---

## Core APIs

### SchemaFactory (Android entry point)

```kotlin
object SchemaFactory {
    // Creates SchemaState for data-only access (no UI)
    suspend fun createState(context, configuration, externalProvider, externalService): SchemaState

    // Creates FormBuilder with Android UI views
    fun createFormBuilder(context, configuration, externalProvider, externalService, formLifecycle?): FormBuilder
}
```

### FormBuilder (Android UI)

```kotlin
interface FormBuilder {
    val view: ViewGroup                     // Root Android view with all form fields
    val isFormAvailable: Boolean            // True once schema parsed and rendered

    fun validateRequiredFields(): Boolean   // Returns true if all required fields valid
    fun hasValidationError(): Boolean       // True if any validation error exists
    fun focusFirstInvalidField()            // Scrolls to first invalid field

    fun getFormData(): FormData?            // Current values WITHOUT validation
    fun save(currentTime: Long): FormData?  // Current values WITH validation
    fun resetForm()                         // Clear all field values

    fun updateReferenceData(referenceData: Map<String, String>, shouldHandleOperators: Boolean = false)
    fun saveMetadata(): JsonObject          // Get metadata values
    fun destroy()                           // Cleanup
}
```

### SchemaReader (core parser)

```kotlin
interface SchemaReader {
    fun read(
        taskContentData: TaskContentData,
        formDefinitions: JsonObject,
        referenceData: Map<String, JsonObject>,
    ): ParentWidget
}
```

The `PsSchemaReader` implementation:
1. Looks up form definition by `taskContentData.type`
2. Iterates `properties`, resolves references, determines widget type
3. Creates widget tree (handling `object` and `array` recursion)
4. Parses `switch` statements via `SwitchReader`
5. Sorts by `order`

### FormData (submission result)

```kotlin
data class FormData(
    var formName: String = "",              // Task type string
    var formContent: JsonObject,            // All field values as JSON
    var errors: MutableMap<String, String>, // fieldName → error message
    var warnings: MutableMap<String, String>,
)
```

---

## Submission Flow

1. User fills out form fields
2. Switch operators re-evaluate on each change (show/hide/setValue/setEnum)
3. App calls `formBuilder.save(currentTime)` which:
   - Collects all visible field values into `FormData.formContent`
   - Runs validation (required, pattern, min/max, etc.)
   - Populates `FormData.errors` for any failures
4. If `errors` is empty, `FormData.formContent` is the submission payload
5. The submitted data becomes the task's `fields` object for future reference

---

## Sample Data Inventory

Files in `WorkflowEngine/app/src/main/assets/json/`:

| File | Description |
|------|-------------|
| `job.json` | Complete job with 2 steps (Pickup + Delivery), 4 tasks (arrived, pickupEmpty, dropEmpty, dropRelay), locations, external_data |
| `schemas.json` | 48 form definitions in `data.form_schema.formDefinitions` envelope |
| `step.json` | Single step object with tasks, appointment, external_data |
| `task.json` | Single task object |
| `step_location.json` | Location object linked to a step |
| `boolean.json` | Boolean field example |
| `date_time.json` | Date/time field variants |
| `string.json` | String field with enum/pattern examples |
| `string_default.json` | String field with default values |
| `integer.json` | Integer field example |
| `number.json` | Number field example |
| `dynamicDropdown.json` | Dropdown with dynamic reference options |
| `horizontal_objects.json` | Object with horizontal layout |
| `load_prompt_single.json` | Load prompt form definition |
| `simple.json` | Simple form with multiple field types |
| `simple_dynamic_references.json` | Form using `$job`, `$step`, `$this` references |
| `simple_widget_data.json` | Minimal saved widget data |
| `switch_nested_if.json` | Complex nested switch/if/else example |
| `toggle_check.json` | Toggle operator examples |
