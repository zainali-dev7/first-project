const express = require("express");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pizza backend is running!");
});
const fs = require("fs");

app.get("/api/menu", (req, res) => {
  const menuData = fs.readFileSync("menu.json", "utf-8");
  res.json(JSON.parse(menuData));
});
app.post("/api/orders", (req, res) => {
  const newOrder = req.body;

  const ordersData = fs.readFileSync("orders.json", "utf-8");
  const orders = JSON.parse(ordersData);

  orders.push(newOrder);

  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));

  res.json({ message: "Order saved successfully!" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});