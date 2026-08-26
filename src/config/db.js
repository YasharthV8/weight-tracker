const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // Required for some cloud databases like Neon:
    ssl: { rejectUnauthorized: false } 
});

module.exports = pool;