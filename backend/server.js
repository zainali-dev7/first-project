require("dotenv").config();

const dns = require("dns");

// Local DNS issue ka workaround
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { MongoClient, ObjectId } = require("mongodb");
const { PrismaClient } = require("@prisma/client");
const { createClient } = require("@supabase/supabase-js");
const fs = require("fs");

const prisma = new PrismaClient();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// ================= DATABASE CONNECTIONS =================

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

let db;

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

async function connectDB() {
  try {
    await client.connect();

    db = client.db("pizzaShop");

    console.log("Connected to MongoDB!");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
}

connectDB();

// ================= HOME ROUTE =================

app.get("/", (req, res) => {
  res.send("Pizza backend is running!");
});

// ================= JWT MIDDLEWARE =================

// Protected route par JWT token check karta hai
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Authorization header nahi mila
  if (!authHeader) {
    return res.status(401).json({
      message: "Access denied. No token provided.",
    });
  }

  // "Bearer TOKEN" mein se actual TOKEN nikalta hai
  const token = authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Access denied. Invalid token.",
    });
  }

  try {
    // Token genuine aur unexpired hai ya nahi
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Decoded JWT data request ke saath attach kar dete hain
    req.user = decoded;

    // Agle middleware/route par jao
    next();
  } catch (error) {
    return res.status(401).json({
      message: "Invalid or expired token.",
    });
  }
}

// ================= ADMIN MIDDLEWARE =================

// Ye middleware check karta hai ke logged-in user admin hai ya nahi
function verifyAdmin(req, res, next) {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }

  // Role admin hai to route ko continue karo
  next();
}

// ================= SIGNUP =================

app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await db
      .collection("users")
      .findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Password ko hash karta hai
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    const newUser = {
      name,
      email,
      password: hashedPassword,

      // Har normal signup default user hoga
      role: "user",

      createdAt: new Date(),
    };

    await db
      .collection("users")
      .insertOne(newUser);

    res.status(201).json({
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= LOGIN =================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await db
      .collection("users")
      .findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Entered password ko saved hash ke saath compare karta hai
    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(400).json({
        message: "Invalid email or password",
      });
    }

    // Successful login par JWT token banta hai
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,

        // Purane users mein role missing ho to user maan lo
        role: user.role || "user",
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "1h",
      }
    );

    res.json({
      message: "Login successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= PROTECTED PROFILE =================

// Pehle verifyToken chalega.
// Valid token hua tabhi profile milegi.
app.get(
  "/api/profile",
  verifyToken,
  async (req, res) => {
    try {
      const user = await db
        .collection("users")
        .findOne({
          _id: new ObjectId(req.user.userId),
        });

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role || "user",
      });
    } catch (error) {
      console.error("Profile error:", error);

      res.status(500).json({
        message: "Server error",
      });
    }
  }
);

// ================= ADMIN TEST ROUTE =================

// Pehle JWT check hoga
// Phir admin role check hoga
app.get(
  "/api/admin/test",
  verifyToken,
  verifyAdmin,
  (req, res) => {
    res.json({
      message: "Welcome Admin! You have access.",
    });
  }
);
// ================= ADMIN ORDERS ROUTE =================

// Sirf logged-in admin MongoDB ke orders dekh sakta hai
app.get(
  "/api/admin/orders",
  verifyToken,
  verifyAdmin,
  async (req, res) => {
    try {
      const orders = await db
        .collection("orders")
        .find({})
        .sort({ _id: -1 })
        .toArray();

      res.json(orders);
    } catch (error) {
      console.error("Admin orders error:", error);

      res.status(500).json({
        message: "Failed to load orders",
      });
    }
  }
);

// ================= MENU =================

app.get("/api/menu", (req, res) => {
  const menuData = fs.readFileSync(
    "menu.json",
    "utf-8"
  );

  res.json(JSON.parse(menuData));
});

// ================= SIMULATED PAYMENT =================

