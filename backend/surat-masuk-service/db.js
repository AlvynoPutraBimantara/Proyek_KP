const mysql = require('mysql2');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'panigale',
  database: process.env.DB_NAME || 'bukuagenda',
  connectionLimit: 10,
  waitForConnections: true,
  queueLimit: 0
});

pool.on('error', (err) => {
  console.error('MySQL Pool Error:', err.message);
});

pool.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
  } else {
    console.log('Connected to MySQL');
    connection.release();
  }
});

module.exports = pool.promise();
