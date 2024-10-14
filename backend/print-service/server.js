/* eslint-disable no-unused-vars */
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");
const mysql = require("mysql2/promise");

const app = express();
const port = 3006;
const pool = require('./db');
app.use(cors());
app.use(express.json());

const pdfDir = path.join(__dirname, "pdf");

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

const printServiceRouter = express.Router();

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // MySQL connection
  const connection = await mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: '1234',
    database: 'bukuagenda'
  });

  // Cleanup route to delete PDF files and reset MySQL tables
  app.get("/", async (req, res) => {
    const pdfFiles = fs.readdirSync(pdfDir);

    // Remove all PDF files in pdfDir
    pdfFiles.forEach((file) => {
      const filePath = path.join(pdfDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("All PDF files deleted.");

    // Clean up MySQL tables
    await connection.query("DELETE FROM pdf");
    await connection.query("DELETE FROM print");
    await connection.query("DELETE FROM print2");
    console.log("Data from database cleared.");

    res.send("Cleanup completed: database entries cleared.");
  });

  // Route to upload PDF directly to MySQL
  printServiceRouter.post("/upload-pdf", async (req, res) => {
    const { filename, pdfData } = req.body;
  
    if (!pdfData || !filename) {
      return res.status(400).send("PDF data or filename is missing.");
    }
  
    try {
      // Convert base64 encoded PDF data back to binary
      const pdfBuffer = Buffer.from(pdfData, "base64");
  
      // Create a URL for the PDF file (this could be based on where the files are stored)
      const pdfUrl = `/pdf/${filename}`;
  
      // Store the PDF file in MySQL (bukuagenda.pdf)
      await pool.query(
        "INSERT INTO pdf (filename, file, fileUrl) VALUES (?, ?, ?)",
        [filename, pdfBuffer, pdfUrl]
      );
  
      // Respond with success and the file URL
      res.status(201).json({ message: "PDF stored successfully", fileUrl: pdfUrl });
    } catch (error) {
      console.error("Error storing PDF:", error);
      res.status(500).send("Failed to store PDF.");
    }
  });
  
  // Route to fetch PDF blob from MySQL by filename
  printServiceRouter.get("/pdf/:filename", async (req, res) => {
    const { filename } = req.params;

    try {
      // Fetch the PDF blob from the 'pdf' table
      const [rows] = await pool.query("SELECT file FROM pdf WHERE filename = ?", [filename]);
      
      if (rows.length === 0) {
        return res.status(404).send("PDF not found.");
      }

      // Retrieve the binary file data and send it as a response
      const pdfBlob = rows[0].file;
      res.setHeader("Content-Type", "application/pdf");
      res.send(pdfBlob);
    } catch (error) {
      console.error("Error fetching PDF from database:", error);
      res.status(500).send("Failed to fetch PDF.");
    }
  });

  // Route to save Print data into MySQL (replacing db.json)
  printServiceRouter.post("/Print", async (req, res) => {
    const { table, data } = req.body;
    if (!table || !data) {
      return res.status(400).send("Table and data are required.");
    }

    try {
      // Store Print data in the corresponding MySQL table
      if (table === 'print') {
        await connection.query("INSERT INTO print (fileUrl) VALUES (?)", [data.fileUrl]);
      } else if (table === 'print2') {
        await connection.query("INSERT INTO print2 (fileUrl, originalFile) VALUES (?, ?)", [data.fileUrl, data.originalFile]);
      }
      
      res.status(201).send("Data saved successfully.");
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).send("Failed to save data.");
    }
  });

  // Route to clean up stored PDF and Print data
  printServiceRouter.post("/cleanup", async (req, res) => {
    const pdfFiles = fs.readdirSync(pdfDir);
    try {
      // Remove all PDF files in pdfDir
      pdfFiles.forEach((file) => {
        const filePath = path.join(pdfDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("All PDF files deleted.");

      // Clean up MySQL tables
      await connection.query("DELETE FROM pdf");
      await connection.query("DELETE FROM print");
      await connection.query("DELETE FROM print2");
      console.log("Data from database cleared.");

      res.send("Cleanup completed.");
    } catch (error) {
      console.error("Error during cleanup:", error);
      res.status(500).send("Cleanup failed.");
    }
  });

  app.use("/pdf", express.static(pdfDir));
  app.use("/print-service", printServiceRouter);

  app.listen(port, () => {
    console.log(`Print service running on port ${port}`);
  });
})();
