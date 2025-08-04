const { Pool } = require('pg');

const pool = new Pool({
  user: 'neondb_owner',
  password: 'npg_X6xJ5mKjgkLw',
  host: 'ep-plain-fire-ad2oo5x1-pooler.c-2.us-east-1.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  ssl: { rejectUnauthorized: false }
});

module.exports = pool;