const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  birth: Date,
  password: String,
  googleId: String,
  role: { type: String, default: "user" },
  mfaCode: String,
  mfaExpires: Date
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
