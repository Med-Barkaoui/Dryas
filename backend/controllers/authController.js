const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, birth } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email et password requis" });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: "Utilisateur déjà existant" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email,
      password: hashedPassword,
      birth,
    });

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.status(201).json({ msg: "Utilisateur créé", token, user: { id: newUser._id, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur lors de l'inscription" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ msg: "Email et password requis" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ msg: "Mot de passe incorrect" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ msg: "Connexion réussie", token, user: { id: user._id, email } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Erreur serveur lors de la connexion" });
  }
};
