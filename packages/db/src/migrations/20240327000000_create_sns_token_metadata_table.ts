import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('sns_token_metadata', (table) => {
    table.integer('token_id').unsigned().notNullable();
    table.string('governance_principal_id').notNullable();
    
    // Add foreign key constraint
    table.foreign('token_id')
      .references('tokens.id')
      .onDelete('CASCADE')
      .onUpdate('CASCADE');
    
    // Add primary key using token_id since it's a 1:1 relationship
    table.primary(['token_id']);
    
    // Add timestamps
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('sns_token_metadata');
} 