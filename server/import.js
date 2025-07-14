const fs = require('fs');
const { parse } = require('csv-parse');
const pool = require('./db');
const path = require('path');

async function importArticles() {
  const records = [];
  const parser = fs
    .createReadStream(path.join(__dirname, 'data', 'articles.csv'))
    .pipe(parse({
      columns: true,
      skip_empty_lines: true
    }));

  for await (const record of parser) {
    records.push(record);
  }

  try {
    for (const record of records) {
      await pool.query(
        'INSERT INTO articles (title, author, article, date, category) VALUES ($1, $2, $3, $4, $5)',
        [record.title, record.author, record.articles, record.date, record.category]
      );
    }
    console.log(`Successfully imported ${records.length} articles`);
    await pool.end();
  } catch (err) {
    console.error('Error importing articles:', err);
    process.exit(1);
  }
}

importArticles(); 