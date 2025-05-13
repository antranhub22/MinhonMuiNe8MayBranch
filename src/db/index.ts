import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

// Default connection string if DATABASE_URL is not provided
const DEFAULT_DB_URL = 'postgres://postgres:postgres@localhost:5432/minhon';

// Log connection information
const dbUrl = process.env.DATABASE_URL || DEFAULT_DB_URL;
console.log('Database connection using URL:', dbUrl.replace(/:\/\/[^:]+:[^@]+@/, '://****:****@'));

const pool = new Pool({
  connectionString: dbUrl
});

// Test connection on startup
(async () => {
  try {
    const client = await pool.connect();
    console.log('Database connection successful');
    client.release();
  } catch (error) {
    console.error('Database connection failed:', error);
  }
})();

export const db = drizzle(pool); 