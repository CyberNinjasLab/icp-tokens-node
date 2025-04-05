import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // First, delete existing entries
  await knex('token_tags').del();

  // Insert seed entries
  await knex('token_tags').insert([
    { slug: 'ai', abbreviation: 'AI', name: 'AI' },
    { slug: 'chain-key', abbreviation: 'CK', name: 'Chain-Key' },
    { slug: 'sns', abbreviation: 'SNS', name: 'Service Neuron System' },
    { slug: 'dex', abbreviation: 'DEX', name: 'Decentralized Exchanges' },
    { slug: 'memes', abbreviation: 'Memes', name: 'Memes' },
    { slug: 'gaming', abbreviation: 'Gaming', name: 'Gaming' },
    { slug: 'miners', abbreviation: 'Miners', name: 'Miners' },
  ]);
} 