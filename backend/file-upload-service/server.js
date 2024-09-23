const express = require("express");
const cors = require("cors");
const multer = require("multer");
const mysql = require("mysql2/promise");
require("dotenv").config();

const app = express();
const port = 3005;

app.use(cors());

const storage = multer.memoryStorage(); 
const upload = multer({ storage });

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'mysql',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || '1234',
});

app.post("/uploads", upload.single("pdf"), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      "INSERT INTO Lampiran (filename, data, mimetype) VALUES (?, ?, ?)",
      [req.file.originalname, req.file.buffer, req.file.mimetype]
    );
    connection.release();
    const fileId = result.insertId;
    res.json({ fileId }); // Return the file ID
  } catch (error) {
    console.error("Error storing file:", error);
    res.status(500).send("Internal server error");
  }
});

app.get("/uploads/:id", async (req, res) => {
  const fileId = req.params.id;
  let connection;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM Lampiran WHERE id = ?", [fileId]);

    if (rows.length === 0) {
      res.status(404).send("File not found");
      return;
    }

    const file = rows[0];
    res.setHeader("Content-Type", file.mimetype);
    res.send(file.data);
  } catch (error) {
    console.error("Error retrieving file:", error);
    res.status(500).send("Internal server error");
  } finally {
    if (connection) connection.release();
  }
});



app.listen(port, () => {
  console.log(`File upload service berjalan di-Port port ${port}`);
});
