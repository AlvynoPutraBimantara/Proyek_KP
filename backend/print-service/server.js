const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");

const app = express();
const port = 3006;

app.use(cors()); // Mengaktifkan CORS untuk permintaan lintas asal
app.use(express.json()); // Mengaktifkan parsing body JSON di Express

// Mendefinisikan direktori untuk menyimpan file Excel dan PDF
const excelDir = path.join(__dirname, "excel");
const pdfDir = path.join(__dirname, "pdf");

// Membuat direktori jika belum ada
if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir);
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

// Mengonfigurasi pengaturan penyimpanan Multer untuk unggahan file
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelDir); // Menyimpan file di direktori 'excel'
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Menamai file dengan awalan timestamp
  },
});
const upload = multer({ storage }); // Menginisialisasi Multer dengan pengaturan penyimpanan yang ditentukan

const printServiceRouter = express.Router(); // Membuat router baru untuk layanan cetak

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Rute pembersihan untuk menghapus file PDF dan .xlsx, serta mengosongkan database saat URL root diakses
  app.get("/", (req, res) => {
    const db2Path = path.join(__dirname, "db2.json");
    const pdfFiles = fs.readdirSync(pdfDir);
    const xlsxFiles = fs.readdirSync(excelDir);

    // Menghapus semua file PDF di pdfDir
    pdfFiles.forEach((file) => {
      const filePath = path.join(pdfDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("Semua file PDF telah dihapus.");

    // Menghapus semua file .xlsx di excelDir
    xlsxFiles.forEach((file) => {
      const filePath = path.join(excelDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("Semua file .xlsx telah dihapus.");

    // Mengosongkan data di db2.json
    if (fs.existsSync(db2Path)) {
      fs.writeFileSync(db2Path, JSON.stringify({}, null, 2));
      console.log("Data di db2.json telah dihapus.");
    }

    res.send("Halaman diperbarui. File PDF, file .xlsx, dan data di db2.json telah dihapus.");
  });

  // Rute untuk menangani unggahan file
  printServiceRouter.post("/", upload.single("xlsx"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("Tidak ada file yang diunggah."); // Mengembalikan kesalahan jika tidak ada file yang diunggah
    }
    const xlsxUrl = `/excel/${req.file.filename}`; // Membuat URL file
    res.status(201).json({ xlsxUrl }); // Menanggapi dengan URL file yang diunggah
  });

  // Rute untuk mengambil file berdasarkan nama file
  printServiceRouter.get("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath); // Mengirim file jika ada
    } else {
      res.status(404).send("File tidak ditemukan."); // Mengembalikan 404 jika file tidak ada
    }
  });

  // Rute untuk menghapus file berdasarkan nama file
  printServiceRouter.delete("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Menghapus file
      res.status(204).send(); // Mengembalikan 204 No Content
    } else {
      res.status(404).send("File tidak ditemukan."); // Mengembalikan 404 jika file tidak ada
    }
  });

  // Rute untuk mengonversi file Excel ke PDF
  printServiceRouter.post("/ConvertToPDF/:filename", async (req, res) => {
    const { filename } = req.params;
    const excelPath = path.join(excelDir, filename);
    const pdfFilename = filename.replace(".xlsx", ".pdf");
    const pdfPath = path.join(pdfDir, pdfFilename);

    if (!fs.existsSync(excelPath)) {
      return res.status(404).send("File Excel tidak ditemukan."); // Mengembalikan 404 jika file Excel tidak ada
    }

    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(excelPath);
      const worksheet = workbook.getWorksheet(1);

      let htmlContent = `
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
            }
            table {
              width: 100%;
              border-collapse: collapse;
            }
            th, td {
              border: 1px solid black;
              padding: 5px;
              text-align: center;
              word-wrap: break-word;
              white-space: normal;
              overflow: hidden;
              font-size: 10px;
            }
            th {
              background-color: #9DC3E6;
              font-weight: bold;
              font-size: 12px;
            }
            .header {
              font-size: 22px;
              font-weight: bold;
              text-align: center;
              margin-bottom: 20px;
            }
            .sub-header {
              background-color: #FFFF00;
              font-weight: bold;
              font-size: 12px;
              text-align: center;
            }
          </style>
        </head>
        <body>
      `;

      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1 || rowNumber === 2) {
          htmlContent += `<div class="header">${row.getCell(2).value}</div>`;
        } else if (rowNumber === 4) {
          htmlContent += "<table><tr>";
          row.eachCell((cell) => {
            htmlContent += `<th class="column">${cell.value}</th>`;
          });
          htmlContent += "</tr>";
        } else if (rowNumber === 5) {
          htmlContent += "<tr class='sub-header'>";
          row.eachCell((cell) => {
            htmlContent += `<td class="column">${cell.value}</td>`;
          });
          htmlContent += "</tr>";
        } else {
          htmlContent += "<tr>";
          row.eachCell((cell) => {
            htmlContent += `<td class="column">${cell.value}</td>`;
          });
          htmlContent += "</tr>";
        }
      });

      htmlContent += "</table></body></html>";

      const page = await browser.newPage();
      await page.setContent(htmlContent);
      await page.pdf({
        path: pdfPath,
        format: "legal",
        printBackground: true,
        landscape: true,
      });

      // Menyimpan URL PDF ke database
      const dbPath = path.join(__dirname, "db2.json");
      let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      if (!db.PDF) {
        db.PDF = [];
      }

      db.PDF.push({ fileUrl: `/pdf/${pdfFilename}`, originalFile: filename });

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      res.json({ pdfUrl: `/pdf/${pdfFilename}` });
    } catch (error) {
      console.error("Kesalahan mengonversi Excel ke PDF:", error);
      res.status(500).send("Gagal mengonversi file ke PDF.");
    }
  });

  // Rute untuk menyimpan data "Print" ke dalam db.json
  printServiceRouter.post("/Print", (req, res) => {
    const { table, data } = req.body; // Mengambil nama tabel dan data dari body permintaan
    if (!table || !data) {
      return res.status(400).send("Tabel dan data diperlukan."); // Mengembalikan kesalahan jika tabel atau data hilang
    }

    try {
      const dbPath = path.join(__dirname, "db.json"); // Path ke file db.json
      let db = JSON.parse(fs.readFileSync(dbPath, "utf8")); // Membaca dan memparsing database yang ada

      if (!db[table]) {
        db[table] = []; // Menginisialisasi tabel jika belum ada
      }

      db[table].push(data); // Menambahkan data baru ke tabel yang ditentukan
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); // Menulis database yang diperbarui kembali ke file

      res.status(201).send("Data berhasil disimpan."); // Mengirim respons sukses
    } catch (error) {
      console.error("Kesalahan menyimpan data:", error); // Mencatat kesalahan
      res.status(500).send("Gagal menyimpan data."); // Mengirim respons kesalahan
    }
  });

  // Rute untuk membersihkan file PDF yang disimpan dan data Print
  printServiceRouter.post("/cleanup", async (req, res) => {
    const dbPath = path.join(__dirname, "db2.json");
    const printDbPath = path.join(__dirname, "db.json"); // Path ke file db.json
    const pdfFiles = fs.readdirSync(pdfDir); // Membaca semua file di direktori pdf

    try {
      // Menghapus semua file PDF di pdfDir
      pdfFiles.forEach((file) => {
        const filePath = path.join(pdfDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("Semua file PDF telah dihapus.");

      // Menghapus semua file .xlsx di excelDir
      const xlsxFiles = fs.readdirSync(excelDir);
      xlsxFiles.forEach((file) => {
        const filePath = path.join(excelDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("Semua file .xlsx telah dihapus.");

      // Mengosongkan data di db2.json
      if (fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
        console.log("Data di db2.json telah dihapus.");
      }

      // Mengosongkan data di db.json
      if (fs.existsSync(printDbPath)) {
        fs.writeFileSync(printDbPath, JSON.stringify({}, null, 2));
        console.log("Data di db.json telah dihapus.");
      }

      res.send("File PDF, file .xlsx, data di db2.json, dan db.json telah dihapus.");
    } catch (error) {
      console.error("Kesalahan selama pembersihan:", error);
      res.status(500).send("Gagal melakukan pembersihan.");
    }
  });

  app.use("/print-service", printServiceRouter); // Menggunakan router layanan cetak untuk semua rute '/print-service'

  // Menyajikan file statis dari direktori 'excel' dan 'pdf'
  app.use("/excel", express.static(excelDir));
  app.use("/pdf", express.static(pdfDir));

  app.listen(port, () => {
    console.log(`service berjalan di-Port http://localhost:${port}`); // Memulai server dan mencatat URL
  });

  process.on("SIGINT", async () => {
    console.log("Menutup browser...");
    await browser.close();
    process.exit();
  });
})();
