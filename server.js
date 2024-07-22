const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const multer = require("multer");

const app = express();
const port = 3001;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Welcome to my server!");
});

const dbFilePath = path.join(__dirname, "db.json");
const uploadsDir = path.join(__dirname, "uploads");



if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


const getData = () => {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = {
      SuratMasuk: [],
      SuratKeluar: [],
      User: [],
      
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
};

const saveData = (data) =>
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

const formatDateString = (dateString) => {
  const [day, month, year] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });


app.post("/uploads", upload.single("pdf"), (req, res) => {
  if (!req.file) {
    return res.status(400).send("No file uploaded.");
  }
  const pdfUrl = `/uploads/${req.file.filename}`;
  res.status(201).json({ pdfUrl });
});


app.get("/User", (req, res) => {
  const data = getData();
  res.json(data.User);
});

app.get("/User/:id", (req, res) => {
  const data = getData();
  const user = data.User.find((u) => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});

app.put("/User/:id", (req, res) => {
  const data = getData();
  const userIndex = data.User.findIndex((u) => u.id === parseInt(req.params.id));
  if (userIndex !== -1) {
    data.User[userIndex] = req.body;
    saveData(data);
    res.status(200).json(data.User[userIndex]);
  } else {
    res.status(404).send("User not found");
  }
});

app.get("/SuratMasuk", (req, res) => {
  const data = getData();
  res.json(data.SuratMasuk);
});

app.post("/SuratMasuk", (req, res) => {
  const data = getData();
  const newProduct = req.body;
  newProduct.id = data.SuratMasuk.length ? data.SuratMasuk[data.SuratMasuk.length - 1].id + 1 : 1;


  newProduct.tanggalSurat = formatDateString(newProduct.tanggalSurat);
  newProduct.diterimaTanggal = formatDateString(newProduct.diterimaTanggal);
  newProduct.tanggalDisposisi = formatDateString(newProduct.tanggalDisposisi);

  data.SuratMasuk.push(newProduct);
  saveData(data);
  res.status(201).json(newProduct);
});

app.put("/SuratMasuk/:id", (req, res) => {
  const data = getData();
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;
  const productIndex = data.SuratMasuk.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    data.SuratMasuk[productIndex] = updatedProduct;
    saveData(data);
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).send("Product not found");
  }
});

app.get("/SuratKeluar", (req, res) => {
  const data = getData();
  res.json(data.SuratMasuk);
});

app.post("/SuratKeluar", (req, res) => {
  const data = getData();
  const newProduct = req.body;
  newProduct.id = data.SuratMasuk.length ? data.SuratMasuk[data.SuratMasuk.length - 1].id + 1 : 1;


  newProduct.tanggalSurat = formatDateString(newProduct.tanggalSurat);
  newProduct.diterimaTanggal = formatDateString(newProduct.diterimaTanggal);
  newProduct.tanggalDisposisi = formatDateString(newProduct.tanggalDisposisi);

  data.SuratMasuk.push(newProduct);
  saveData(data);
  res.status(201).json(newProduct);
});

app.put("/SuratKeluar/:id", (req, res) => {
  const data = getData();
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;
  const productIndex = data.SuratMasuk.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    data.SuratMasuk[productIndex] = updatedProduct;
    saveData(data);
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).send("Product not found");
  }
});



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
