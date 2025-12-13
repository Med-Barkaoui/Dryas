const express = require("express");
const router = express.Router();
const User = require("../models/User");
const sendEmail = require("../utils/sendEmail");
const jwt = require("jsonwebtoken");

// Envoyer le code MFA
router.post("/send", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ msg: "Email required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    user.mfaExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    sendEmail(email, "Dryas MFA Code", `Votre code est : ${code}`);
    res.json({ msg: "MFA code sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Error sending MFA code" });
  }
});

// Vérifier le code MFA
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (!user.mfaCode || !user.mfaExpires)
      return res.status(400).json({ msg: "Aucun code MFA trouvé" });

    if (user.mfaCode !== code) return res.status(401).json({ msg: "Code MFA invalide" });
    if (user.mfaExpires < Date.now()) return res.status(401).json({ msg: "Code MFA expiré" });

    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
    res.json({ msg: "MFA success", token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur lors de la vérification MFA" });
  }
});

module.exports = router;
