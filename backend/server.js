require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db;
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
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
// Simulates Stripe's checkout session creation
// In production, this would use: const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
app.post("/api/create-checkout-session", (req, res) => {
  const { amount } = req.body;

  // Simulated Stripe session object (mirrors real Stripe response structure)
  const session = {
    id: "sess_" + Math.random().toString(36).substring(2, 15),
    amount: amount,
    currency: "pkr",
    status: "created",
  };

  res.json(session);
});

app.post("/api/confirm-payment", (req, res) => {
  const { sessionId, cardNumber } = req.body;

  // Simulated payment validation (real Stripe does actual card processing here)
  const isValidCard = cardNumber && cardNumber.replace(/\s/g, "").length === 16;

  if (isValidCard) {
    res.json({ status: "succeeded", sessionId });
  } else {
    res.status(400).json({ status: "failed", message: "Invalid card details" });
  }
});
app.post("/api/orders", async (req, res) => {
  const newOrder = req.body;
  await db.collection("orders").insertOne(newOrder);
  res.json({ message: "Order saved successfully!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
app.post("/api/orders-postgres", async (req, res) => {
  const { customer_name, total, items } = req.body;

  const { data, error } = await supabase
    .from("orders")
    .insert([{ customer_name, total, items: JSON.stringify(items) }]);

  if (error) {
    res.status(400).json({ message: "Failed to save order", error });
  } else {
    res.json({ message: "Order saved to PostgreSQL!", data });
  }
});