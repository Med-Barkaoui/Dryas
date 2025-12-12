const User = require("../models/User");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/sendEmail");

// Register
exports.register = async (req, res) => {
  try {
    const { name, email, password, birth } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Email exists" });

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, birth });

    // Générer code MFA
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    user.mfaExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    sendEmail(email, "Dryas Verification Code", `Votre code est : ${code}`);
    res.json({ msg: "Account created. Check your email for MFA code." });

  } catch (err) {
    console.error("Erreur register:", err);
    res.status(500).json({ error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: "Wrong password" });

    // Générer code MFA
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    user.mfaExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    sendEmail(email, "Dryas Login Code", `Votre code est : ${code}`);
    res.json({ msg: "MFA sent" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
