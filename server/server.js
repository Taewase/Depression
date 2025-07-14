// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./db');
const fetch = require('node-fetch'); // Add at the top with other requires

const app = express();
const JWT_SECRET = '2003'; // Use a strong secret in production

app.use(cors());
app.use(express.json());

// Registration endpoint
app.post('/register', async (req, res) => {
  const { name, email, phone, password } = req.body;
  try {
    const password_hash = await bcrypt.hash(password, 10);
    const result = await pool.query(
      'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone',
      [name, email, phone, password_hash]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login endpoint
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = userResult.rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { name: user.name, email: user.email, phone: user.phone } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to protect routes
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

// Example protected route
app.get('/dashboard-data', authenticateToken, (req, res) => {
  res.json({ message: 'This is protected dashboard data!', user: req.user });
});

// Create articles table if it doesn't exist
const createArticlesTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        author VARCHAR(255) NOT NULL,
        article TEXT NOT NULL,
        date DATE NOT NULL,
        category VARCHAR(50) CHECK (category IN ('Coping strategies', 'Education', 'Diagnosis', 'Self care', 'Special Groups'))
      )
    `);
    console.log('Articles table verified successfully');
  } catch (err) {
    console.error('Error verifying articles table:', err);
  }
};

createArticlesTable();

// Get all unique categories - MUST BE BEFORE THE :id ROUTE
app.get('/api/articles/categories', async (req, res) => {
  try {
    console.log('Fetching categories...');
    const result = await pool.query('SELECT DISTINCT category FROM articles ORDER BY category');
    console.log('Categories found:', result.rows);
    res.json(result.rows.map(row => row.category));
  } catch (err) {
    console.error('Error fetching categories:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get all articles with optional category filter
app.get('/api/articles', async (req, res) => {
  try {
    const { category } = req.query;
    let query = 'SELECT id, title, author, article, date, category FROM articles';
    let values = [];

    if (category) {
      query += ' WHERE category = $1';
      values.push(category);
    }

    query += ' ORDER BY date DESC';
    
    console.log('Executing query:', query, 'with values:', values);
    const result = await pool.query(query, values);
    console.log('Found articles:', result.rows.length);
    res.json(result.rows);
  } catch (err) {
    console.error('Error in /api/articles:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Get a single article by ID - MUST BE AFTER MORE SPECIFIC ROUTES
app.get('/api/articles/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching article with ID:', id);
    const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);
    console.log('Query result:', result.rows);
    
    if (result.rows.length === 0) {
      console.log('No article found with ID:', id);
      return res.status(404).json({ error: 'Article not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error in /api/articles/:id:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Predict endpoint: forwards answers to FastAPI ML service
app.post('/api/predict', async (req, res) => {
  try {
    const { answers } = req.body;
    console.log('Received answers:', answers);
    
    if (!answers || !Array.isArray(answers) || answers.length !== 20) {
      return res.status(400).json({ error: 'Answers must be an array of 20 values.' });
    }

    // Map answers array to FastAPI expected keys
    const fastApiInput = {
      "headache": answers[0],
      "appetite": answers[1],
      "sleep": answers[2],
      "fear": answers[3],
      "shaking": answers[4],
      "nervous": answers[5],
      "digestion": answers[6],
      "troubled": answers[7],
      "unhappy": answers[8],
      "cry": answers[9],
      "enjoyment": answers[10],
      "decisions": answers[11],
      "work": answers[12],
      "play": answers[13],
      "interest": answers[14],
      "worthless": answers[15],
      "suicide": answers[16],
      "tiredness": answers[17],
      "uncomfortable": answers[18],
      "easily_tired": answers[19]
    };
    
    console.log('Sending to FastAPI:', fastApiInput);

    // Forward to FastAPI
    const fastApiRes = await fetch('http://127.0.0.1:8000/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(fastApiInput)
    });
    const fastApiData = await fastApiRes.json();
    console.log('FastAPI response:', fastApiData);
    
    if (!fastApiRes.ok) {
      return res.status(500).json({ error: fastApiData.error || 'ML service error' });
    }
    
    // Filter response to only include final_class and confidence as requested
    const filteredResponse = {
      final_class: fastApiData.final_class,
      confidence: fastApiData.confidence
    };
    
    console.log('Filtered response:', filteredResponse);
    
    // Return filtered response to frontend
    res.json(filteredResponse);
  } catch (err) {
    console.error('Error in /api/predict:', err);
    res.status(500).json({ error: err.message });
  }
});
// TODO: Update the frontend to call /api/predict instead of the old ML API URL

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});