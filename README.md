# json-typedefs

Type definitions for JSON

## Types

```typescript
type JsonPrimitive = string | number | boolean;
interface JsonArray extends Array<JsonValue> {}
interface JsonObject extends Partial<Record<string, JsonValue>> {}
type JsonValue = JsonPrimitive | JsonArray | JsonObject | null;
```

## Functions

```typescript
function isJsonPrimitive(value: JsonValue): value is JsonPrimitive;
function isJsonArray(value: JsonValue): value is JsonArray;
function isJsonObject(value: unknown): value is JsonObject
function isJsonValue(value: JsonValue): value is JsonValue;

function equals(a: JsonValue, b: JsonValue): boolean;
function clone(value: JsonValue): JsonValue;
```
