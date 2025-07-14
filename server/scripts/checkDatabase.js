const pool = require('../db');

async function checkDatabase() {
  try {
    const client = await pool.connect();
    
    try {
      // Check if table exists
      const tableCheck = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'articles'
        );
      `);
      
      console.log('\nTable exists:', tableCheck.rows[0].exists);

      if (tableCheck.rows[0].exists) {
        // Get total count
        const countResult = await client.query('SELECT COUNT(*) FROM articles;');
        console.log('\nTotal articles:', countResult.rows[0].count);

        // Get sample data
        const sampleData = await client.query(`
          SELECT title, category, date 
          FROM articles 
          ORDER BY date DESC 
          LIMIT 5;
        `);
        
        console.log('\nLatest 5 articles:');
        sampleData.rows.forEach(row => {
          console.log(`- ${row.title} (${row.category}) - ${row.date}`);
        });

        // Get count by category
        const categoryCount = await client.query(`
          SELECT category, COUNT(*) 
          FROM articles 
          GROUP BY category 
          ORDER BY count DESC;
        `);
        
        console.log('\nArticles by category:');
        categoryCount.rows.forEach(row => {
          console.log(`${row.category}: ${row.count} articles`);
        });
      }

    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error checking database:', err);
  } finally {
    await pool.end();
  }
}

checkDatabase(); 