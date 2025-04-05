import knex, { Knex } from 'knex';
import config from './knexfile';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Get environment from env or default to development
const environment = process.env.NODE_ENV || 'development';

// Initialize knex with the appropriate configuration
const knexInstance: Knex = knex(config[environment]);

export default knexInstance; 