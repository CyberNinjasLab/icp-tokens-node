import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Create token_tags table for storing tag information
  await knex.schema.createTable('token_tags', (table) => {
    table.increments('id').primary();
    table.string('slug').unique().notNullable().comment('Unique tag slug for URLs');
    table.string('abbreviation').notNullable().comment('Short form of the tag');
    table.string('name').notNullable().comment('Display name of the tag');
    table.timestamps(true, true);
  });

  // Create token_tags_relations table for linking tokens and tags
  await knex.schema.createTable('token_tags_relations', (table) => {
    table.integer('token_id').notNullable()
      .references('id').inTable('tokens')
      .onDelete('CASCADE')
      .index();
    table.integer('tag_id').notNullable()
      .references('id').inTable('token_tags')
      .onDelete('CASCADE')
      .index();
      
    // Create composite primary key to prevent duplicate relations
    table.primary(['token_id', 'tag_id']);
    
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  // Drop tables in reverse order due to foreign key constraints
  await knex.schema.dropTable('token_tags_relations');
  await knex.schema.dropTable('token_tags');
}
