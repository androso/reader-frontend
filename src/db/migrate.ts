
import { sql } from '@vercel/postgres';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db } from '.';

async function main() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        image TEXT,
        google_id TEXT UNIQUE,
        password TEXT,
        username TEXT UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL
      );
    `;
    console.log('Migration completed');
  } catch (error) {
    console.error('Migration failed:', error);
  }
}

main();
