const fs = require('fs');
const { parse } = require('csv-parse');
const path = require('path');
const pool = require('../db');

// Function to validate category
const validateCategory = (category) => {
  const validCategories = ['Coping strategies', 'Education', 'Diagnosis', 'Self care', 'Special Groups'];
  return validCategories.includes(category.trim());
};

// Function to parse date
const parseDate = (dateStr) => {
  const date = new Date(dateStr);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
};

async function importArticles() {
  try {
    // Create a read stream for the CSV file
    const csvFilePath = path.join(__dirname, '../data/articles.csv');
    console.log('Looking for CSV file at:', csvFilePath);
    
    if (!fs.existsSync(csvFilePath)) {
      console.error('CSV file not found at:', csvFilePath);
      process.exit(1);
    }
    
    const fileStream = fs.createReadStream(csvFilePath);
    
    // Connect to the database
    console.log('Connecting to database...');
    const client = await pool.connect();
    console.log('Connected to database successfully');
    
    try {
      // Begin transaction
      await client.query('BEGIN');
      console.log('Started database transaction');
      
      // Create parser
      const parser = fileStream.pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }));
      
      let importCount = 0;
      let skipCount = 0;
      
      // Process each record
      for await (const record of parser) {
        // Validate category
        if (!validateCategory(record.category)) {
          console.warn(`Skipping record with invalid category: ${record.title} (${record.category})`);
          skipCount++;
          continue;
        }

        // Parse and validate date
        let date;
        try {
          date = parseDate(record.date);
        } catch (e) {
          console.warn(`Invalid date format for record: ${record.title}, using current date`);
          date = new Date().toISOString().split('T')[0]; // Use current date as fallback
        }

        // Insert record
        const query = `
          INSERT INTO articles (title, author, article, date, category)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (title) DO UPDATE SET
            author = EXCLUDED.author,
            article = EXCLUDED.article,
            date = EXCLUDED.date,
            category = EXCLUDED.category
        `;

        await client.query(query, [
          record.title,
          record.author,
          record.article || record.articles, // Handle both column names
          date,
          record.category.trim()
        ]);

        console.log(`Imported: ${record.title}`);
        importCount++;
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log(`Import completed successfully!`);
      console.log(`Imported ${importCount} articles`);
      console.log(`Skipped ${skipCount} articles due to invalid categories`);

    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error during import, rolling back:', err);
      throw err;
    } finally {
      client.release();
    }

  } catch (err) {
    console.error('Fatal error:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run the import
importArticles(); 