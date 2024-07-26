const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");

const app = express();
const port = 3002;

app.use(cors());
app.use(bodyParser.json());

const dbFilePath = path.join(__dirname, "db.json");

const getData = () => {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = { User: [] };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2));
  }
  return JSON.parse(fs.readFileSync(dbFilePath, "utf-8"));
};

const saveData = (data) => fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

// Function to generate a random 4-digit ID
const generateRandomId = () => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

app.get("/User", (req, res) => {
  const data = getData();
  const { Nama, Password } = req.query;

  if (Nama && Password) {
    const user = data.User.find((u) => u.Nama === Nama && u.Password === Password);
    if (user) {
      res.json([user]);
    } else {
      res.status(401).send("Invalid credentials");
    }
  } else {
    res.json(data.User);
  }
});

app.get("/User/:id", (req, res) => {
  const data = getData();
  const userId = req.params.id; // userId is a string
  const user = data.User.find((u) => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).send("User not found");
  }
});

app.post("/User", (req, res) => {
  const data = getData();
  const newUser = req.body;

  // Generate a random 4-digit ID and ensure it's unique
  let id;
  do {
    id = generateRandomId();
  } while (data.User.some(user => user.id === id));

  newUser.id = id;
  data.User.push(newUser);
  saveData(data);
  res.status(201).json(newUser);
});

app.put("/User/:id", (req, res) => {
  const data = getData();
  const userId = req.params.id; // userId is a string
  const userIndex = data.User.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    data.User[userIndex] = req.body;
    saveData(data);
    res.status(200).json(data.User[userIndex]);
  } else {
    res.status(404).send("User not found");
  }
});

app.delete("/User/:id", (req, res) => {
  const data = getData();
  const userId = req.params.id; // userId is a string
  const userIndex = data.User.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    data.User.splice(userIndex, 1);
    saveData(data);
    res.status(200).send("User deleted successfully");
  } else {
    res.status(404).send("User not found");
  }
});

app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
