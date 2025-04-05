import { Principal } from "@dfinity/principal";

/**
 * Converts an Internet Computer Principal to a 32-byte subaccount identifier.
 * 
 * This function creates a standardized subaccount derived from a Principal ID.
 * The resulting subaccount follows the Internet Computer's specification:
 * - First byte contains the length of the principal
 * - Subsequent bytes contain the principal's bytes
 * - Remaining bytes are filled with zeros
 * 
 * @param {Principal} principal - The Principal identifier to convert
 * @returns {Uint8Array} A 32-byte Uint8Array representing the subaccount
 * 
 * @example
 * ```typescript
 * const principal = Principal.fromText("2vxsx-fae");
 * const subaccount = principalToSubaccount(principal);
 * // Returns a 32-byte Uint8Array with principal encoded
 * ```
 */
export const principalToSubaccount = (principal: Principal) => {
    // Convert Principal to its byte representation
    const principalBytes = principal.toUint8Array();
    
    // Initialize a 32-byte array filled with zeros (standard subaccount size)
    const subaccount = new Uint8Array(32);
    
    // Store the principal's length in the first byte
    subaccount[0] = principalBytes.length;

    // Copy principal bytes into the subaccount array, starting from index 1
    // Ensures we don't exceed the 31 remaining bytes (32 total - 1 length byte)
    for (let i = 0; i < principalBytes.length && i < 31; i++) {
        subaccount[i + 1] = principalBytes[i];
    }

    return subaccount;
};
