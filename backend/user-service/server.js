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

const saveData = (data) => 
  fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2));

app.get("/User", (req, res) => {
  const data = getData();
  res.json(data.User);
});

app.get("/User/:id", (req, res) => {
  const data = getData();
  const userId = parseInt(req.params.id);
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
  newUser.id = data.User.length ? data.User[data.User.length - 1].id + 1 : 1;
  data.User.push(newUser);
  saveData(data);
  res.status(201).json(newUser);
});

app.put("/User/:id", (req, res) => {
  const data = getData();
  const userId = parseInt(req.params.id);
  const userIndex = data.User.findIndex((u) => u.id === userId);
  if (userIndex !== -1) {
    data.User[userIndex] = req.body;
    saveData(data);
    res.status(200).json(data.User[userIndex]);
  } else {
    res.status(404).send("User not found");
  }
});

app.listen(port, () => {
  console.log(`User service running on port ${port}`);
});
