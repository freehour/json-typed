import * as runtype from 'is-runtype';


/**
 * A JSON primitive is a string, number, or boolean value.
 */
export type JsonPrimitive = string | number | boolean;

/**
 * An array of JSON values.
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * An object with string keys and JSON values.
 * It has support for optional properties as these are ignored by parse and stringify functions.
 */
export interface JsonObject extends Partial<Record<string, JsonValue>> {
}

/**
 * A JSON value is a primitive, a JSON array, a JSON object, or null.
 */
export type JsonValue = JsonPrimitive | JsonArray | JsonObject | null;


/**
 * Check if a value is a JSON primitive.
 * @param value The value to check.
 * @returns true if the value is a JSON primitive.
 */
export function isJsonPrimitive(value: unknown): value is JsonPrimitive {
    return runtype.isString(value) || runtype.isNumber(value) || runtype.isBoolean(value);
}

/**
 * Check if a value is a JSON array.
 * @param value The value to check.
 * @returns true if the value is a JSON array.
 */
export function isJsonArray(value: unknown): value is JsonArray {
    return runtype.isArray(value) && value.every(isJsonValue);
}

/**
 * Check if a value is a JSON object.
 * @param value The value to check.
 * @returns true if the value is a JSON object.
 */
export function isJsonObject(value: unknown): value is JsonObject {
    return runtype.isObject(value) && !runtype.isArray(value) && !runtype.isFunction(value) && Object.values(value).every(isJsonValue);
}

/**
 * Check if a value is a JSON value.
 * @param value The value to check.
 * @returns true if the value is a JSON value.
 */
export function isJsonValue(value: unknown): value is JsonValue {
    return value === null || isJsonPrimitive(value) || isJsonArray(value) || isJsonObject(value);
}

/**
 * Compare two JSON values for deep equality.
 *
 * @param a A JSON value.
 * @param b A JSON value.
 * @param exactOptionalProperties Interpret `undefined` properties as written.
 * If `true` keys must match exactly for objects to be considered equal.
 * If `false`, keys with undefined values are ignored in the comparison.
 * Default is `false`.
 * @returns Whether the two JSON values are equal.
 */
export function equals(a: JsonValue, b: JsonValue, exactOptionalProperties = false): boolean {
    if (a === b) {
        return true;
    }
    if (runtype.isArray(a) && runtype.isArray(b)) {
        if (a.length !== b.length) {
            return false;
        }
        return a.every((value, index) => equals(value, b[index], exactOptionalProperties));
    }
    if (runtype.isObject(a) && !runtype.isArray(a) && runtype.isObject(b) && !runtype.isArray(b)) {
        const keysA = Object.keys(a).filter(key => exactOptionalProperties || a[key] !== undefined);
        const keysB = Object.keys(b).filter(key => exactOptionalProperties || b[key] !== undefined);

        if (keysA.length !== keysB.length) {
            return false;
        }

        return keysA.every(key => {
            const valueA = a[key];
            const valueB = b[key];
            return valueA === valueB || (valueA !== undefined && valueB !== undefined && equals(valueA, valueB));
        });
    }
    return false;
}

/**
 * Deep clone a JSON value.
 *
 * @param value The JSON value to clone.
 * @param exactOptionalProperties Keep undefined properties in the cloned object.
 * @returns The cloned JSON value.
 */
export function clone(value: JsonValue, exactOptionalProperties = false): JsonValue {
    if (runtype.isArray(value)) {
        return value.map(v => clone(v, exactOptionalProperties));
    }
    if (runtype.isObject(value)) {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([k, v]) => exactOptionalProperties || v !== undefined)
                .map(([k, v]) => (v !== undefined ? [k, clone(v, exactOptionalProperties)] : [k, v])),
        );
    }
    return value;
}
