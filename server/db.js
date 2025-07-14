const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'depression_system',
  password: '$1998Mowase', // Use the password you confirmed works
  port: 5432,
});

module.exports = pool; 