const pool = require('./db');

async function cleanupArticles() {
  try {
    await pool.query('DELETE FROM articles');
    console.log('Successfully deleted all articles from the database');
    await pool.end();
  } catch (err) {
    console.error('Error cleaning up articles:', err);
  }
}

cleanupArticles(); 