/* eslint-disable @typescript-eslint/no-use-before-define */
import * as runtype from 'is-runtype';


export type JsonPrimitive = string | number | boolean;
export type JsonValue = JsonPrimitive | JsonObject | JsonArray | null;
export interface JsonObject extends Partial<Record<string, JsonValue>> {}
export interface JsonArray extends Array<JsonValue> {}

export function isBoolean(value: JsonValue): value is boolean {
    return runtype.isBoolean(value);
}

export function isNumber(value: JsonValue): value is number {
    return runtype.isNumber(value);
}

export function isString(value: JsonValue): value is string {
    return runtype.isString(value);
}

export function isObject(value: JsonValue): value is JsonObject {
    return runtype.isObject(value);
}

export function isArray(value: JsonValue): value is JsonArray {
    return runtype.isArray(value);
}

export function isNull(value: JsonValue): value is null {
    return value === null;
}

export function isPrimitive(value: JsonValue): value is JsonPrimitive {
    return isBoolean(value) || isNumber(value) || isString(value);
}

function equalsObject(a: JsonObject, b: JsonObject, exactOptionalProperties = false): boolean {
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

function equalsArray(a: JsonArray, b: JsonArray, exactOptionalProperties = false): boolean {
    if (a.length !== b.length) {
        return false;
    }
    return a.every((value, index) => equals(value, b[index], exactOptionalProperties));
}

/**
 * Compare two JSON values for deep equality.
 *
 * @param a The first JSON value.
 * @param b The second JSON value.
 * @param exactOptionalProperties Interpret undefined properties as written.
 * If true keys must match exactly for objects to be considered equal.
 * If false, keys with undefined values are ignored in the comparison.
 * @returns True if the values are deeply equal, otherwise false.
 */
export function equals(a: JsonValue, b: JsonValue, exactOptionalProperties = false): boolean {
    if (a === b) {
        return true;
    }
    if (isObject(a) && isObject(b)) {
        return equalsObject(a, b, exactOptionalProperties);
    }
    if (isArray(a) && isArray(b)) {
        return equalsArray(a, b, exactOptionalProperties);
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
    if (isObject(value)) {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([k, v]) => exactOptionalProperties || v !== undefined)
                .map(([k, v]) => (v !== undefined ? [k, clone(v, exactOptionalProperties)] : [k, v])),
        );
    }
    if (isArray(value)) {
        return value.map(v => clone(v, exactOptionalProperties));
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
