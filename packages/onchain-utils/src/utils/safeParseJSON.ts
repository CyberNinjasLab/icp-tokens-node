/**
 * Safely converts a JavaScript object to a JSON string while handling BigInt values.
 * This utility function is necessary because the standard JSON.stringify() cannot serialize
 * BigInt values directly, as they are not part of the JSON specification.
 * 
 * @param arg - The object to be converted to JSON string
 * @returns A JSON string representation of the input object with BigInt values converted to strings
 * 
 * @example
 * const obj = { id: 123n, name: "test" };
 * const jsonString = safeParseJSON(obj);
 * // Result: '{"id":"123","name":"test"}'
 */
export const safeParseJSON = (arg: Record<string, unknown>): any => {
    return JSON.stringify(
        arg,
        (_key, value) => (typeof value === "bigint" ? value.toString() : value), // return everything else unchanged
    );
};