import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create treasuries table
  await knex.schema.createTable('treasuries', (table) => {
    table.increments('id').primary();
    table.string('type').notNullable();
    table.string('name').notNullable();
    table.text('description');
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create token_treasuries table
  await knex.schema.createTable('token_treasuries', (table) => {
    table.increments('id').primary();
    table.integer('treasury_id').unsigned().notNullable();
    table.integer('token_id').unsigned().notNullable();
    table.integer('treasury_token_id').unsigned().notNullable();
    table.decimal('amount', 78, 0).notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // Foreign key constraints
    table.foreign('treasury_id').references('treasuries.id').onDelete('CASCADE');
    table.foreign('token_id').references('tokens.id').onDelete('CASCADE');
    table.foreign('treasury_token_id').references('tokens.id').onDelete('CASCADE');

    // Unique constraint to prevent duplicate token-treasury pairs
    table.unique(['treasury_id', 'token_id', 'treasury_token_id']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('token_treasuries');
  await knex.schema.dropTableIfExists('treasuries');
} 