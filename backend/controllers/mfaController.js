const User = require("../models/User");
const jwt = require("jsonwebtoken");

exports.verifyCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "User not found" });

    if (user.mfaCode !== code) return res.status(400).json({ msg: "Invalid code" });
    if (user.mfaExpires < Date.now()) return res.status(400).json({ msg: "Code expired" });

    // Supprimer code MFA
    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    // Creer token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);

    res.json({ msg: "MFA success", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};