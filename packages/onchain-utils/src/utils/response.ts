import { safeParseJSON } from './safeParseJSON';

/**
 * Represents a response type that can contain either a success value (T) or an error value (E).
 * This type is commonly used to handle responses from Internet Computer (IC) canisters which
 * can return either an "ok"/"Ok" or "err"/"Err" variant.
 * 
 * @template T - The type of the success value
 * @template E - The type of the error value
 */
export type Response<T, E> =
    | {
          ok: T;
      }
    | {
          err: E;
      }
    | {
          Ok: T;
      }
    | {
          Err: E;
      };

/**
 * Parses a Response type and returns the success value or throws an error.
 * This function handles both lowercase ("ok"/"err") and uppercase ("Ok"/"Err") variant names
 * that are commonly used in IC canister responses.
 * 
 * @template T - The type of the success value
 * @template E - The type of the error value
 * @param response - The response object to parse
 * @returns The success value of type T
 * @throws {Error} If the response contains an error or is invalid
 * 
 * @example
 * const response = { ok: "success" };
 * const result = parseResultResponse(response);
 * // result = "success"
 * 
 * @example
 * const response = { err: { message: "failed" } };
 * // Will throw an Error with the stringified error message
 * const result = parseResultResponse(response);
 */
export const parseResultResponse = <T, E>(response: Response<T, E>): T => {
    if ("ok" in response) {
        return response.ok;
    } else if ("Ok" in response) {
        return response.Ok;
    } else if ("err" in response) {
        throw new Error(safeParseJSON(response.err as Record<string, unknown>));
    } else if ("Err" in response) {
        throw new Error(safeParseJSON(response.Err as Record<string, unknown>));
    }

    throw new Error("Invalid response");
}; 