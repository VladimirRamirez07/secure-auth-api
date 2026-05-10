require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('./database');

const migrate = async () => {
  try {
    console.log('🔄 Running migrations...');
    const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
    await pool.query(sql);
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  }
};

migrate();