// Stripe-pattern simulated checkout
app.post(
  "/api/create-checkout-session",
  (req, res) => {
    const { amount } = req.body;

    const session = {
      id:
        "sess_" +
        Math.random()
          .toString(36)
          .substring(2, 15),

      amount: amount,
      currency: "pkr",
      status: "created",
    };

    res.json(session);
  }
);

// IMPORTANT:
// Ye sirf learning/mock payment hai.
// Ismein kabhi real card details use nahi karni.
app.post("/api/confirm-payment", (req, res) => {
  const { sessionId, cardNumber } = req.body;

  const isValidCard =
    cardNumber &&
    cardNumber.replace(/\s/g, "").length === 16;

  if (isValidCard) {
    res.json({
      status: "succeeded",
      sessionId,
    });
  } else {
    res.status(400).json({
      status: "failed",
      message: "Invalid card details",
    });
  }
});

// ================= AI MENU ASSISTANT =================

// Simulated AI Menu Assistant
app.post("/api/ai-suggest", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        message: "Message is required",
      });
    }

    const menuData = fs.readFileSync(
      "menu.json",
      "utf-8"
    );

    const pizzas = JSON.parse(menuData);

    const lowerMsg = message.toLowerCase();

    let reply = "";
    let suggested = null;

    if (
      lowerMsg.includes("cheese") ||
      lowerMsg.includes("simple")
    ) {
      suggested = pizzas.find((p) =>
        p.name.includes("Cheese")
      );

      reply = `I'd recommend our ${suggested.name} — classic, simple, and always a favorite!`;
    } else if (
      lowerMsg.includes("spicy") ||
      lowerMsg.includes("meat")
    ) {
      suggested = pizzas.find((p) =>
        p.name.includes("Pepperoni")
      );

      reply = `You'd love our ${suggested.name} — packed with flavor!`;
    } else if (
      lowerMsg.includes("veg") ||
      lowerMsg.includes("chicken")
    ) {
      suggested = pizzas.find((p) =>
        p.name.includes("Fajita")
      );

      reply = `Try our ${suggested.name} — a customer favorite!`;
    } else {
      reply =
        "Tell me what you're in the mood for — cheesy, spicy, or something else — and I'll suggest a pizza!";
    }

    res.json({
      reply,
      suggested,
    });
  } catch (error) {
    console.error(
      "AI assistant error:",
      error
    );

    res.status(500).json({
      message: "Server error",
    });
  }
});

// ================= MONGODB ORDERS =================

app.post("/api/orders", async (req, res) => {
  try {
    const newOrder = req.body;

    await db
      .collection("orders")
      .insertOne(newOrder);

    res.json({
      message: "Order saved successfully!",
    });
  } catch (error) {
    console.error("Order error:", error);

    res.status(500).json({
      message: "Failed to save order",
    });
  }
});

// ================= PRISMA ORDERS =================

app.post(
  "/api/orders-prisma",
  async (req, res) => {
    const {
      customer_name,
      total,
      items,
    } = req.body;

    try {
      const order = await prisma.order.create({
        data: {
          customer_name,
          total,
          items: JSON.stringify(items),
        },
      });

      res.json({
        message: "Order saved via Prisma!",
        order,
      });
    } catch (error) {
      res.status(400).json({
        message: "Failed",
        error: error.message,
      });
    }
  }
);

// ================= SUPABASE ORDERS =================

app.post(
  "/api/orders-postgres",
  async (req, res) => {
    const {
      customer_name,
      total,
      items,
    } = req.body;

    const { data, error } = await supabase
      .from("orders")
      .insert([
        {
          customer_name,
          total,
          items: JSON.stringify(items),
        },
      ]);

    if (error) {
      res.status(400).json({
        message: "Failed to save order",
        error,
      });
    } else {
      res.json({
        message: "Order saved to PostgreSQL!",
        data,
      });
    }
  }
);

// ================= START SERVER =================

// 0.0.0.0 Railway deployment ke liye
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `Server running on http://localhost:${PORT}`
  );
});