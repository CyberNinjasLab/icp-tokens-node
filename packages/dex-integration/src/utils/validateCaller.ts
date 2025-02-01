import { Principal } from "@dfinity/principal";

export const validateCaller = (pid: Principal): void => {
    if (Principal.anonymous() === pid) {
        throw new Error("Anonymous caller");
    }
};
