const User = require("../models/User");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail");

// Générer et envoyer un code MFA
exports.sendMfaCode = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email requis" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.mfaCode = code;
    user.mfaExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save();

    await sendEmail(email, "Dryas MFA Code", `Votre code MFA : ${code}`);
    res.json({ msg: "Code MFA envoyé" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur lors de l'envoi du code MFA" });
  }
};

// Vérifier le code MFA
exports.verifyMfaCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ msg: "Email et code requis" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    if (!user.mfaCode || !user.mfaExpires)
      return res.status(400).json({ msg: "Aucun code MFA trouvé" });

    if (user.mfaCode !== code) return res.status(401).json({ msg: "Code MFA invalide" });
    if (user.mfaExpires < Date.now()) return res.status(401).json({ msg: "Code MFA expiré" });

    // Réinitialiser le code MFA
    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ msg: "MFA validé", token, user: { id: user._id, email: user.email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur lors de la vérification MFA" });
  }
};
