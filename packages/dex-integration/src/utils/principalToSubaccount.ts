import { Principal } from "@dfinity/principal";

export const principalToSubaccount = (principal: Principal) => {
    const principalBytes = principal.toUint8Array(); // Convert Principal to Uint8Array
    const subaccount = new Uint8Array(32); // Create a 32-byte array filled with zeros
    subaccount[0] = principalBytes.length; // Set the first byte to the length of the principal

    for (let i = 0; i < principalBytes.length && i < 31; i++) {
        subaccount[i + 1] = principalBytes[i]; // Copy the principal bytes into the subaccount array
    }

    return subaccount; // Return the 32-byte subaccount array
};
