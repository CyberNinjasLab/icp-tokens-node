import { Principal } from '@dfinity/principal';
import { createAgent } from "@dfinity/utils";
import { AnonymousIdentity } from "@dfinity/agent";
import { AccountIdentifier, LedgerCanister } from "@dfinity/ledger-icp";
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import * as crypto from 'crypto';
import { ICP_LEDGER_CANISTER_ID, NNS_LEDGER_TOKEN_DISTRIBUTION_DOMAIN } from './config';

/**
 * AccountManager provides utility methods for computing subaccounts
 * and handling token distribution accounts in the IC ecosystem.
 */
export class AccountManager {
    /**
     * Computes the subaccount bytes for a specific domain and nonce.
     *
     * @param controller - The principal ID of the controller.
     * @param domain - The domain for subaccount computation (e.g., "token-distribution").
     * @param nonce - A unique 64-bit number for differentiation.
     * @returns A 32-byte hash representing the subaccount.
     */
    private static computeNeuronDomainSubaccountBytes(
        controller: Principal,
        domain: string,
        nonce: bigint
    ): Uint8Array {
        const nonceBuffer = Buffer.alloc(8);
        nonceBuffer.writeBigUInt64BE(nonce, 0);

        const domainBuffer = Buffer.from(domain);
        const domainLengthBuffer = Buffer.from([domainBuffer.length]);

        const hasher = crypto.createHash('sha256');
        hasher.update(domainLengthBuffer);
        hasher.update(domainBuffer);
        hasher.update(controller.toUint8Array());
        hasher.update(nonceBuffer);

        return hasher.digest();
    }

    /**
     * Computes the subaccount bytes specifically for token distribution.
     *
     * @param principalId - The principal ID of the governance canister.
     * @param nonce - A unique 64-bit number for differentiation.
     * @returns A 32-byte hash representing the subaccount.
     */
    public static computeDistributionSubaccountBytes(
        governancePrincipalId: Principal,
        nonce: bigint
    ): Uint8Array {
        return this.computeNeuronDomainSubaccountBytes(
            governancePrincipalId,
            NNS_LEDGER_TOKEN_DISTRIBUTION_DOMAIN,
            nonce
        );
    }

    /**
     * Fetches the ICP Treasury Balance of a SNS Governance canister
     *
     * @param governancePrincipalId - The principal ID of the governance canister.
     * @returns The ICP treasury balance as a number.
     */
    public static async getIcpTreasuryBalance(
        governancePrincipalId: Principal
    ): Promise<bigint> {
        const agent = await createAgent({
            identity: new AnonymousIdentity(),
        });

        // Initialize the ICP Ledger Canister
        const { accountBalance } = LedgerCanister.create({
            agent,
            canisterId: Principal.fromText(ICP_LEDGER_CANISTER_ID),
        });

        // Fetch the ICP treasury balance
        const governanceTreasuryAccountIdentifier = AccountIdentifier.fromPrincipal({
            principal: governancePrincipalId,
        });

        const balance = await accountBalance({
            accountIdentifier: governanceTreasuryAccountIdentifier,
            certified: true,
        });

        return balance;
    }

    /**
     * Fetches the ICRC token treasury balance of a governance canister.
     *
     * @param governancePrincipalId - The principal ID of the governance canister.
     * @param ledgerCanisterId - The canister ID of the ICRC Ledger.
     * @returns The ICRC token treasury balance as a bigint.
     */
    public static async getIcrcTokenTreasuryBalance(
        governancePrincipalId: Principal,
        ledgerCanisterId: Principal
    ): Promise<bigint> {
        // Create an agent
        const agent = await createAgent({
            identity: new AnonymousIdentity(),
        });

        // Initialize the ICRC Ledger Canister
        const icrcLedger = IcrcLedgerCanister.create({
            agent,
            canisterId: ledgerCanisterId,
        });

        const subaccount = this.computeDistributionSubaccountBytes(governancePrincipalId, BigInt(0));

        // Fetch the treasury balance
        const balance = await icrcLedger.balance({
            owner: governancePrincipalId,
            subaccount 
        });

        return balance;
    }
}
