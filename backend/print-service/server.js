const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");
const mysql = require("mysql2/promise");

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

  // MySQL connection
  const connection = await mysql.createConnection({
    host: 'mysql',
    user: 'root',
    password: '1234',
    database: 'bukuagenda'
  });

  // Cleanup route to delete PDF, Excel files, and reset MySQL tables
  app.get("/", async (req, res) => {
    const pdfFiles = fs.readdirSync(pdfDir);
    const xlsxFiles = fs.readdirSync(excelDir);

    // Remove all PDF files in pdfDir
    pdfFiles.forEach((file) => {
      const filePath = path.join(pdfDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("All PDF files deleted.");

    // Remove all .xlsx files in excelDir
    xlsxFiles.forEach((file) => {
      const filePath = path.join(excelDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("All .xlsx files deleted.");

    // Clean up MySQL tables
    await connection.query("DELETE FROM excel");
    await connection.query("DELETE FROM pdf");
    await connection.query("DELETE FROM print");
    await connection.query("DELETE FROM print2");
    console.log("Data from database cleared.");

    res.send("Cleanup completed: database entries cleared.");
  });

  // Route for file upload
  printServiceRouter.post("/", upload.single("xlsx"), async (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded.");
    }
    const xlsxUrl = `/excel/${req.file.filename}`;
    const xlsxData = fs.readFileSync(req.file.path);

    // Store the Excel file in MySQL (bukuagenda.excel)
    await connection.query(
      "INSERT INTO excel (filename, file) VALUES (?, ?)",
      [req.file.filename, xlsxData]
    );

 // Store the Excel file URL in the print table
 await connection.query("INSERT INTO print (fileUrl) VALUES (?)", [xlsxUrl]);

    res.status(201).json({ xlsxUrl });
  });

  // Route to fetch file by filename
  printServiceRouter.get("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).send("File not found.");
    }
  });

  // Route to delete file by filename
  printServiceRouter.delete("/:filename", async (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      await connection.query("DELETE FROM excel WHERE filename = ?", [req.params.filename]);
      res.status(204).send();
    } else {
      res.status(404).send("File not found.");
    }
  });

  // Route to convert Excel to PDF
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

      const pdfData = fs.readFileSync(pdfPath);

      // Store the PDF file in MySQL (bukuagenda.pdf)
      await connection.query(
        "INSERT INTO pdf (filename, file, original_filename) VALUES (?, ?, ?)",
        [pdfFilename, pdfData, filename]
      );

      // Store the PDF file URL and original Excel file in the print2 table
      const pdfUrl = `/pdf/${pdfFilename}`;
      await connection.query(
        "INSERT INTO print2 (fileUrl, originalFile) VALUES (?, ?)",
        [pdfUrl, filename]
      );
      
      res.json({ pdfUrl: `/pdf/${pdfFilename}` });
    } catch (error) {
      console.error("Error converting Excel to PDF:", error);
      res.status(500).send("Failed to convert file to PDF.");
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

      // Remove all Excel files in excelDir
      const xlsxFiles = fs.readdirSync(excelDir);
      xlsxFiles.forEach((file) => {
        const filePath = path.join(excelDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("All Excel files deleted.");

      // Clean up MySQL tables
      await connection.query("DELETE FROM excel");
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

  app.use("/excel", express.static(excelDir));
  app.use("/pdf", express.static(pdfDir));
  app.use("/print-service", printServiceRouter);

  app.listen(port, () => {
    console.log(`Print service running on port ${port}`);
  });
})();