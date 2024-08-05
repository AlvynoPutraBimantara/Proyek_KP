const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
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

printServiceRouter.post("/Print/:filename", (req, res) => {
  const filePath = path.join(excelDir, req.params.filename);
  console.log(`Attempting to print file: ${filePath}`);
  if (fs.existsSync(filePath)) {
    exec(`lp ${filePath}`, (err) => {
      if (err) {
        console.error(`Error printing file: ${err}`);
        return res.status(500).send("Error printing file.");
      }
      res.status(200).send("File sent to printer.");
    });
  } else {
    console.error(`File not found: ${filePath}`);
    res.status(404).send("File not found.");
  }
});

printServiceRouter.post("/Print", (req, res) => {
  const { table, data } = req.body;
  const dbPath = path.join(__dirname, "db.json");

  fs.readFile(dbPath, "utf8", (err, fileData) => {
    if (err) {
      console.error(`Error reading database file: ${err}`);
      return res.status(500).send("Error reading database file.");
    }

    const db = JSON.parse(fileData);

    if (!db[table]) {
      db[table] = [];
    }

    db[table].push(data);

    fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8", (err) => {
      if (err) {
        console.error(`Error writing to database file: ${err}`);
        return res.status(500).send("Error writing to database file.");
      }
      res.status(201).send("Data stored in database.");
    });
  });
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

    const htmlContent = workbook.worksheets
      .map((worksheet) => {
        let html = "<table>";
        worksheet.eachRow((row) => {
          html += "<tr>";
          row.eachCell((cell) => {
            html += `<td>${cell.value}</td>`;
          });
          html += "</tr>";
        });
        html += "</table>";
        return html;
      })
      .join("");

    const browser = await puppeteer.launch({
      executablePath: puppeteer.executablePath(), // Ensure puppeteer uses the correct Chrome executable
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    await page.pdf({ path: pdfPath });
    await browser.close();

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
