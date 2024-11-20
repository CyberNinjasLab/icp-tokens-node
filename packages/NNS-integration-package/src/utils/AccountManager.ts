import { Principal } from '@dfinity/principal';
import * as crypto from 'crypto';
import { NNS_LEDGER_TOKEN_DISTRIBUTION_DOMAIN } from './config';

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
        principalId: Principal,
        nonce: bigint
    ): Uint8Array {
        return this.computeNeuronDomainSubaccountBytes(
            principalId,
            NNS_LEDGER_TOKEN_DISTRIBUTION_DOMAIN,
            nonce
        );
    }

    /**
     * Generates the account ID and token details for a distribution account.
     *
     * @param governanceCanister - The principal ID of the governance canister.
     * @param distributionAccountNonce - A unique 64-bit number for differentiation.
     * @param amountE8s - The token amount in e8s (smallest unit of the token).
     * @returns An object containing the account details and tokens.
     */
    public static getDistributionAccountIdAndTokens(
        governanceCanister: Principal,
        distributionAccountNonce: bigint,
        amountE8s: bigint
    ): { account: { owner: string; subaccount: string }; tokens: { e8s: bigint } } {
        const subaccount = this.computeDistributionSubaccountBytes(
            governanceCanister,
            distributionAccountNonce
        );

        const account = {
            owner: governanceCanister.toText(),
            subaccount: Buffer.from(subaccount).toString('hex'),
        };

        const tokens = {
            e8s: amountE8s,
        };

        return { account, tokens };
    }
}
