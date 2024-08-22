const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const ExcelJS = require("exceljs");
const puppeteer = require("puppeteer");

const app = express();
const port = 3006;

app.use(cors()); // Enable CORS for cross-origin requests
app.use(express.json()); // Enable JSON body parsing in Express

// Define directories for storing Excel and PDF files
const excelDir = path.join(__dirname, "excel");
const pdfDir = path.join(__dirname, "pdf");

// Create the directories if they do not exist
if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir);
}

if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}

// Configure Multer storage settings for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, excelDir); // Save files in the 'excel' directory
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); // Name files with a timestamp prefix
  },
});
const upload = multer({ storage }); // Initialize Multer with the defined storage settings

const printServiceRouter = express.Router(); // Create a new router for the print service

(async () => {
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || '/usr/bin/chromium-browser',
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // Cleanup route to remove PDF and .xlsx files, and clear database when the root URL is accessed
  app.get("/", (req, res) => {
    const db2Path = path.join(__dirname, "db2.json");
    const pdfFiles = fs.readdirSync(pdfDir);
    const xlsxFiles = fs.readdirSync(excelDir);

    // Delete all PDF files in the pdfDir
    pdfFiles.forEach((file) => {
      const filePath = path.join(pdfDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("All PDF files have been deleted.");

    // Delete all .xlsx files in the excelDir
    xlsxFiles.forEach((file) => {
      const filePath = path.join(excelDir, file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });
    console.log("All .xlsx files have been deleted.");

    // Clear data in db2.json
    if (fs.existsSync(db2Path)) {
      fs.writeFileSync(db2Path, JSON.stringify({}, null, 2));
      console.log("Data in db2.json has been deleted.");
    }

    res.send("Page refreshed. PDF files, .xlsx files, and data in db2.json have been deleted.");
  });

  // Route to handle file uploads
  printServiceRouter.post("/", upload.single("xlsx"), (req, res) => {
    if (!req.file) {
      return res.status(400).send("No file uploaded."); // Return error if no file is uploaded
    }
    const xlsxUrl = `/excel/${req.file.filename}`; // Construct the file URL
    res.status(201).json({ xlsxUrl }); // Respond with the URL of the uploaded file
  });

  // Route to retrieve a file by filename
  printServiceRouter.get("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath); // Send the file if it exists
    } else {
      res.status(404).send("File not found."); // Return 404 if the file doesn't exist
    }
  });

  // Route to delete a file by filename
  printServiceRouter.delete("/:filename", (req, res) => {
    const filePath = path.join(excelDir, req.params.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); // Delete the file
      res.status(204).send(); // Return 204 No Content
    } else {
      res.status(404).send("File not found."); // Return 404 if the file doesn't exist
    }
  });

  // Route to convert an Excel file to PDF
  printServiceRouter.post("/ConvertToPDF/:filename", async (req, res) => {
    const { filename } = req.params;
    const excelPath = path.join(excelDir, filename);
    const pdfFilename = filename.replace(".xlsx", ".pdf");
    const pdfPath = path.join(pdfDir, pdfFilename);

    if (!fs.existsSync(excelPath)) {
      return res.status(404).send("Excel file not found."); // Return 404 if the Excel file doesn't exist
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

  // Route to store "Print" data into db.json
  printServiceRouter.post("/Print", (req, res) => {
    const { table, data } = req.body; // Destructure table name and data from the request body
    if (!table || !data) {
      return res.status(400).send("Table and data are required."); // Return error if table or data is missing
    }

    try {
      const dbPath = path.join(__dirname, "db.json"); // Path to db.json file
      let db = JSON.parse(fs.readFileSync(dbPath, "utf8")); // Read and parse the existing database

      if (!db[table]) {
        db[table] = []; // Initialize the table if it doesn't exist
      }

      db[table].push(data); // Add the new data to the specified table
      fs.writeFileSync(dbPath, JSON.stringify(db, null, 2)); // Write the updated database back to the file

      res.status(201).send("Data saved successfully."); // Send success response
    } catch (error) {
      console.error("Error saving data:", error); // Log the error
      res.status(500).send("Failed to save data."); // Send error response
    }
  });

  // Route to clean up stored PDF files and Print data
  printServiceRouter.post("/cleanup", async (req, res) => {
    const dbPath = path.join(__dirname, "db2.json");
    const printDbPath = path.join(__dirname, "db.json"); // Path to db.json file
    const pdfFiles = fs.readdirSync(pdfDir); // Read all files in the pdf directory

    try {
      // Delete all PDF files in the pdfDir
      pdfFiles.forEach((file) => {
        const filePath = path.join(pdfDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("All PDF files have been deleted.");

      // Delete all .xlsx files in the excelDir
      const xlsxFiles = fs.readdirSync(excelDir);
      xlsxFiles.forEach((file) => {
        const filePath = path.join(excelDir, file);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      });
      console.log("All .xlsx files have been deleted.");

      // Clear data in db2.json
      if (fs.existsSync(dbPath)) {
        fs.writeFileSync(dbPath, JSON.stringify({}, null, 2));
        console.log("Data in db2.json has been deleted.");
      }

      // Clear data in db.json
      if (fs.existsSync(printDbPath)) {
        fs.writeFileSync(printDbPath, JSON.stringify({}, null, 2));
        console.log("Data in db.json has been deleted.");
      }

      res.send("PDF files, .xlsx files, data in db2.json, and db.json have been deleted.");
    } catch (error) {
      console.error("Error during cleanup:", error);
      res.status(500).send("Failed to perform cleanup.");
    }
  });

  app.use("/print-service", printServiceRouter); // Use the print service router for all '/print-service' routes

  // Serve static files from the 'excel' and 'pdf' directories
  app.use("/excel", express.static(excelDir));
  app.use("/pdf", express.static(pdfDir));

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`); // Start the server and log the URL
  });

  process.on("SIGINT", async () => {
    console.log("Closing browser...");
    await browser.close();
    process.exit();
  });
})();
