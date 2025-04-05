import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('tokens', (table) => {
    table.increments('id').primary();
    table.string('canister_id').unique().notNullable().comment('unique token canister/contract address ID');
    table.text('name').notNullable();
    table.text('symbol').notNullable();
    table.text('logo').nullable().comment('Base64 encoded image for token logo');
    table.smallint('decimals').notNullable().comment('number of decimal places for token (usually 0-18)');
    table.decimal('fee', 40, 0).comment('transfer fee in smallest token units (flexible high precision integer)');
    table.decimal('total_supply', 78, 0).comment('total token supply (high precision integer)');
    table.decimal('max_supply', 78, 0).nullable().comment('maximum token supply (if capped)');
    table.decimal('circulating_supply', 78, 0).nullable().comment('current circulating supply');
    table.text('description').nullable().comment('token description');
    table.jsonb('social_links').nullable().comment('social media and other relevant links');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('tokens');
}

// TODO: Token migration table to track token migrations
