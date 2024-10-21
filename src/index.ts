import * as runtype from 'is-runtype';


/**
 * Recursively checks if a type (including interfaces) is a JSON object type.
 * This is an extension of the classic JSON type including `undefined` (optional) properties.
 *
 * @param T The type to check.
 */
export type JsonStructure<T> = {
    [K in keyof T]: T[K] extends JsonValue | undefined
        ? T[K]
        : T[K] extends (...args: unknown[]) => unknown
            ? never
            : T[K] extends object
                ? JsonStructure<T[K]>
                : never
};

/**
 * Typedef to check if a type (including interfaces) is a Json type.
 * This is an extension of the classic JSON type including `undefined` and primitive root types.
 *
 * @param T The type to check.
 * @example function myFunction<T extends Json<T>>(value: T): void {
 *      // value is a Json type
 * }
 */
export type Json<T> = JsonValue | JsonStructure<T>;

/**
 * A JSON primitive is a string, number, or boolean value.
 */
export type JsonPrimitive = string | number | boolean;

/**
 * An extension of the classic JSON array type including `undefined` elements.
 */
export interface JsonArray extends Array<JsonValue> {}

/**
 * An extension of the classic JSON object type including `undefined` (optional) properties.
 */
export interface JsonObject extends Partial<Record<string, JsonValue>> {
}

/**
 * An extension of the classic JSON type including `undefined` and primitive root types.
 */
export type JsonValue = JsonPrimitive | JsonObject | JsonArray | null | undefined;

export function isObject<T extends JsonStructure<T>>(value: T | JsonValue): value is JsonObject {
    return runtype.isObject(value) && !runtype.isArray(value);
}

export function isArray<T extends JsonStructure<T>>(value: T | JsonValue): value is JsonArray {
    return runtype.isArray(value);
}

export function isPrimitive<T extends JsonStructure<T>>(value: T | JsonValue): value is JsonPrimitive {
    return runtype.isString(value) || runtype.isNumber(value) || runtype.isBoolean(value);
}

export function isJsonValue(value: unknown): value is JsonValue {
    return value === undefined || value === null || isJsonPrimitive(value) || isJsonObject(value) || isJsonArray(value);
}

export function isJsonObject(value: unknown): value is JsonObject {
    return runtype.isObject(value) && !runtype.isArray(value) && !runtype.isFunction(value) && Object.values(value).every(isJsonValue);
}

export function isJsonArray(value: unknown): value is JsonArray {
    return runtype.isArray(value) && value.every(isJsonValue);
}

export function isJsonPrimitive(value: unknown): value is JsonPrimitive {
    return runtype.isString(value) || runtype.isNumber(value) || runtype.isBoolean(value);
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
export function equals<T extends Json<T>>(a: T, b: T, exactOptionalProperties = false): boolean {
    if (a === b) {
        return true;
    }
    if (isArray(a) && isArray(b)) {
        return equalsArray(a, b, exactOptionalProperties);
    }
    if (isObject(a) && isObject(b)) {
        return equalsObject(a, b, exactOptionalProperties);
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
export function clone<T extends Json<T>>(value: T, exactOptionalProperties = false): T {
    if (isJsonArray(value)) {
        return value.map(v => clone(v, exactOptionalProperties)) as T;
    }
    if (isJsonObject(value)) {
        return Object.fromEntries(
            Object.entries(value)
                .filter(([k, v]) => exactOptionalProperties || v !== undefined)
                .map(([k, v]) => (v !== undefined ? [k, clone(v, exactOptionalProperties)] : [k, v])),
        ) as T;
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
export function parse<T extends Json<T>>(text: string, reviver?: (this: any, key: string, value: JsonValue) => JsonValue): T {
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
export function stringify<T extends Json<T>>(value: T, replacer?: (string | number)[] | null, space?: string | number): string {
    return JSON.stringify(value, replacer, space);
}
