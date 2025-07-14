const pool = require('./db');

async function listArticles() {
  try {
    const result = await pool.query('SELECT id, title, category FROM articles ORDER BY id');
    console.log('Articles in database:');
    result.rows.forEach(article => {
      console.log(`ID: ${article.id}, Category: ${article.category}, Title: ${article.title}`);
    });
    await pool.end();
  } catch (err) {
    console.error('Error listing articles:', err);
  }
}

listArticles(); 