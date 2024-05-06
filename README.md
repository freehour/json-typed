# json-typedefs

Type definitions and typed functions for JSON

## Types

```typescript
type JsonPrimitive = string | number | boolean;
type JsonValue = JsonPrimitive | JsonObject | JsonArray | null;
interface JsonObject extends Record<string, JsonValue> {}
interface JsonArray extends Array<JsonValue> {}
```

## Functions

```typescript
function isBoolean(value: JsonValue): value is boolean;
function isNumber(value: JsonValue): value is number;
function isString(value: JsonValue): value is string;
function isObject(value: JsonValue): value is JsonObject;
function isArray(value: JsonValue): value is JsonArray;
function isNull(value: JsonValue): value is null;
function isPrimitive(value: JsonValue): value is JsonPrimitive;

function equals(a: JsonValue, b: JsonValue): boolean;
function clone(value: JsonValue): JsonValue;
function parse(text: string, reviver?: (this: any, key: string, value: JsonValue) => JsonValue): JsonValue;
function stringify(value: JsonValue, replacer?: (string | number)[] | null, space?: string | number): string;
```
