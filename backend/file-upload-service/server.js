// D:\Proyek-KP-master\backend\file-upload-service\index.js

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const pool = require("./db");  // Import the pool from db.js

require("dotenv").config();

const app = express();
const port = 3005;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage });

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
    connection.release();  // Release the connection back to the pool
    const fileId = result.insertId;
    res.json({ fileId });
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
  console.log(`File upload service running on port ${port}`);
});
