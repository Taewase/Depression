const fs = require('fs');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'depression_system',
  password: '$1998Mowase',
  port: 5432,
});

async function importArticles() {
  try {
    // Sample article data
    const articles = [
      {
        title: 'How To Diagnosis Depression: How To Cope After A Diagnosis',
        author: 'BetterHelp',
        article: 'After receiving a depression diagnosis, you may have more questions about what it means...',
        date: '2022-09-01',
        category: 'Coping strategies'
      },
      {
        title: 'Depression In Older Adults: Can It Develop After Retirement?',
        author: 'BetterHelp',
        article: 'As people age, their physical and mental health conditions begin to deteriorate...',
        date: '2022-09-03',
        category: 'Special Groups'
      },
      {
        title: 'What Should I Know About DSM V Depression?',
        author: 'BetterHelp',
        article: 'DSM and depression are associated with one another, but they're two very different things...',
        date: '2022-09-01',
        category: 'Education'
      }
    ];

    // First clear existing articles
    await pool.query('TRUNCATE articles RESTART IDENTITY');
    console.log('Cleared existing articles');

    // Import each article
    for (const article of articles) {
      await pool.query(
        'INSERT INTO articles (title, author, article, date, category) VALUES ($1, $2, $3, $4, $5)',
        [article.title, article.author, article.article, article.date, article.category]
      );
    }

    console.log('Successfully imported articles');

    // Verify the import
    const result = await pool.query('SELECT COUNT(*) FROM articles');
    console.log(`Total articles in database: ${result.rows[0].count}`);

    await pool.end();
  } catch (err) {
    console.error('Error importing articles:', err);
    process.exit(1);
  }
}

importArticles(); 