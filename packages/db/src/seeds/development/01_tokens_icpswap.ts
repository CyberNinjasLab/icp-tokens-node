import { Knex } from 'knex';
import { HttpAgent } from "@dfinity/agent";
import { ICPSwap } from "@icptokens/dex-integration";
import { Token as TokenAdapter } from "@icptokens/token-toolkit";
import { ALLOWED_TOKENS } from '../../const/allowed_tokens';

export async function seed(knex: Knex): Promise<void> {
  // Initialize ICPSwap client
  const agent = new HttpAgent({ host: "https://ic0.app" });
  const icpSwap = new ICPSwap({ agent });
  
  // Get all tokens from ICPSwap
  const tokens = await icpSwap.listTokens();
  
  // Filter tokens by allowed list
  const allowedTokens = tokens.filter(token => 
    ALLOWED_TOKENS.includes(token.address)
  );
  
  // Process all tokens in parallel
  await Promise.all(allowedTokens.map(async (token) => {
    // Check if token already exists
    const existingToken = await knex('tokens')
      .where('canister_id', token.address)
      .first();
    
    if (!existingToken) {
      try {
        const tokenAdapter = new TokenAdapter({
          canisterId: token.address,
          agent
        });
        
        await tokenAdapter.init();
        
        // Gather all required token data in parallel
        const [
          name,
          symbol,
          decimals,
          totalSupply,
          fee,
          logo
        ] = await Promise.all([
          tokenAdapter.name(),
          tokenAdapter.symbol(),
          tokenAdapter.getDecimals(),
          tokenAdapter.totalSupply(),
          tokenAdapter.getFee(),
          tokenAdapter.getLogo()
        ]);

        await knex('tokens').insert({
          canister_id: token.address,
          name: name || token.name,
          symbol: symbol || token.symbol,
          logo: logo || null,
          decimals: decimals || 0,
          fee: fee?.toString() || null,
          total_supply: totalSupply?.toString() || null,
          max_supply: null,
          circulating_supply: null
        });

        console.log(`Added new token: ${token.address} (${symbol || token.symbol})`);
      } catch (error) {
        console.error(`Failed to process token ${token.address}:`, error);
      }
    }
  }));
} 