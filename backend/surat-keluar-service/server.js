/* eslint-disable no-unused-vars */
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./db");  // Import the connection pool from db.js

const app = express();
const port = 3004;

app.use(cors());
app.use(bodyParser.json());
require("dotenv").config();

// Generate a random 4-character ID
function generateId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// GET all records from suratkeluar
app.get("/SuratKeluar", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM suratkeluar");
    res.json(rows);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
});

// GET a single record by id
app.get("/SuratKeluar/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [rows] = await db.query("SELECT * FROM suratkeluar WHERE id = ?", [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send("Internal server error");
  }
});

// POST a new record into suratkeluar
app.post("/SuratKeluar", async (req, res) => {
  const data = req.body;
  const newId = generateId();  // Generate new ID

  try {
    const [result] = await db.query(
      `INSERT INTO suratkeluar (
        id, suratDari, tanggalSurat, noSurat, perihal, diterimaTanggal, noAgenda, 
        sifat, disposisiSekretaris, disposisiKasumpeg, tanggalDisposisi, pdfUrl, bulan, tahun
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newId,
        data.suratDari,
        data.tanggalSurat,
        data.noSurat,
        data.perihal,
        data.diterimaTanggal,
        data.noAgenda,
        data.sifat,
        data.disposisiSekretaris,
        data.disposisiKasumpeg,
        data.tanggalDisposisi,
        data.pdfUrl, 
        data.bulan,
        data.tahun
      ]
    );
    res.status(201).json({ id: newId });
  } catch (error) {
    console.error("Error inserting data:", error);
    res.status(500).send("Internal server error");
  }
});

// PUT (update) a record by id
app.put("/SuratKeluar/:id", async (req, res) => {
  const data = req.body;
  const id = req.params.id;
  try {
    const [result] = await db.query(
      `UPDATE suratkeluar SET 
        suratDari = ?, 
        tanggalSurat = ?, 
        noSurat = ?, 
        perihal = ?, 
        diterimaTanggal = ?, 
        noAgenda = ?, 
        sifat = ?, 
        disposisiSekretaris = ?, 
        disposisiKasumpeg = ?, 
        tanggalDisposisi = ?, 
        pdfUrl = ?, 
        bulan = ?, 
        tahun = ?
      WHERE id = ?`,
      [
        data.suratDari,
        data.tanggalSurat,
        data.noSurat,
        data.perihal,
        data.diterimaTanggal,
        data.noAgenda,
        data.sifat,
        data.disposisiSekretaris,
        data.disposisiKasumpeg,
        data.tanggalDisposisi,
        data.pdfUrl,
        data.bulan,
        data.tahun,
        id
      ]
    );
    if (result.affectedRows > 0) {
      res.status(200).json({ id, ...data });
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    console.error("Error updating data:", error);
    res.status(500).send("Internal server error");
  }
});

// DELETE a record by id
app.delete("/SuratKeluar/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await db.query("DELETE FROM suratkeluar WHERE id = ?", [id]);
    if (result.affectedRows > 0) {
      res.status(200).send("Data deleted");
    } else {
      res.status(404).send("Data not found");
    }
  } catch (error) {
    console.error("Error deleting data:", error);
    res.status(500).send("Internal server error");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Surat Keluar service running on port ${port}`);
});
