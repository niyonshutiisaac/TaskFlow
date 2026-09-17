import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

if (!process.env.DATABASE_URL) {
  console.warn('DATABASE_URL not set. Using in-memory fallback for development.');
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') 
    ? { rejectUnauthorized: false } 
    : false,
  // Neon requires SSL
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('connect', () => {
  console.log('onnected to PostgreSQL');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function initDatabase() {
  if (!process.env.DATABASE_URL) {
    console.log('Skipping DB init - no DATABASE_URL');
    return;
  }

  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 255),
        description TEXT,
        status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
        priority VARCHAR(20) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
    `);
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at DESC);
    `);

    // Trigger for updated_at
    await client.query(`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ language 'plpgsql';
    `);

    await client.query(`
      DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
      CREATE TRIGGER update_tasks_updated_at
        BEFORE UPDATE ON tasks
        FOR EACH ROW
        EXECUTE FUNCTION update_updated_at_column();
    `);

    console.log('Database initialized successfully');

    // Seed data if empty
    const { rows } = await client.query('SELECT COUNT(*) FROM tasks');
    if (parseInt(rows[0].count) === 0) {
      console.log('Seeding initial tasks...');
      await client.query(`
        INSERT INTO tasks (title, description, status, priority) VALUES
        ('Design new landing page', 'Create wireframes and high-fidelity mockups for the Q2 campaign landing page. Include mobile responsive versions.', 'pending', 'high'),
        ('Review pull requests', 'Review and merge pending PRs from the frontend team. Focus on the authentication flow changes.', 'pending', 'medium'),
        ('Update API documentation', 'Document the new task management endpoints and add examples to Postman collection.', 'completed', 'low'),
        ('Fix navigation bug on mobile', 'Users reported that the hamburger menu does not close after selecting an item on iOS devices.', 'pending', 'high'),
        ('Prepare kLab presentation', 'Finalize slides for the Tech Upskill program demo day. Include architecture diagrams.', 'pending', 'medium')
      `);
      console.log('Needed 5 sample tasks');
    }
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  } finally {
    client.release();
  }
}

export async function healthCheck(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch {
    return false;
  }
}
