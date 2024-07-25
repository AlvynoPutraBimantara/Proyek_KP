const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3004;

app.use(cors());
app.use(bodyParser.json());

const dbFilePath = path.join(__dirname, "db.json");

const getData = () => {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = { SuratKeluar: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
};

const saveData = (data) =>
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

app.get("/SuratKeluar", (req, res) => {
  const data = getData();
  res.json(data.SuratKeluar);
});

app.post("/SuratKeluar", (req, res) => {
  const data = getData();
  const newProduct = req.body;
  newProduct.id = data.SuratKeluar.length ? data.SuratKeluar[data.SuratKeluar.length - 1].id + 1 : 1;
  data.SuratKeluar.push(newProduct);
  saveData(data);
  res.status(201).json(newProduct);
});

app.put("/SuratKeluar/:id", (req, res) => {
  const data = getData();
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;
  const productIndex = data.SuratKeluar.findIndex((p) => p.id === productId);
  if (productIndex !== -1) {
    data.SuratKeluar[productIndex] = updatedProduct;
    saveData(data);
    res.status(200).json(updatedProduct);
  } else {
    res.status(404).send("Product not found");
  }
});

app.listen(port, () => {
  console.log(`Surat Keluar service running on port ${port}`);
});
