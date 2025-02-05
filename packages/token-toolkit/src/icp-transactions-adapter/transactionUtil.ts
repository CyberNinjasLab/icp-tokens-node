import { FormattedTransaction, From, To } from "./types";

import { IcpBlock } from "./types";

/**
 * Formats an ICP transaction block into a readable format for storage.
 * @param index The transaction index (block number)
 * @param block The raw ICP ledger block
 * @returns A formatted transaction object
 */
export function formatIcpTransaction(index: bigint, block: IcpBlock): FormattedTransaction {
    const rawTx = block.transaction as any;

    let type: "transfer" | "burn" | "mint" = "transfer";
    let from: string = '';
    let to: string = '';
    let value: bigint = BigInt(0);
    let fee: bigint = BigInt(0);
    let memo = rawTx.memo ? rawTx.memo.toString() : "0";
    let timestamp = new Date(Number(block.timestamp.timestamp_nanos) / 1_000_000); // Convert nanoseconds to Date

    // Ensure operation exists and is an array
    if (Array.isArray(rawTx.operation) && rawTx.operation.length > 0) {
        const operation = rawTx.operation[0];

        if ("Transfer" in operation) {
            type = "transfer";
            const transfer = operation.Transfer;

            from = bytesToHex(new Uint8Array(Object.values(transfer.from)))
            to = bytesToHex(new Uint8Array(Object.values(transfer.to)))

            value = transfer.amount.e8s;
            fee = transfer.fee.e8s;
        } else if ("Mint" in operation) {
            type = "mint";
            const mint = operation.Mint;

            to = bytesToHex(new Uint8Array(Object.values(mint.to)))

            value = mint.amount.e8s;
        } else if ("Burn" in operation) {
            type = "burn";
            const burn = operation.Burn;

            from = bytesToHex(new Uint8Array(Object.values(burn.from))),

            value = burn.amount.e8s;
        }
    }

    return {
        index,
        type,
        from,
        to,
        value,
        fee,
        memo,
        timestamp,
    };
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("");
}
