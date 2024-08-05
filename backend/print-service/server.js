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
            font-size: 10pt;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          th, td {
            border: 1px solid black;
            padding: 5px;
            text-align: center;
            word-wrap: break-word;
            white-space: normal;
            overflow: hidden;
          }
          th {
            background-color: #9DC3E6;
            font-weight: bold;
            font-size: 12pt;
          }
          .header {
            font-size: 22pt;
            font-weight: bold;
            text-align: center;
            margin-bottom: 20px;
          }
          .sub-header {
            background-color: #FFFF00; /* Yellow background for sub-header */
            font-weight: bold;
            font-size: 12pt;
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
          htmlContent += `<th>${cell.value}</th>`;
        });
        htmlContent += "</tr>";
      } else if (rowNumber === 5) {
        htmlContent += "<tr class='sub-header'>";
        row.eachCell((cell) => {
          htmlContent += `<td>${cell.value}</td>`;
        });
        htmlContent += "</tr>";
      } else {
        htmlContent += "<tr>";
        row.eachCell((cell) => {
          htmlContent += `<td>${cell.value}</td>`;
        });
        htmlContent += "</tr>";
      }
    });

    htmlContent += "</table></body></html>";

    const browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(),
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({
      path: pdfPath,
      format: "legal", // Set to legal paper size
      printBackground: true,
      landscape: true, // Set to landscape orientation
    });
    await browser.close();

    // Save the PDF URL to the database
    const dbPath = path.join(__dirname, "db2.json");
    let db = JSON.parse(fs.readFileSync(dbPath, "utf8"));

    if (!db.PDF) {
      db.PDF = [];
    }

    db.PDF.push({ fileUrl: `/pdf/${pdfFilename}` });

    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));

    res.json({ pdfUrl: `/pdf/${pdfFilename}` });
  } catch (error) {
    console.error("Error converting Excel to PDF:", error);
    res.status(500).send("Failed to convert the file to PDF.");
  }
});



app.use('/excel', express.static(path.join(__dirname, 'excel')));
app.use('/pdf', express.static(path.join(__dirname, 'pdf')));
app.use('/print-service', printServiceRouter);

app.listen(port, () => {
  console.log(`Print service running on port ${port}`);
});
