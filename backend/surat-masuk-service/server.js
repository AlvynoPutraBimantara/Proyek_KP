const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3003;

app.use(cors());
app.use(bodyParser.json());

const dbFilePath = path.join(__dirname, "db.json");

const getData = () => {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = { SuratMasuk: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
};

const saveData = (data) => fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

app.get("/SuratMasuk", (req, res) => {
  const data = getData();
  res.json(data.SuratMasuk);
});

app.get("/SuratMasuk/:id", (req, res) => {
  const data = getData();
  const productId = req.params.id; // Use string ID
  const product = data.SuratMasuk.find((p) => p.id === productId);
  if (product) {
    res.json(product);
  } else {
    res.status(404).send("Product not found");
  }
});

app.post("/SuratMasuk", (req, res) => {
  const data = getData();
  const newProduct = req.body;
  newProduct.id = data.SuratMasuk.length ? data.SuratMasuk[data.SuratMasuk.length - 1].id + 1 : 1;
  data.SuratMasuk.push(newProduct);
  saveData(data);
  res.status(201).json(newProduct);
});

app.put("/SuratMasuk/:id", (req, res) => {
  const data = getData();
  const productId = req.params.id; // Use string ID
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

app.delete("/SuratMasuk/:id", (req, res) => {
  const data = getData();
  const productId = req.params.id; // Use string ID
  const newSuratMasuk = data.SuratMasuk.filter((p) => p.id !== productId);
  if (newSuratMasuk.length !== data.SuratMasuk.length) {
    data.SuratMasuk = newSuratMasuk;
    saveData(data);
    res.status(200).send("Product deleted");
  } else {
    res.status(404).send("Product not found");
  }
});

app.listen(port, () => {
  console.log(`Surat Masuk service running on port ${port}`);
});