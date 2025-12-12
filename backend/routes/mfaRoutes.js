console.log("🔥 MFA ROUTE LOADED – expiration = 1 minute");

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
    user.mfaExpires = new Date(Date.now() + 1 * 60 * 1000);
    await user.save();

    // Créer l'email HTML stylé
    const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Code de Vérification Dryas</title>
    <style>
        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background-color: #f9f9f9;
            margin: 0;
            padding: 0;
        }
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
        }
        .header {
            background-color: #2e7d32;
            padding: 30px 20px;
            text-align: center;
        }
        .logo {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 10px;
        }
        .logo-icon {
            font-size: 32px;
            color: white;
        }
        .logo-text {
            font-size: 28px;
            font-weight: 700;
            color: white;
            letter-spacing: 1px;
        }
        .title {
            color: white;
            font-size: 24px;
            margin: 0;
            font-weight: 600;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 18px;
            color: #333;
            margin-bottom: 25px;
            line-height: 1.6;
        }
        .code-container {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            text-align: center;
            margin: 30px 0;
            border: 1px solid #eaeaea;
        }
        .code-label {
            font-size: 16px;
            color: #666;
            margin-bottom: 10px;
        }
        .code {
            font-size: 42px;
            font-weight: 700;
            color: #2e7d32;
            letter-spacing: 5px;
            font-family: monospace;
            background-color: white;
            padding: 15px 25px;
            border-radius: 8px;
            display: inline-block;
            box-shadow: 0 2px 10px rgba(46, 125, 50, 0.1);
            margin: 10px 0;
        }
        .warning {
            background-color: #fff8e1;
            border-left: 4px solid #ffc107;
            padding: 15px;
            border-radius: 6px;
            margin: 25px 0;
            font-size: 14px;
            color: #666;
        }
        .warning-icon {
            color: #ff9800;
            font-weight: bold;
        }
        .info-box {
            background-color: #e8f5e9;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #4caf50;
        }
        .info-title {
            font-weight: 600;
            color: #2e7d32;
            margin-bottom: 8px;
            font-size: 16px;
        }
        .info-text {
            color: #555;
            font-size: 14px;
            line-height: 1.5;
        }
        .footer {
            background-color: #f5f5f5;
            padding: 25px 30px;
            text-align: center;
            border-top: 1px solid #eaeaea;
        }
        .footer-text {
            color: #777;
            font-size: 14px;
            line-height: 1.5;
            margin-bottom: 10px;
        }
        .support-link {
            color: #2e7d32;
            text-decoration: none;
            font-weight: 500;
        }
        .support-link:hover {
            text-decoration: underline;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-icon {
            display: inline-block;
            margin: 0 10px;
            color: #666;
            font-size: 14px;
        }
        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .code {
                font-size: 32px;
                letter-spacing: 3px;
                padding: 12px 20px;
            }
            .header {
                padding: 25px 15px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <div class="logo">
                <div class="logo-icon">🌿</div>
                <div class="logo-text">DRYAS</div>
            </div>
            <h1 class="title">Code de Vérification</h1>
        </div>
        
        <div class="content">
            <p class="greeting">
                Bonjour,<br><br>
                Pour sécuriser votre compte Dryas, veuillez utiliser le code de vérification ci-dessous.
            </p>
            
            <div class="code-container">
                <div class="code-label">Votre code de vérification :</div>
                <div class="code">${code}</div>
                <div class="code-label">(valable pendant 1 minute)</div>
            </div>
            
            <div class="warning">
                <span class="warning-icon">⚠️</span> 
                <strong>Important :</strong> Ne partagez jamais ce code avec qui que ce soit. 
                L'équipe Dryas ne vous demandera jamais votre code de vérification.
            </div>
            
            <div class="info-box">
                <div class="info-title">Pourquoi cette vérification ?</div>
                <div class="info-text">
                    Cette étape supplémentaire permet de protéger votre compte contre les accès non autorisés.
                    Si vous n'avez pas tenté de vous connecter, veuillez ignorer cet email ou contacter notre support.
                </div>
            </div>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                © ${new Date().getFullYear()} Dryas. Tous droits réservés.<br>
                Boutique en ligne de plantes d'intérieur
            </p>
            <p class="footer-text">
                Besoin d'aide ? Contactez-nous à 
                <a href="mailto:support@dryas.com" class="support-link">support@dryas.com</a>
            </p>
            <div class="social-links">
                <span class="social-icon">🌱 Cultivons ensemble</span>
            </div>
        </div>
    </div>
</body>
</html>
    `;

    // Envoyer l'email
    await sendEmail(
      email,
      "🔒 Votre code de vérification Dryas",
      `Votre code de vérification Dryas est : ${code}\n\nCe code expire dans 1 minute.\n\nNe partagez jamais ce code avec qui que ce soit.\n\nSi vous n'avez pas tenté de vous connecter, veuillez ignorer cet email.\n\nL'équipe Dryas`,
      htmlContent
    );

    res.json({ msg: "MFA code sent" });
  } catch (err) {
    console.error("❌ Error sending MFA email:", err);
    res.status(500).json({ msg: "Error sending MFA code" });
  }
});

// Vérifier le code MFA
router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code)
      return res.status(400).json({ msg: "Email et code requis" });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ msg: "Utilisateur non trouvé" });

    // Vérifier si un code existe
    if (!user.mfaCode || !user.mfaExpires)
      return res.status(400).json({ msg: "Aucun code MFA trouvé" });

    // Comparer l'expiration
    const now = Date.now();
    const expireTime = new Date(user.mfaExpires).getTime();

    if (now > expireTime)
      return res.status(401).json({ msg: "Code MFA expiré" });

    // Comparer les codes
    if (user.mfaCode.trim() !== code.trim())
      return res.status(401).json({ msg: "Code MFA invalide" });

    // Réinitialiser
    user.mfaCode = null;
    user.mfaExpires = null;
    await user.save();

    // Créer un token JWT
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ 
      msg: "MFA vérifié avec succès", 
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      }
    });
  } catch (err) {
    console.error("❌ Error verifying MFA:", err);
    res.status(500).json({ msg: "Erreur serveur lors de la vérification MFA" });
  }
});

module.exports = router;