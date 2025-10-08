// db.js
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://my_shutle_system_user:JXYVMCldJTUQdQ6ucI154DybYokblMC3@dpg-d3dtai3uibrs73ab41k0-a.oregon-postgres.render.com/my_shutle_system',
  ssl: { rejectUnauthorized: false },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 100000,
});

pool.on('connect', () => console.log('✅ Connected to PostgreSQL with SSL'));
pool.on('error', (err) => console.error('❌ PostgreSQL pool error', err));

module.exports = pool;
