const pool = require('../db');

async function setupDatabase() {
  try {
    // Drop the existing table if it exists
    await pool.query('DROP TABLE IF EXISTS articles');
    
    // Create the articles table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL UNIQUE,
        author VARCHAR(255) NOT NULL,
        articles TEXT NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50) CHECK (category IN ('Coping strategies', 'Education', 'Diagnosis', 'Self care'))
      )
    `);
    
    console.log('Articles table created successfully');
    
  } catch (err) {
    console.error('Error setting up database:', err);
  } finally {
    await pool.end();
  }
}

// Run the setup
setupDatabase(); 