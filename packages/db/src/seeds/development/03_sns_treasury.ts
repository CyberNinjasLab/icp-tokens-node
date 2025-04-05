import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // First, clean up existing entries
  await knex('token_treasuries').del();
  await knex('treasuries').del();

  // Insert sample SNS treasury
  await knex('treasuries').insert([
    {
      type: 'SNS',
      name: 'Service Neuron System',
      description: 'Service Nervous Systems enable decentralized apps to make collective decisions, where users participate through token-based voting — all managed automatically.',
    },
  ]).returning('id');
} 