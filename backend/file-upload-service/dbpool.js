const mysql = require('mysql2/promise');

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',    // Database host, default to 'localhost'
  user: process.env.DB_USER || 'root',         // MySQL user, default to 'root'
  password: process.env.DB_PASSWORD || '1234', // MySQL password
  database: process.env.DB_NAME || 'bukuagenda', // Database name
  waitForConnections: true,                    // Wait for connections if pool is busy
  connectionLimit: 10,                         // Limit on concurrent connections in the pool
  queueLimit: 0                                // No limit on connection requests
});

module.exports = pool;
