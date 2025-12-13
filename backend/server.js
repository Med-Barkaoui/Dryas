require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

// Connexion MongoDB
connectDB();
// Ajouter cette route
// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/mfa", require("./routes/mfaRoutes"));
app.use('/api', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
