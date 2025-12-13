require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// CORS: autoriser le frontend en prod ou dev
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000"
];
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Connexion MongoDB
connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/mfa", require("./routes/mfaRoutes"));
app.use("/api/products", require("./routes/productRoutes"));
app.use("/api/orders", require("./routes/orderRoutes"));

// PORT dynamique pour Render
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
