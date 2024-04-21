/* eslint-disable @typescript-eslint/no-use-before-define */
export type JsonPrimitive = string | number | boolean;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray | null;
export interface JsonObject extends Record<string, JsonValue> {}
export interface JsonArray extends Array<JsonValue> {}

export function isBoolean(value: JsonValue): value is boolean {
    return typeof value === 'boolean';
}

export function isNumber(value: JsonValue): value is number {
    return typeof value === 'number';
}

export function isString(value: JsonValue): value is string {
    return typeof value === 'string';
}

export function isObject(value: JsonValue): value is JsonObject {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isArray(value: JsonValue): value is JsonArray {
    return Array.isArray(value);
}

export function isNull(value: JsonValue): value is null {
    return value === null;
}

export function isPrimitive(value: JsonValue): value is JsonPrimitive {
    return isBoolean(value) || isNumber(value) || isString(value);
}

function equalsObject(a: JsonObject, b: JsonObject): boolean {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) {
        return false;
    }
    return keysA.every(key => equals(a[key], b[key]));
}

function equalsArray(a: JsonArray, b: JsonArray): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((value, index) => equals(value, b[index]));
}

/**
 * Compare two JSON values for deep equality.
 *
 * @param a The first JSON value.
 * @param b The second JSON value.
 * @returns True if the values are deeply equal, otherwise false.
 */
export function equals(a: JsonValue, b: JsonValue): boolean {
    if (a === b) {
        return true;
    }
    if (isObject(a) && isObject(b)) {
        return equalsObject(a, b);
    }
    if (isArray(a) && isArray(b)) {
        return equalsArray(a, b);
    }
    return false;
}

/**
 * Deep clone a JSON value.
 *
 * @param value The JSON value to clone.
 * @returns The cloned JSON value.
 */
export function clone(value: JsonValue): JsonValue {
    if (isObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, clone(v)]));
    }
    if (isArray(value)) {
        return value.map(clone);
    }
    return value;
}

/**
 * Converts a JavaScript Object Notation (JSON) string into a json value.
 * This is a typed version of `JSON.parse`.
 *
 * @param text A valid JSON string.
 * @param reviver A function that transforms the results.
 * This function is called for each member of the object.
 * If a member contains nested objects, the nested objects are transformed before the parent object is.
 * @returns The parsed JSON value.
 */
export function parse(text: string, reviver?: (this: any, key: string, value: JsonValue) => JsonValue): JsonValue {
    return JSON.parse(text, reviver);
}

/**
 * Converts a JavaScript value to a JavaScript Object Notation (JSON) string.
 * This is a typed version of `JSON.stringify`.
 *
 * @param value A JavaScript value, usually an object or array, to be converted.
 * @param replacer An array of strings and numbers that acts as an approved list for selecting the object properties that will be stringified.
 * @param space Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns The JSON string representation of the value.
 */
export function stringify(value: JsonValue, replacer?: (string | number)[] | null, space?: string | number): string {
    return JSON.stringify(value, replacer, space);
}
