const { Pool } = require('pg');

// First connect to default postgres database to create our database if it doesn't exist
const initialPool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres', // Connect to default database first
  password: '$1998Mowase',
  port: 5432,
});

async function setupDatabase() {
  try {
    // Check if our database exists
    const dbCheckResult = await initialPool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'depression_system'"
    );

    // Create database if it doesn't exist
    if (dbCheckResult.rows.length === 0) {
      console.log('Creating depression_system database...');
      await initialPool.query('CREATE DATABASE depression_system');
    }

    // Close initial connection
    await initialPool.end();

    // Connect to our database
    const appPool = new Pool({
      user: 'postgres',
      host: 'localhost',
      database: 'depression_system',
      password: '$1998Mowase',
      port: 5432,
    });

    // Drop existing table if it exists
    await appPool.query('DROP TABLE IF EXISTS articles');
    console.log('Dropped existing articles table');

    // Create articles table with unique constraint on title
    await appPool.query(`
      CREATE TABLE articles (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL UNIQUE,
        author TEXT NOT NULL,
        article TEXT NOT NULL,
        date DATE NOT NULL,
        category TEXT CHECK (category IN ('Coping strategies', 'Education', 'Diagnosis', 'Self care', 'Special Groups'))
      )
    `);
    console.log('Created articles table with proper constraints');

    await appPool.end();
    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  }
}

setupDatabase(); 