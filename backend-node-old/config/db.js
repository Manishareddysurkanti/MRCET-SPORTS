const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'college_sports_db',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to check DB connection on startup
const checkConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ MySQL Database connected successfully.');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ MySQL Database connection failed!');
    console.error('Error Details:', error.message);
    console.log('\n👉 Please ensure:');
    console.log('1. MySQL server is running.');
    console.log(`2. Database "${process.env.DB_NAME || 'college_sports_db'}" exists (Run backend/schema.sql)`);
    console.log('3. Credentials in backend/.env are correct.\n');
    return false;
  }
};

module.exports = {
  pool,
  checkConnection
};
