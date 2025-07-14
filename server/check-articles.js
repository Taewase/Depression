const pool = require('./db');

async function checkArticles() {
  try {
    // Get total count
    const countResult = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`Total articles in database: ${countResult.rows[0].count}`);

    // Get count by category
    const categoryResult = await pool.query(`
      SELECT category, COUNT(*) 
      FROM articles 
      GROUP BY category 
      ORDER BY category
    `);
    console.log('\nArticles by category:');
    categoryResult.rows.forEach(row => {
      console.log(`${row.category}: ${row.count} articles`);
    });

    // Get sample articles
    const sampleResult = await pool.query(`
      SELECT id, title, author, category, date
      FROM articles
      ORDER BY date DESC
      LIMIT 5
    `);
    console.log('\nSample of latest articles:');
    sampleResult.rows.forEach(row => {
      console.log(`\nID: ${row.id}`);
      console.log(`Title: ${row.title}`);
      console.log(`Author: ${row.author}`);
      console.log(`Category: ${row.category}`);
      console.log(`Date: ${row.date}`);
    });

  } catch (err) {
    console.error('Error checking articles:', err);
  } finally {
    await pool.end();
  }
}

checkArticles(); 