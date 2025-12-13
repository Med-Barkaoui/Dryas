const express = require("express");
const router = express.Router();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { register, login } = require("../controllers/authController");

// Normal register + login
router.post("/register", register);
router.post("/login", login);

// GOOGLE OAUTH
router.get("/google", (req, res) => {
  const redirect_uri = "http://localhost:5000/api/auth/google/callback";
  const client_id = process.env.GOOGLE_CLIENT_ID;

  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${client_id}&redirect_uri=${redirect_uri}&response_type=code&scope=openid%20email%20profile`;

  res.redirect(url);
});

router.get("/google/callback", async (req, res) => {
  const code = req.query.code;
  const redirect_uri = "http://localhost:5000/api/auth/google/callback";

  try {
    const { data } = await axios.post(
      "https://oauth2.googleapis.com/token",
      {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri,
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const { id_token } = data;
    const googleUser = JSON.parse(Buffer.from(id_token.split(".")[1], "base64").toString());

    let user = await User.findOne({ email: googleUser.email });
    if (!user) {
      user = await User.create({
        email: googleUser.email,
        password: "google_auth_no_password",
        birth: null,
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.redirect(`http://localhost:3000/login?token=${token}`);
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: "Erreur dans OAuth Google" });
  }
});

// Vérification du token
router.get("/check-token", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ msg: "User not found" });

    res.json({ user: { id: user._id, email: user.email } });
  } catch (err) {
    res.status(401).json({ msg: "Invalid token" });
  }
});

module.exports = router;
