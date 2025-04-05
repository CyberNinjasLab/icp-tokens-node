import { Principal } from "@dfinity/principal";

/**
 * Validates that the caller is not anonymous on the Internet Computer.
 * 
 * This utility function ensures that the caller has a valid Principal ID and is not
 * using the anonymous identity. This is commonly used in canister methods to
 * enforce authenticated access.
 * 
 * @param {Principal} pid - The Principal identifier of the caller to validate
 * @throws {Error} Throws an error if the caller is anonymous
 * 
 * @example
 * ```typescript
 * function someCanisterMethod(caller: Principal) {
 *   validateCaller(caller);
 *   // Continue with authenticated operation...
 * }
 * ```
 */
export const validateCaller = (pid: Principal): void => {
    // Check if the provided Principal matches the anonymous identity
    if (Principal.anonymous() === pid) {
        throw new Error("Anonymous caller");
    }
};
