const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");

const app = express();
const port = 3006;

app.use(cors());
app.use(express.json());

const excelDir = path.join(__dirname, "excel");
const pdfDir = path.join(__dirname, "pdf");

if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir);
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

const printServiceRouter = express.Router();




(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  printServiceRouter.post("/", upload.single("xlsx"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const xlsxUrl = `/excel/${req.file.filename}`;
    res.status(201).json({ xlsxUrl });
  });

  printServiceRouter.get("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found.");
    }
  });

  printServiceRouter.delete("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.status(204).send();
    } else {
      res.status(404).send("File not found.");
    }
  });

  printServiceRouter.post("/ConvertToPDF/:filename", async (req, res) => {
    const { filename } = req.params;
    const excelPath = path.join(excelDir, filename);
    const pdfFilename = filename.replace(".xlsx", ".pdf");
    const pdfPath = path.join(pdfDir, pdfFilename);

    if (!fs.existsSync(excelPath)) {
      return res.status(404).send("Excel file not found.");
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
              word-wrap: break-word; /* Ensures text wraps within the cell */
              white-space: normal;   /* Ensures text wraps within the cell */
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
      await page.close();

      // Save the PDF URL to the database
      const dbPath = path.join(__dirname, "db2.json");
      let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      if (!db.PDF) {
        db.PDF = [];
      }

      db.PDF.push({ fileUrl: `/pdf/${pdfFilename}`, originalFile: filename });

      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      res.json({ pdfUrl: `/pdf/${pdfFilename}` });
    } catch (error) {
      console.error("Error converting Excel to PDF:", error);
      res.status(500).send("Failed to convert the file to PDF.");
    }
  });

  printServiceRouter.post("/Print", (req, res) => {
    const { table, data } = req.body;
    if (!table || !data) {
      return res.status(400).send("Table and data are required.");
    }

    try {
      const dbPath = path.join(__dirname, "db2.json");
      let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

      if (!db[table]) {
        db[table] = [];
      }

      db[table].push(data);
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

      res.status(201).send("Data saved successfully.");
    } catch (error) {
      console.error("Error saving data:", error);
      res.status(500).send("Failed to save data.");
    }
  });

  printServiceRouter.post("/cleanup", async (req, res) => {
    const dbPath = path.join(__dirname, "db2.json");
    let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    if (db.PDF && db.PDF.length > 0) {
      db.PDF.forEach((record) => {
        const pdfFilePath = path.join(__dirname, record.fileUrl);
        const excelFilePath = path.join(excelDir, record.originalFile);

        if (fs.existsSync(pdfFilePath)) {
          fs.unlinkSync(pdfFilePath);
        }

        if (fs.existsSync(excelFilePath)) {
          fs.unlinkSync(excelFilePath);
        }
      });
      db.PDF = [];
    }

    if (db.Print && db.Print.length > 0) {
      db.Print.forEach((record) => {
        const fileUrl = record.fileUrl;
        if (fileUrl) {
          const excelFilePath = path.join(excelDir, fileUrl.split("/").pop());
          if (fs.existsSync(excelFilePath)) {
            fs.unlinkSync(excelFilePath);
          }
        }
      });
      db.Print = [];
    }

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.status(200).send("Cleanup completed.");
  });

  app.use("/excel", express.static(path.join(__dirname, "excel")));
  app.use("/pdf", express.static(path.join(__dirname, "pdf")));
  app.use("/print-service", printServiceRouter);

  app.listen(port, () => {
    console.log(`Print service running on port ${port}`);
  });
})().catch(error => {
  console.error('Failed to start service:', error);
});
