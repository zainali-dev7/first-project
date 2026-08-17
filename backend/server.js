const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri = "mongodb+srv://za2131165_db_user:oH7EpFxkckpEg3aB@cluster0.kkai41u.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);
let db;

async function connectDB() {
  await client.connect();
  db = client.db("pizzaShop");
  console.log("Connected to MongoDB!");
}
connectDB();

app.get("/", (req, res) => {
  res.send("Pizza backend is running!");
});

app.get("/api/menu", (req, res) => {
  const menuData = fs.readFileSync("menu.json", "utf-8");
  res.json(JSON.parse(menuData));
});

app.post("/api/orders", async (req, res) => {
  const newOrder = req.body;
  await db.collection("orders").insertOne(newOrder);
  res.json({ message: "Order saved successfully!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});