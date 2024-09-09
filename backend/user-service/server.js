// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const pool = require("./db");

const app = express();
const port = process.env.PORT || 3002;

app.use(cors());
app.use(bodyParser.json());

app.get("/test-db-connection", async (req, res) => {
  try {
    // eslint-disable-next-line no-unused-vars
    const [rows] = await pool.query("SELECT 1");
    res.status(200).send("Database connection successful");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Fetch all users or a specific user by Nama and Password
app.get("/User", async (req, res) => {
  const { Nama, Password } = req.query;
  try {
    let query = "SELECT * FROM `user`";
    const params = [];

    if (Nama && Password) {
      query += " WHERE Nama = ? AND Password = ?";
      params.push(Nama, Password);
    }

    const [rows] = await pool.query(query, params);

    if (Nama && Password) {
      if (rows.length > 0) {
        res.json(rows);
      } else {
        res.status(401).send("Invalid credentials");
      }
    } else {
      res.json(rows);
    }
  } catch (error) {
    console.error("Error during /User query:", error.message);
    res.status(500).json({ error: error.message });
  }
});


// Fetch a user by ID
app.get("/User/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM `user` WHERE id = ?", [id]);

    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new user
app.post("/User", async (req, res) => {
  const { Nama, Password, Role } = req.body; // Include role in request
  const id = Math.random().toString(36).substring(2, 15);
  try {
    await pool.query("INSERT INTO `user` (id, Nama, Password, Role) VALUES (?, ?, ?, ?)", [id, Nama, Password, Role || "user"]);
    res.status(201).json({ id, Nama, Password, Role: Role || "user" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a user by ID
app.put("/User/:id", async (req, res) => {
  const { id } = req.params;
  const { Nama, Password, Role } = req.body; // Include role in update
  try {
    const [result] = await pool.query("UPDATE `user` SET Nama = ?, Password = ?, Role = ? WHERE id = ?", [Nama, Password, Role, id]);

    if (result.affectedRows > 0) {
      res.status(200).json({ id, Nama, Password, Role });
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a user by ID
app.delete("/User/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await pool.query("DELETE FROM `user` WHERE id = ?", [id]);

    if (result.affectedRows > 0) {
      res.status(200).send("User deleted successfully");
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`User service berjalan di-Port ${port}`);
});
