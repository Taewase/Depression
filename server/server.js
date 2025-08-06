// server.js
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const pool = require('./db');
const fetch = require('node-fetch'); // Add at the top with other requires

const app = express();
const JWT_SECRET = 'hGr9ZkdEeU'; // Use a strong secret in production

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

    // Update last_login timestamp
    await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token, user: { name: user.name, email: user.email, phone: user.phone, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Middleware to protect routes
// Get current user's profile
app.get('/profile', authenticateToken, async (req, res) => {
  try {
    const userResult = await pool.query('SELECT id, name, email, phone, role FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password endpoint
app.post('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    // Get user
    const userResult = await pool.query('SELECT id, password_hash FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check current password
    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' });

    // Hash new password
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
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

// Middleware to check admin access
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

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
    const fastApiRes = await fetch('https://fastapi-whd1.onrender.com/predict', {
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

// Store assessment result (for logged-in users)
app.post('/api/assessment-results', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      age,
      gender,
      answers, // array of 20 answers (0/1)
      final_class,
      confidence
    } = req.body;

    if (!age || !gender || !Array.isArray(answers) || answers.length !== 20 || !final_class || confidence === undefined) {
      return res.status(400).json({ error: 'Missing or invalid fields.' });
    }

    // Build the query
    const query = `
      INSERT INTO assessment_results (
        user_id, age, gender,
        q1_answer, q2_answer, q3_answer, q4_answer, q5_answer,
        q6_answer, q7_answer, q8_answer, q9_answer, q10_answer,
        q11_answer, q12_answer, q13_answer, q14_answer, q15_answer,
        q16_answer, q17_answer, q18_answer, q19_answer, q20_answer,
        final_class, confidence
      ) VALUES (
        $1, $2, $3,
        $4, $5, $6, $7, $8, $9, $10, $11, $12, $13,
        $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25
      ) RETURNING id, created_at
    `;
    const values = [
      userId, age, gender,
      ...answers, // must be 20 elements
      final_class, confidence
    ];

    const result = await pool.query(query, values);
    res.status(201).json({ success: true, id: result.rows[0].id, created_at: result.rows[0].created_at });
  } catch (err) {
    console.error('Error saving assessment result:', err);
    res.status(500).json({ error: 'Failed to save assessment result.' });
  }
});

// Get assessment history for logged-in user
app.get('/api/assessment-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const results = await pool.query(`
      SELECT id, age, gender, final_class, confidence, created_at,
             (q1_answer + q2_answer + q3_answer + q4_answer + q5_answer +
              q6_answer + q7_answer + q8_answer + q9_answer + q10_answer +
              q11_answer + q12_answer + q13_answer + q14_answer + q15_answer +
              q16_answer + q17_answer + q18_answer + q19_answer + q20_answer) as total_score
      FROM assessment_results 
      WHERE user_id = $1 
      ORDER BY created_at ASC
    `, [userId]);
    res.json(results.rows);
  } catch (err) {
    console.error('Error fetching assessment history:', err);
    res.status(500).json({ error: 'Failed to fetch assessment history.' });
  }
});

// User Management API Endpoints

// Get all users with pagination and search
app.get('/api/users', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('API request params:', { page, limit, search, status, role });
    
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             CASE WHEN u.last_login IS NOT NULL THEN 'active' ELSE 'inactive' END as status,
             ar.age
      FROM users u
      LEFT JOIN LATERAL (
        SELECT age FROM assessment_results ar2 WHERE ar2.user_id = u.id ORDER BY ar2.created_at DESC LIMIT 1
      ) ar ON true
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      if (status === 'active') {
        query += ` AND u.last_login IS NOT NULL`;
      } else if (status === 'inactive') {
        query += ` AND u.last_login IS NULL`;
      }
    }

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
      console.log(`Role filter applied: role = '${role}'`);
    }

    console.log('Final query:', query);
    console.log('Query params:', params);
    console.log('Param count before pagination:', paramCount);

    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Get paginated results
    paramCount++;
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    console.log('Final query with pagination:', query);
    console.log('Final params:', params);

    const result = await pool.query(query, params);
    
    console.log('Users found:', result.rows.length);
    console.log('Sample user:', result.rows[0]);
    
    res.json({
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user statistics
app.get('/api/users/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `);
    
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get specific user details
app.get('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT id, name, email, phone, role, created_at, last_login,
             CASE WHEN last_login IS NOT NULL THEN 'active' ELSE 'inactive' END as status
      FROM users WHERE id = $1
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Update user (admin only)
app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    const { name, email, phone, role, status } = req.body;
    
    const result = await pool.query(`
      UPDATE users 
      SET name = COALESCE($1, name), 
          email = COALESCE($2, email), 
          phone = COALESCE($3, phone), 
          role = COALESCE($4, role)
      WHERE id = $5 
      RETURNING id, name, email, phone, role, created_at, last_login
    `, [name, email, phone, role, id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user (admin only)
app.delete('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Deactivate user (set last_login to NULL)
app.patch('/api/users/:id/deactivate', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET last_login = NULL WHERE id = $1 RETURNING id, name, email, role',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`User ${result.rows[0].name} deactivated successfully`);
    res.json({ message: 'User deactivated successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: err.message });
  }
});

// Make user admin
app.patch('/api/users/:id/make-admin', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      ['admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    console.log(`User ${result.rows[0].name} made admin successfully`);
    res.json({ message: 'User made admin successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error making user admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get dashboard statistics
// Recent activities endpoint
app.get('/api/recent-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = await pool.query(`
      SELECT 
        id,
        name as user,
        'user_signup' as type,
        'registered' as action,
        created_at as timestamp
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '24 hours'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get recent assessments
    const recentAssessments = await pool.query(`
      SELECT 
        ar.id,
        u.name as user,
        'assessment' as type,
        'completed assessment' as action,
        ar.created_at as timestamp
      FROM assessment_results ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.created_at >= CURRENT_DATE - INTERVAL '24 hours'
      ORDER BY ar.created_at DESC
      LIMIT 10
    `);

    // Get recent article publications (if articles table exists)
    let recentArticles = { rows: [] };
    try {
      recentArticles = await pool.query(`
        SELECT 
          id,
          author as user,
          'article' as type,
          'published new article' as action,
          date as timestamp
        FROM articles 
        WHERE date >= CURRENT_DATE - INTERVAL '24 hours'
        ORDER BY date DESC
        LIMIT 5
      `);
    } catch (err) {
      // Articles table might not exist, ignore this error
      console.log('Articles table not available for recent activity');
    }

    // Combine all activities and sort by timestamp
    const allActivities = [
      ...recentUsers.rows,
      ...recentAssessments.rows,
      ...recentArticles.rows
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Take the most recent 15 activities
    const recentActivity = allActivities.slice(0, 15);

    res.json(recentActivity);
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get assessments with pagination and filters
app.get('/api/assessments', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', final_class = '', gender = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    // Build WHERE conditions
    if (search) {
      paramCount++;
      whereConditions.push(`ar.user_id::text ILIKE $${paramCount}`);
      queryParams.push(`%${search}%`);
    }

    if (final_class) {
      paramCount++;
      whereConditions.push(`ar.final_class = $${paramCount}`);
      queryParams.push(final_class);
    }

    if (gender) {
      paramCount++;
      whereConditions.push(`ar.gender = $${paramCount}`);
      queryParams.push(gender);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM assessment_results ar 
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get assessments with pagination
    paramCount++;
    const assessmentsQuery = `
      SELECT 
        ar.id,
        ar.user_id,
        ar.age,
        ar.gender,
        ar.total_score,
        ar.final_class,
        ar.confidence,
        ar.created_at
      FROM assessment_results ar 
      ${whereClause}
      ORDER BY ar.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    const assessmentsResult = await pool.query(assessmentsQuery, [...queryParams, limit, offset]);

    res.json({
      assessments: assessmentsResult.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching assessments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get user details for specific assessment
app.get('/api/assessments/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    const query = `
      SELECT 
        q1_answer, q2_answer, q3_answer, q4_answer, q5_answer,
        q6_answer, q7_answer, q8_answer, q9_answer, q10_answer,
        q11_answer, q12_answer, q13_answer, q14_answer, q15_answer,
        q16_answer, q17_answer, q18_answer, q19_answer, q20_answer
      FROM assessment_results 
      WHERE user_id = $1 
      ORDER BY created_at DESC 
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Assessment not found' });
    }
  } catch (err) {
    console.error('Error fetching user assessment details:', err);
    res.status(500).json({ error: err.message });
  }
});

// Download single assessment as CSV
app.get('/api/assessments/:id/download', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get assessment data with SRQ-20 questions
    const query = `
      SELECT 
        ar.id, ar.user_id, ar.age, ar.gender, ar.total_score, 
        ar.final_class, ar.confidence, ar.created_at,
        q1_answer, q2_answer, q3_answer, q4_answer, q5_answer,
        q6_answer, q7_answer, q8_answer, q9_answer, q10_answer,
        q11_answer, q12_answer, q13_answer, q14_answer, q15_answer,
        q16_answer, q17_answer, q18_answer, q19_answer, q20_answer
      FROM assessment_results ar
      WHERE ar.id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Assessment not found' });
    }
    
    const assessment = result.rows[0];
    
    // SRQ-20 Questions mapping
    const srqQuestions = {
      q1_answer: "Do you often have headaches?",
      q2_answer: "Is your appetite poor?",
      q3_answer: "Do you sleep badly?",
      q4_answer: "Are you easily frightened?",
      q5_answer: "Do your hands shake?",
      q6_answer: "Do you feel nervous, tense or worried?",
      q7_answer: "Is your digestion poor?",
      q8_answer: "Do you have trouble thinking clearly?",
      q9_answer: "Do you feel unhappy?",
      q10_answer: "Do you cry more than usual?",
      q11_answer: "Do you find it difficult to enjoy your daily activities?",
      q12_answer: "Do you find it difficult to make decisions?",
      q13_answer: "Is your daily work suffering?",
      q14_answer: "Are you unable to play a useful part in life?",
      q15_answer: "Do you lose interest in things?",
      q16_answer: "Do you feel that you are a worthless person?",
      q17_answer: "Has the thought of ending your life been on your mind?",
      q18_answer: "Do you feel tired all the time?",
      q19_answer: "Do you have uncomfortable feelings in your stomach?",
      q20_answer: "Are you easily tired?"
    };
    
    // Create CSV content
    let csvContent = 'Question,Answer\n';
    csvContent += `Assessment ID,${assessment.id}\n`;
    csvContent += `User ID,${assessment.user_id}\n`;
    csvContent += `Age,${assessment.age}\n`;
    csvContent += `Gender,${assessment.gender}\n`;
    csvContent += `Total Score,${assessment.total_score}\n`;
    csvContent += `Final Class,${assessment.final_class}\n`;
    csvContent += `Confidence,${assessment.confidence}%\n`;
    csvContent += `Date,${assessment.created_at}\n\n`;
    
    // Add SRQ-20 questions and answers
    Object.entries(srqQuestions).forEach(([key, question]) => {
      const answer = assessment[key] || 'No';
      csvContent += `"${question}","${answer}"\n`;
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=assessment_${id}.csv`);
    res.send(csvContent);
    
  } catch (err) {
    console.error('Error downloading assessment:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export all assessments as CSV
app.get('/api/assessments/export', authenticateToken, async (req, res) => {
  try {
    const { search = '', final_class = '', gender = '' } = req.query;
    
    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereConditions.push(`ar.user_id::text ILIKE $${paramCount}`);
      queryParams.push(`%${search}%`);
    }

    if (final_class) {
      paramCount++;
      whereConditions.push(`ar.final_class = $${paramCount}`);
      queryParams.push(final_class);
    }

    if (gender) {
      paramCount++;
      whereConditions.push(`ar.gender = $${paramCount}`);
      queryParams.push(gender);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const query = `
      SELECT 
        ar.id, ar.user_id, ar.age, ar.gender, ar.total_score, 
        ar.final_class, ar.confidence, ar.created_at,
        q1_answer, q2_answer, q3_answer, q4_answer, q5_answer,
        q6_answer, q7_answer, q8_answer, q9_answer, q10_answer,
        q11_answer, q12_answer, q13_answer, q14_answer, q15_answer,
        q16_answer, q17_answer, q18_answer, q19_answer, q20_answer
      FROM assessment_results ar
      ${whereClause}
      ORDER BY ar.created_at DESC
    `;
    
    const result = await pool.query(query, queryParams);
    
    // SRQ-20 Questions mapping
    const srqQuestions = {
      q1_answer: "Do you often have headaches?",
      q2_answer: "Is your appetite poor?",
      q3_answer: "Do you sleep badly?",
      q4_answer: "Are you easily frightened?",
      q5_answer: "Do your hands shake?",
      q6_answer: "Do you feel nervous, tense or worried?",
      q7_answer: "Is your digestion poor?",
      q8_answer: "Do you have trouble thinking clearly?",
      q9_answer: "Do you feel unhappy?",
      q10_answer: "Do you cry more than usual?",
      q11_answer: "Do you find it difficult to enjoy your daily activities?",
      q12_answer: "Do you find it difficult to make decisions?",
      q13_answer: "Is your daily work suffering?",
      q14_answer: "Are you unable to play a useful part in life?",
      q15_answer: "Do you lose interest in things?",
      q16_answer: "Do you feel that you are a worthless person?",
      q17_answer: "Has the thought of ending your life been on your mind?",
      q18_answer: "Do you feel tired all the time?",
      q19_answer: "Do you have uncomfortable feelings in your stomach?",
      q20_answer: "Are you easily tired?"
    };
    
    // Create CSV content
    let csvContent = 'Assessment ID,User ID,Age,Gender,Total Score,Final Class,Confidence,Date';
    
    // Add SRQ-20 question headers
    Object.values(srqQuestions).forEach(question => {
      csvContent += `,"${question}"`;
    });
    csvContent += '\n';
    
    // Add data rows
    result.rows.forEach(assessment => {
      csvContent += `${assessment.id},${assessment.user_id},${assessment.age},${assessment.gender},${assessment.total_score},${assessment.final_class},${assessment.confidence}%,${assessment.created_at}`;
      
      // Add SRQ-20 answers
      Object.keys(srqQuestions).forEach(key => {
        const answer = assessment[key] || 'No';
        csvContent += `,"${answer}"`;
      });
      csvContent += '\n';
    });
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=all_assessments.csv');
    res.send(csvContent);
    
  } catch (err) {
    console.error('Error exporting assessments:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { year, month } = req.query;
    
    // Build date filter conditions
    let dateFilter = '';
    let assessmentDateFilter = '';
    let startDate = '';
    let endDate = '';
    
    if (year && month) {
      startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
      endDate = new Date(year, month, 0).toISOString().split('T')[0]; // Last day of the month
      dateFilter = `WHERE created_at >= '${startDate}' AND created_at <= '${endDate} 23:59:59'`;
      assessmentDateFilter = `WHERE created_at >= '${startDate}' AND created_at <= '${endDate} 23:59:59'`;
    }
    
    // Get user statistics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week
      FROM users
      ${dateFilter}
    `);

    // Get assessment statistics
    const assessmentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_assessments,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as assessments_this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as assessments_this_month
      FROM assessment_results
      ${assessmentDateFilter}
    `);

    // Get risk level distribution
    const riskLevelStats = await pool.query(`
      SELECT 
        final_class,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results ${assessmentDateFilter}), 1) as percentage
      FROM assessment_results 
      ${assessmentDateFilter}
      GROUP BY final_class 
      ORDER BY count DESC
    `);

    // Get assessment trends - if filtered by month, show daily data for that month, otherwise show last 30 days
    let trendsQuery;
    if (year && month) {
      trendsQuery = `
        SELECT
          DATE_TRUNC('day', created_at) as day,
          COUNT(*) as assessments
        FROM assessment_results
        WHERE created_at >= '${startDate}' AND created_at <= '${endDate} 23:59:59'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY day
      `;
    } else {
      trendsQuery = `
        SELECT
          DATE_TRUNC('day', created_at) as day,
          COUNT(*) as assessments
        FROM assessment_results
        WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY day
      `;
    }
    const assessmentTrends = await pool.query(trendsQuery);

    // Get demographics data
    const demographicsFilter = assessmentDateFilter ? 
      `${assessmentDateFilter} AND age >= 18` : 
      'WHERE age >= 18';
    
    const demographicsStats = await pool.query(`
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          ELSE '46+'
        END as age_group,
        final_class,
        COUNT(*) as count
      FROM assessment_results 
      ${demographicsFilter}
      GROUP BY age_group, final_class
      ORDER BY age_group, final_class
    `);

    // Calculate percentage changes (comparing current week to previous week)
    const currentWeekAssessments = await pool.query(`
      SELECT COUNT(*) as count FROM assessment_results 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const previousWeekAssessments = await pool.query(`
      SELECT COUNT(*) as count FROM assessment_results 
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days' 
      AND created_at < CURRENT_DATE - INTERVAL '7 days'
    `);

    const currentWeekUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
    `);

    const previousWeekUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days' 
      AND created_at < CURRENT_DATE - INTERVAL '7 days'
    `);

    const userStatsData = userStats.rows[0];
    const assessmentStatsData = assessmentStats.rows[0];
    const currentWeekAssessmentsCount = currentWeekAssessments.rows[0].count;
    const previousWeekAssessmentsCount = previousWeekAssessments.rows[0].count;
    const currentWeekUsersCount = currentWeekUsers.rows[0].count;
    const previousWeekUsersCount = previousWeekUsers.rows[0].count;

    // Calculate percentage changes
    const assessmentChange = previousWeekAssessmentsCount > 0 
      ? ((currentWeekAssessmentsCount - previousWeekAssessmentsCount) / previousWeekAssessmentsCount * 100).toFixed(1)
      : 0;
    
    const userChange = previousWeekUsersCount > 0 
      ? ((currentWeekUsersCount - previousWeekUsersCount) / previousWeekUsersCount * 100).toFixed(1)
      : 0;

    res.json({
      stats: {
        total_users: userStatsData.total_users,
        active_users: userStatsData.active_users,
        inactive_users: userStatsData.inactive_users,
        new_users_week: userStatsData.new_users_week,
        total_assessments: assessmentStatsData.total_assessments,
        assessments_this_week: assessmentStatsData.assessments_this_week,
        assessments_this_month: assessmentStatsData.assessments_this_month,
        user_change: userChange,
        assessment_change: assessmentChange
      },
      riskLevelDistribution: riskLevelStats.rows,
      assessmentTrends: assessmentTrends.rows,
      demographics: demographicsStats.rows
    });
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Dedicated demographics endpoint
app.get('/api/admin/demographics', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    const userResult = await pool.query('SELECT role FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get age distribution
    const ageDistribution = await pool.query(`
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          ELSE '46+'
        END as age_group,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results WHERE age >= 18), 1) as percentage
      FROM assessment_results 
      WHERE age >= 18
      GROUP BY 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          ELSE '46+'
        END
      ORDER BY 
        CASE 
          WHEN CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 45 THEN '36-45'
            ELSE '46+'
          END = '18-25' THEN 1
          WHEN CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 45 THEN '36-45'
            ELSE '46+'
          END = '26-35' THEN 2
          WHEN CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 45 THEN '36-45'
            ELSE '46+'
          END = '36-45' THEN 3
          ELSE 4
        END
    `);

    // Get gender distribution
    const genderDistribution = await pool.query(`
      SELECT 
        CASE 
          WHEN LOWER(gender) IN ('m', 'male') THEN 'Male'
          WHEN LOWER(gender) IN ('f', 'female') THEN 'Female'
          ELSE 'Other'
        END as gender,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results), 1) as percentage
      FROM assessment_results 
      GROUP BY CASE 
        WHEN LOWER(gender) IN ('m', 'male') THEN 'Male'
        WHEN LOWER(gender) IN ('f', 'female') THEN 'Female'
        ELSE 'Other'
      END
      ORDER BY count DESC
    `);

    // Get total users count
    const totalUsers = await pool.query('SELECT COUNT(*) as total FROM users');
    
    // Get average age
    const averageAge = await pool.query('SELECT ROUND(AVG(age), 1) as average FROM assessment_results');
    
    // Get most common age group
    const mostCommonAge = await pool.query(`
      SELECT age_group FROM (
        SELECT 
          CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 45 THEN '36-45'
            ELSE '46+'
          END as age_group,
          COUNT(*) as count
        FROM assessment_results 
        WHERE age >= 18
        GROUP BY age_group
        ORDER BY count DESC
        LIMIT 1
      ) subquery
    `);

    res.json({
      ageDistribution: ageDistribution.rows,
      genderDistribution: genderDistribution.rows,
      summary: {
        totalUsers: parseInt(totalUsers.rows[0].total),
        averageAge: parseFloat(averageAge.rows[0].average) || 0,
        mostCommonAgeGroup: mostCommonAge.rows[0]?.age_group || '26-35'
      }
    });
  } catch (err) {
    console.error('Error fetching demographics:', err);
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// ADMIN-SPECIFIC ENDPOINTS
// ============================================

// Admin Dashboard Stats - matches frontend expectation: /dashboard/stats
// Update this endpoint to properly calculate stats
app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get user statistics
    const userStats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `);

    // Get assessment statistics
    const assessmentStats = await pool.query(`
      SELECT 
        COUNT(*) as total_assessments,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as assessments_this_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as assessments_this_month,
        AVG(total_score) as average_score
      FROM assessment_results
    `);

    // Get article count
    let articleCount = 0;
    try {
      const articleRes = await pool.query('SELECT COUNT(*) as count FROM articles');
      articleCount = parseInt(articleRes.rows[0].count);
    } catch (err) {
      console.log('Articles table not available');
    }

    // Calculate completion rate (assessments per user)
    const completionRate = userStats.rows[0].total_users > 0 
      ? (assessmentStats.rows[0].total_assessments / userStats.rows[0].total_users * 100).toFixed(1)
      : 0;

    // Calculate weekly changes
    const currentWeekAssessments = assessmentStats.rows[0].assessments_this_week;
    const previousWeekAssessments = await pool.query(`
      SELECT COUNT(*) as count FROM assessment_results
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      AND created_at < CURRENT_DATE - INTERVAL '7 days'
    `);
    const prevWeekAssessCount = parseInt(previousWeekAssessments.rows[0].count || 0);
    const assessmentChange = prevWeekAssessCount > 0 
      ? ((currentWeekAssessments - prevWeekAssessCount) / prevWeekAssessCount * 100).toFixed(1)
      : currentWeekAssessments > 0 ? '100.0' : '0.0';

    const currentWeekUsers = userStats.rows[0].new_users_week;
    const previousWeekUsers = await pool.query(`
      SELECT COUNT(*) as count FROM users
      WHERE created_at >= CURRENT_DATE - INTERVAL '14 days'
      AND created_at < CURRENT_DATE - INTERVAL '7 days'
    `);
    const prevWeekUsersCount = parseInt(previousWeekUsers.rows[0].count || 0);
    const userChange = prevWeekUsersCount > 0 
      ? ((currentWeekUsers - prevWeekUsersCount) / prevWeekUsersCount * 100).toFixed(1)
      : currentWeekUsers > 0 ? '100.0' : '0.0';

    // Format response to match frontend expectations
    res.json({
      users: {
        total: parseInt(userStats.rows[0].total_users),
        change: userChange,
        changeType: parseFloat(userChange) >= 0 ? 'positive' : 'negative',
        subtitle: 'Active registered users',
        trend: [10, 20, 30, 40, 50, parseInt(userStats.rows[0].total_users)],
        color: 'blue'
      },
      assessments: {
        total: parseInt(assessmentStats.rows[0].total_assessments),
        change: assessmentChange,
        changeType: parseFloat(assessmentChange) >= 0 ? 'positive' : 'negative',
        subtitle: 'Completed assessments',
        trend: [5, 10, 15, 20, 25, parseInt(assessmentStats.rows[0].total_assessments)],
        color: 'green'
      },
      articles: {
        total: articleCount,
        change: '+0',
        changeType: 'neutral',
        subtitle: 'Published articles',
        trend: [1, 2, 3, 4, 5, articleCount],
        color: 'purple'
      },
      recentAssessments: {
        total: parseInt(assessmentStats.rows[0].assessments_this_week),
        change: assessmentChange,
        changeType: parseFloat(assessmentChange) >= 0 ? 'positive' : 'negative',
        subtitle: 'This week',
        trend: [1, 2, 3, 4, 5, parseInt(assessmentStats.rows[0].assessments_this_week)],
        color: 'orange'
      },
      averageScore: {
        total: parseFloat(assessmentStats.rows[0].average_score || 0).toFixed(1),
        change: '+0.0',
        changeType: 'neutral',
        subtitle: 'Out of 20',
        trend: [5, 6, 7, 8, 9, parseFloat(assessmentStats.rows[0].average_score || 0)],
        color: 'indigo'
      },
      completionRate: {
        total: parseFloat(completionRate),
        change: '+0.0%',
        changeType: 'neutral',
        subtitle: 'Assessment completion',
        trend: [10, 20, 30, 40, 50, parseFloat(completionRate)],
        color: 'green'
      }
    });

  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Users endpoint - matches frontend expectation: /admin/users
app.get('/admin/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             CASE WHEN u.last_login IS NOT NULL THEN 'active' ELSE 'inactive' END as status,
             ar.age
      FROM users u
      LEFT JOIN LATERAL (
        SELECT age FROM assessment_results ar2 WHERE ar2.user_id = u.id ORDER BY ar2.created_at DESC LIMIT 1
      ) ar ON true
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      if (status === 'active') {
        query += ` AND u.last_login IS NOT NULL`;
      } else if (status === 'inactive') {
        query += ` AND u.last_login IS NULL`;
      }
    }

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Get paginated results
    paramCount++;
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    res.json({
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching admin users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Stats endpoint - matches frontend expectation: /api/dashboard/stats
app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `);
    
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error fetching admin stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Assessments endpoint - matches frontend expectation: /api/assessments
app.get('/api/assessments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', final_class = '', gender = '' } = req.query;
    const offset = (page - 1) * limit;

    let whereConditions = [];
    let queryParams = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      whereConditions.push(`(u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
    }

    if (final_class) {
      paramCount++;
      whereConditions.push(`ar.final_class = $${paramCount}`);
      queryParams.push(final_class);
    }

    if (gender) {
      paramCount++;
      whereConditions.push(`ar.gender = $${paramCount}`);
      queryParams.push(gender);
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total 
      FROM assessment_results ar 
      LEFT JOIN users u ON ar.user_id = u.id
      ${whereClause}
    `;
    const countResult = await pool.query(countQuery, queryParams);
    const total = parseInt(countResult.rows[0].total);

    // Get assessments with pagination
    paramCount++;
    const query = `
      SELECT 
        ar.id, ar.user_id, ar.age, ar.gender, ar.total_score, 
        ar.final_class, ar.confidence, ar.created_at,
        u.name as user_name, u.email as user_email
      FROM assessment_results ar
      LEFT JOIN users u ON ar.user_id = u.id
      ${whereClause}
      ORDER BY ar.created_at DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    
    res.json({
      assessments: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalAssessments: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching admin assessments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Demographics endpoint - matches frontend expectation: /api/admin/demographics
app.get('/api/admin/demographics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get age distribution
    const ageDistribution = await pool.query(`
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          ELSE '46+'
        END as age_group,
        COUNT(*) as count
      FROM assessment_results 
      WHERE age >= 18
      GROUP BY age_group
      ORDER BY age_group
    `);

    // Get gender distribution
    const genderDistribution = await pool.query(`
      SELECT 
        gender,
        COUNT(*) as count,
        ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results), 1) as percentage
      FROM assessment_results 
      GROUP BY gender 
      ORDER BY count DESC
    `);

    // Get risk level by demographics
    const riskByDemographics = await pool.query(`
      SELECT 
        CASE 
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          ELSE '46+'
        END as age_group,
        gender,
        final_class,
        COUNT(*) as count
      FROM assessment_results 
      WHERE age >= 18
      GROUP BY age_group, gender, final_class
      ORDER BY age_group, gender, final_class
    `);

    // Get summary statistics
    const totalUsers = await pool.query(`SELECT COUNT(*) as total FROM assessment_results`);
    const averageAge = await pool.query(`SELECT AVG(age) as average FROM assessment_results WHERE age >= 18`);
    const mostCommonAge = await pool.query(`
      SELECT age_group FROM (
        SELECT 
          CASE 
            WHEN age BETWEEN 18 AND 25 THEN '18-25'
            WHEN age BETWEEN 26 AND 35 THEN '26-35'
            WHEN age BETWEEN 36 AND 45 THEN '36-45'
            ELSE '46+'
          END as age_group,
          COUNT(*) as count
        FROM assessment_results 
        WHERE age >= 18
        GROUP BY age_group
        ORDER BY count DESC
        LIMIT 1
      ) subquery
    `);

    res.json({
      ageDistribution: ageDistribution.rows,
      genderDistribution: genderDistribution.rows,
      riskByDemographics: riskByDemographics.rows,
      summary: {
        totalUsers: parseInt(totalUsers.rows[0].total),
        averageAge: parseFloat(averageAge.rows[0].average) || 0,
        mostCommonAgeGroup: mostCommonAge.rows[0]?.age_group || '26-35'
      }
    });
  } catch (err) {
    console.error('Error fetching admin demographics:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Recent Activity endpoint - matches frontend expectation: /admin/recent-activity
app.get('/admin/recent-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Get recent user registrations
    const recentUsers = await pool.query(`
      SELECT 
        id,
        name as user,
        'user' as type,
        'registered' as action,
        created_at as timestamp
      FROM users 
      WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY created_at DESC
      LIMIT 10
    `);

    // Get recent assessments
    const recentAssessments = await pool.query(`
      SELECT 
        ar.id,
        u.name as user,
        'assessment' as type,
        'completed assessment' as action,
        ar.created_at as timestamp
      FROM assessment_results ar
      JOIN users u ON ar.user_id = u.id
      WHERE ar.created_at >= CURRENT_DATE - INTERVAL '7 days'
      ORDER BY ar.created_at DESC
      LIMIT 10
    `);

    // Combine all activities and sort by timestamp
    const allActivities = [
      ...recentUsers.rows,
      ...recentAssessments.rows
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    // Take the most recent 15 activities
    const recentActivity = allActivities.slice(0, 15);

    res.json(recentActivity);
  } catch (err) {
    console.error('Error fetching admin recent activity:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fix the Users.jsx endpoint - it calls /users directly, not /api/users
app.get('/users', authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '', role = '' } = req.query;
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
             CASE WHEN u.last_login IS NOT NULL THEN 'active' ELSE 'inactive' END as status,
             ar.age
      FROM users u
      LEFT JOIN LATERAL (
        SELECT age FROM assessment_results ar2 WHERE ar2.user_id = u.id ORDER BY ar2.created_at DESC LIMIT 1
      ) ar ON true
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (status) {
      if (status === 'active') {
        query += ` AND u.last_login IS NOT NULL`;
      } else if (status === 'inactive') {
        query += ` AND u.last_login IS NULL`;
      }
    }

    if (role) {
      paramCount++;
      query += ` AND u.role = $${paramCount}`;
      params.push(role);
    }

    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const totalUsers = parseInt(countResult.rows[0].count);

    // Get paginated results
    paramCount++;
    query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    res.json({
      users: result.rows,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalUsers / limit),
        totalUsers,
        hasNext: page * limit < totalUsers,
        hasPrev: page > 1
      }
    });
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fix the Users.jsx stats endpoint - it calls /users/stats directly
app.get('/users/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `);
    
    res.json(stats.rows[0]);
  } catch (err) {
    console.error('Error fetching user stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Fix the user management endpoints to work without /api prefix
app.delete('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Prevent admin from deleting themselves
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/users/:id/deactivate', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET last_login = NULL WHERE id = $1 RETURNING id, name, email, role',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User deactivated successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error deactivating user:', err);
    res.status(500).json({ error: err.message });
  }
});

app.patch('/users/:id/make-admin', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      ['admin', id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ message: 'User made admin successfully', user: result.rows[0] });
  } catch (err) {
    console.error('Error making user admin:', err);
    res.status(500).json({ error: err.message });
  }
});

// Admin Dashboard API Endpoints

// Get dashboard statistics
app.get('/api/dashboard/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { year = new Date().getFullYear(), month = new Date().getMonth() + 1 } = req.query;
    
    console.log(`Fetching dashboard stats for ${year}-${month}`);
    
    // Reuse the working user stats query from /api/users/stats
    const userStatsQuery = `
      SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN last_login IS NOT NULL THEN 1 END) as active_users,
        COUNT(CASE WHEN last_login IS NULL THEN 1 END) as inactive_users,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as new_users_week,
        COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as new_users_month
      FROM users
    `;
    const userStatsResult = await pool.query(userStatsQuery);
    const userStats = userStatsResult.rows[0];
    
    // Get assessment stats
    const assessmentStatsQuery = `
      SELECT COUNT(*) as total_assessments
      FROM assessment_results
    `;
    const assessmentStatsResult = await pool.query(assessmentStatsQuery);
    const assessmentStats = assessmentStatsResult.rows[0];
    
    // Get risk level distribution
    const riskLevelQuery = `
      SELECT 
        final_class,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results)), 2) as percentage
      FROM assessment_results
      GROUP BY final_class
      ORDER BY count DESC
    `;
    const riskLevelResult = await pool.query(riskLevelQuery);
    
    // Get assessment trends for the specified month/year
    const trendsQuery = `
      SELECT 
        DATE(created_at) as day,
        COUNT(*) as assessments
      FROM assessment_results
      WHERE EXTRACT(YEAR FROM created_at) = $1 
        AND EXTRACT(MONTH FROM created_at) = $2
      GROUP BY DATE(created_at)
      ORDER BY day
    `;
    const trendsResult = await pool.query(trendsQuery, [year, month]);
    
    // Get demographics data
    const demographicsQuery = `
      SELECT 
        CASE 
          WHEN age < 18 THEN 'Under 18'
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          WHEN age BETWEEN 46 AND 55 THEN '46-55'
          ELSE '55+'
        END as age_group,
        final_class,
        COUNT(*) as count
      FROM assessment_results
      GROUP BY age_group, final_class
      ORDER BY age_group, final_class
    `;
    const demographicsResult = await pool.query(demographicsQuery);
    
    // Calculate percentage changes (simplified - using dummy data for now)
    const responseData = {
      stats: {
        total_users: parseInt(userStats.total_users),
        active_users: parseInt(userStats.active_users),
        new_users_week: parseInt(userStats.new_users_week),
        total_assessments: parseInt(assessmentStats.total_assessments),
        user_change: 5.2, // Placeholder - would need historical data
        assessment_change: 12.8 // Placeholder - would need historical data
      },
      riskLevelDistribution: riskLevelResult.rows,
      assessmentTrends: trendsResult.rows,
      demographics: demographicsResult.rows
    };
    
    console.log('Dashboard stats response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
    
  } catch (err) {
    console.error('Error fetching dashboard stats:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get recent activity
app.get('/api/recent-activity', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Fetching recent activity...');
    
    // Get recent user signups
    const signupsQuery = `
      SELECT 
        'user_signup' as type,
        name as user,
        'signed up' as action,
        created_at as timestamp,
        id
      FROM users
      ORDER BY created_at DESC
      LIMIT 5
    `;
    
    // Get recent assessments
    const assessmentsQuery = `
      SELECT 
        'assessment' as type,
        u.name as user,
        CONCAT('completed assessment (', ar.final_class, ')') as action,
        ar.created_at as timestamp,
        ar.id
      FROM assessment_results ar
      JOIN users u ON ar.user_id = u.id
      ORDER BY ar.created_at DESC
      LIMIT 5
    `;
    
    const [signupsResult, assessmentsResult] = await Promise.all([
      pool.query(signupsQuery),
      pool.query(assessmentsQuery)
    ]);
    
    // Combine and sort by timestamp
    const activities = [
      ...signupsResult.rows,
      ...assessmentsResult.rows
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
     .slice(0, 10); // Get top 10 most recent
    
    console.log('Recent activities found:', activities.length);
    res.json(activities);
    
  } catch (err) {
    console.error('Error fetching recent activity:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get assessments for admin (used by AssessmentPage.jsx)
app.get('/api/assessments', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', final_class = '', gender = '' } = req.query;
    const offset = (page - 1) * limit;
    
    console.log('Fetching assessments with params:', { page, limit, search, final_class, gender });
    
    let query = `
      SELECT ar.*, u.name as user_name, u.email as user_email
      FROM assessment_results ar
      JOIN users u ON ar.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (u.name ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (final_class) {
      paramCount++;
      query += ` AND ar.final_class = $${paramCount}`;
      params.push(final_class);
    }

    if (gender) {
      paramCount++;
      query += ` AND ar.gender = $${paramCount}`;
      params.push(gender);
    }

    // Get total count
    const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(*) FROM');
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    // Get paginated results
    paramCount++;
    query += ` ORDER BY ar.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
    params.push(limit, offset);

    const result = await pool.query(query, params);
    
    console.log('Assessments found:', result.rows.length);
    
    res.json({
      assessments: result.rows,
      total,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit)
    });
  } catch (err) {
    console.error('Error fetching assessments:', err);
    res.status(500).json({ error: err.message });
  }
});

// Get demographics data for admin (used by DemographicsPage.jsx)
app.get('/api/admin/demographics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log('Fetching demographics data...');
    
    // Get age distribution
    const ageQuery = `
      SELECT 
        CASE 
          WHEN age < 18 THEN 'Under 18'
          WHEN age BETWEEN 18 AND 25 THEN '18-25'
          WHEN age BETWEEN 26 AND 35 THEN '26-35'
          WHEN age BETWEEN 36 AND 45 THEN '36-45'
          WHEN age BETWEEN 46 AND 55 THEN '46-55'
          ELSE '55+'
        END as age_group,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results)), 2) as percentage
      FROM assessment_results
      GROUP BY age_group
      ORDER BY 
        CASE 
          WHEN age < 18 THEN 1
          WHEN age BETWEEN 18 AND 25 THEN 2
          WHEN age BETWEEN 26 AND 35 THEN 3
          WHEN age BETWEEN 36 AND 45 THEN 4
          WHEN age BETWEEN 46 AND 55 THEN 5
          ELSE 6
        END
    `;
    
    // Get gender distribution
    const genderQuery = `
      SELECT 
        gender,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results)), 2) as percentage
      FROM assessment_results
      GROUP BY gender
      ORDER BY count DESC
    `;
    
    // Get risk level distribution
    const riskQuery = `
      SELECT 
        final_class,
        COUNT(*) as count,
        ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM assessment_results)), 2) as percentage
      FROM assessment_results
      GROUP BY final_class
      ORDER BY count DESC
    `;
    
    // Get total stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_assessments,
        COUNT(DISTINCT user_id) as unique_users,
        AVG(age) as average_age
      FROM assessment_results
    `;
    
    const [ageResult, genderResult, riskResult, statsResult] = await Promise.all([
      pool.query(ageQuery),
      pool.query(genderQuery),
      pool.query(riskQuery),
      pool.query(statsQuery)
    ]);
    
    const responseData = {
      ageDistribution: ageResult.rows,
      genderDistribution: genderResult.rows,
      riskLevelDistribution: riskResult.rows,
      stats: {
        total_assessments: parseInt(statsResult.rows[0].total_assessments),
        unique_users: parseInt(statsResult.rows[0].unique_users),
        average_age: parseFloat(statsResult.rows[0].average_age).toFixed(1)
      }
    };
    
    console.log('Demographics data response:', JSON.stringify(responseData, null, 2));
    res.json(responseData);
    
  } catch (err) {
    console.error('Error fetching demographics data:', err);
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


