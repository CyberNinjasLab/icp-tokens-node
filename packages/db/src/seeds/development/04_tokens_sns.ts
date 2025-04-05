import { Knex } from 'knex';
import { HttpAgent } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
import { SnsAggregatorCanister, AccountManager as SNSAccountManager } from '@icptokens/nns-integration';
import { Token as TokenAdapter } from "@icptokens/token-toolkit";
import { ICP_LEDGER_CANISTER_ID } from "@icptokens/constants";


export async function seed(knex: Knex): Promise<void> {
  // Initialize SNS Aggregator
  const agent = new HttpAgent({ host: "https://ic0.app" });
  const snsAggregator = new SnsAggregatorCanister();
  
  try {
    // Fetch all SNS data
    const snsTokens = await snsAggregator.fetchAllPaginatedData();
    
    // Get SNS tag ID
    const snsTag = await knex('token_tags')
      .where('abbreviation', 'SNS')
      .first();
    
    if (!snsTag) {
      throw new Error('SNS tag not found in token_tags table');
    }

    // Process all SNS tokens in parallel
    await Promise.all(snsTokens.map(async (sns) => {
      const canisterId = sns.getLedgerCanisterId();
      
      // Check if token already exists
      const existingToken = await knex('tokens')
        .where('canister_id', canisterId)
        .first();
      
      try {
        let tokenId: number;

        if (!existingToken) {
          const tokenAdapter = new TokenAdapter({
            canisterId,
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

          // Create social links array with SNS URL
          const socialLinks = [{
            name: 'Website',
            url: sns.getUrl(),
            description: `Official ${sns.getName()} Website`
          }];

          // Insert token
          const [{ id }] = await knex('tokens').insert({
            canister_id: canisterId,
            name: name || sns.getName(),
            description: sns.getDescription(),
            symbol: symbol || '',
            logo: logo || null,
            decimals: decimals || 0,
            fee: fee?.toString() || null,
            total_supply: totalSupply?.toString() || null,
            max_supply: null,
            circulating_supply: null,
            social_links: JSON.stringify(socialLinks)
          }).returning('id');
          
          tokenId = id;
          console.log(`Added new SNS token: ${canisterId} (${symbol || sns.getName()})`);
        } else {
          tokenId = existingToken.id;
        }

        const governanceCanisterId = sns.getGovernanceCanisterId();

        // store sns metadata
        await knex('sns_token_metadata')
          .insert({
            token_id: tokenId,
            governance_principal_id: governanceCanisterId
          });

        // Fetch treasury for token and for icp token and upsert it into the token_treasuries table
        const treasury = await knex('treasuries')
          .where('type', 'SNS')
          .first();
        
        if (!treasury) {
          throw new Error('SNS treasury not found in treasuries table');
        }

        try {
          // Fetch treasury balances
          const governanceTreasuryBalance = {
            icp: await SNSAccountManager.getIcpTreasuryBalance(Principal.fromText(governanceCanisterId)),
            icrc_token: await SNSAccountManager.getIcrcTokenTreasuryBalance(
              Principal.fromText(governanceCanisterId),
              Principal.fromText(canisterId)
            )
          };

          // Fetch ICP token
          const icpToken = await knex('tokens')
            .where('canister_id', ICP_LEDGER_CANISTER_ID)
            .first();

          if (!icpToken) {
            throw new Error('ICP token not found in tokens table');
          }

          // Store ICP balance
          await knex('token_treasuries')
            .insert({
              treasury_id: treasury.id,
              token_id: tokenId, // SNS token ID
              treasury_token_id: icpToken.id,
              amount: governanceTreasuryBalance.icp.toString()
            })
            .onConflict(['treasury_id', 'token_id', 'treasury_token_id'])
            .merge();

          // Store SNS token balance
          await knex('token_treasuries')
            .insert({
              treasury_id: treasury.id,
              token_id: tokenId,
              treasury_token_id: tokenId,
              amount: governanceTreasuryBalance.icrc_token.toString()
            })
            .onConflict(['treasury_id', 'token_id', 'treasury_token_id'])
            .merge();

          // console log detailed info about updated treasury balances
          console.log(`Updated treasury balances for token ${canisterId}:`);
          console.log(`ICP balance: ${governanceTreasuryBalance.icp.toString()}`);
          console.log(`SNS token balance: ${governanceTreasuryBalance.icrc_token.toString()}`);

          console.log(`Updated treasury balances for token ${canisterId}`);
        } catch (error) {
          console.error(`Failed to fetch/store treasury balances for ${canisterId}:`, error);
        }

        // Upsert SNS tag relation
        await knex('token_tags_relations')
          .insert({
            token_id: tokenId,
            tag_id: snsTag.id
          })
          .onConflict(['token_id', 'tag_id'])
          .ignore();
      } catch (error) {
        console.error(`Failed to process SNS token ${canisterId}:`, error);
      }
    }));
  } catch (error) {
    console.error('Failed to fetch SNS tokens:', error);
    throw error;
  }
} 