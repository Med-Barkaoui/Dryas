const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const auth = require('../middleware/authMiddleware');
const { generateInvoicePDF } = require('../utils/pdfGenerator');
const sendEmail = require('../utils/sendEmail');

// Créer une nouvelle commande
router.post('/', auth, async (req, res) => {
  try {
    console.log('📦 Requête création commande reçue');
    
    const { products, totalAmount, shippingAddress, phone } = req.body;
    
    // Valider les données requises
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Aucun produit dans la commande' 
      });
    }
    
    if (!totalAmount || !shippingAddress || !phone) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données manquantes: montant total, adresse ou téléphone' 
      });
    }
    
    // Récupérer l'utilisateur
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }
    
    // Vérifier le stock et mettre à jour
    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: `Produit ${item.product} non trouvé` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false, 
          message: `Stock insuffisant pour ${product.name}. Disponible: ${product.stock}, Demandé: ${item.quantity}` 
        });
      }
      
      // Mettre à jour le stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    // Créer la commande
    const order = new Order({
      user: req.userId,
      products,
      totalAmount,
      shippingAddress,
      phone,
      status: 'Confirmée'
    });
    
    await order.save();
    
    // Peupler les informations du produit pour la réponse
    const populatedOrder = await Order.findById(order._id)
      .populate('products.product', 'name price images');
    
    // Générer la facture PDF
    let pdfBuffer;
    try {
      pdfBuffer = await generateInvoicePDF(populatedOrder, user);
      console.log('✅ Facture PDF générée avec succès');
    } catch (pdfError) {
      console.error('❌ Erreur génération PDF:', pdfError);
      // Continuer même si la génération PDF échoue
    }
    
    // Envoyer l'email de confirmation avec facture
    try {
      const orderDate = new Date(order.createdAt).toLocaleDateString('fr-FR');
      const orderTime = new Date(order.createdAt).toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      
      const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Confirmation de commande - Dryas</title>
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
            margin-bottom: 15px;
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
        .confirmation-message {
            background-color: #e8f5e9;
            padding: 25px;
            border-radius: 10px;
            margin-bottom: 30px;
            text-align: center;
            border-left: 4px solid #4caf50;
        }
        .confirmation-icon {
            font-size: 48px;
            margin-bottom: 15px;
        }
        .order-details {
            background-color: #f8f9fa;
            border-radius: 10px;
            padding: 25px;
            margin: 25px 0;
            border: 1px solid #eaeaea;
        }
        .detail-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            padding-bottom: 10px;
            border-bottom: 1px solid #eee;
        }
        .detail-row:last-child {
            border-bottom: none;
        }
        .detail-label {
            color: #666;
            font-weight: 500;
        }
        .detail-value {
            color: #333;
            font-weight: 600;
        }
        .products-table {
            width: 100%;
            border-collapse: collapse;
            margin: 25px 0;
        }
        .products-table th {
            background-color: #2e7d32;
            color: white;
            padding: 12px;
            text-align: left;
        }
        .products-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        .products-table tr:hover {
            background-color: #f5f5f5;
        }
        .total-section {
            background-color: #f1f8e9;
            padding: 20px;
            border-radius: 8px;
            text-align: right;
            margin-top: 20px;
        }
        .total-amount {
            font-size: 24px;
            color: #2e7d32;
            font-weight: 700;
        }
        .invoice-section {
            background-color: #e3f2fd;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 25px 0;
        }
        .btn {
            display: inline-block;
            background-color: #2e7d32;
            color: white;
            padding: 12px 30px;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            margin-top: 10px;
        }
        .btn:hover {
            background-color: #1b5e20;
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
        }
        .thank-you {
            font-size: 18px;
            color: #2e7d32;
            margin-bottom: 20px;
            font-weight: 600;
        }
        @media (max-width: 600px) {
            .content {
                padding: 25px 20px;
            }
            .detail-row {
                flex-direction: column;
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
            <h1 class="title">Confirmation de Commande</h1>
        </div>
        
        <div class="content">
            <div class="confirmation-message">
                <div class="confirmation-icon">✅</div>
                <h2 style="color: #2e7d32; margin: 0 0 15px 0;">Commande Confirmée !</h2>
                <p style="color: #555; margin: 0;">
                    Merci pour votre commande ${user.firstName || ''} !<br>
                    Votre commande a été enregistrée avec succès.
                </p>
            </div>
            
            <div class="order-details">
                <div class="detail-row">
                    <span class="detail-label">N° de commande:</span>
                    <span class="detail-value">${order._id}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date:</span>
                    <span class="detail-value">${orderDate} à ${orderTime}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Statut:</span>
                    <span class="detail-value" style="color: #4caf50; font-weight: 700;">${order.status}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Adresse de livraison:</span>
                    <span class="detail-value">${order.shippingAddress}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Téléphone:</span>
                    <span class="detail-value">${order.phone}</span>
                </div>
            </div>
            
            <h3 style="color: #333; margin-bottom: 15px;">Produits commandés:</h3>
            <table class="products-table">
                <thead>
                    <tr>
                        <th>Produit</th>
                        <th>Quantité</th>
                        <th>Prix unitaire</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${order.products.map(item => `
                    <tr>
                        <td>${item.product?.name || 'Produit'}</td>
                        <td>${item.quantity}</td>
                        <td>${item.price.toFixed(2)} TND</td>
                        <td>${(item.quantity * item.price).toFixed(2)} TND</td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div style="margin-bottom: 10px;">
                    <span style="font-size: 18px; color: #333;">Montant total:</span>
                    <span class="total-amount">${order.totalAmount.toFixed(2)} TND</span>
                </div>
            </div>
            
            <div class="invoice-section">
                <p style="margin: 0 0 15px 0; color: #1976d2; font-weight: 600;">
                    📄 Votre facture est prête !
                </p>
                <p style="margin: 0 0 20px 0; color: #555;">
                    Vous trouverez votre facture en pièce jointe de cet email.<br>
                    Conservez-la pour vos références.
                </p>
            </div>
            
            <div class="thank-you">
                🌱 Merci d'avoir choisi Dryas !
            </div>
            
            <p style="color: #666; line-height: 1.6;">
                Nous traitons votre commande dans les plus brefs délais.<br>
                Vous recevrez un email de mise à jour lorsque votre commande sera expédiée.
            </p>
        </div>
        
        <div class="footer">
            <p class="footer-text">
                <strong>Dryas - Boutique de plantes</strong><br>
                Email: dryass.dryass@gmail.com<br>
                © ${new Date().getFullYear()} Dryas. Tous droits réservés.
            </p>
            <p class="footer-text" style="font-size: 12px;">
                Cet email a été envoyé automatiquement. Merci de ne pas y répondre.
            </p>
        </div>
    </div>
</body>
</html>
      `;

      const textContent = `
Confirmation de commande - Dryas

Bonjour ${user.firstName || ''},

Votre commande a été confirmée avec succès !

Détails de la commande:
N° de commande: ${order._id}
Date: ${orderDate} à ${orderTime}
Statut: ${order.status}
Montant total: ${order.totalAmount.toFixed(2)} TND

Produits commandés:
${order.products.map(item => `- ${item.product?.name || 'Produit'} x${item.quantity}: ${(item.quantity * item.price).toFixed(2)} TND`).join('\n')}

Adresse de livraison: ${order.shippingAddress}
Téléphone: ${order.phone}

Votre facture est disponible en pièce jointe.

Merci d'avoir choisi Dryas !
L'équipe Dryas
      `;

      const attachments = [];
      if (pdfBuffer) {
        attachments.push({
          filename: `Facture-Dryas-${order._id}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        });
      }

      await sendEmail(
        user.email,
        `✅ Confirmation de commande #${order._id} - Dryas`,
        textContent,
        htmlContent,
        attachments
      );

      console.log(`📧 Email de confirmation envoyé à ${user.email}`);
    } catch (emailError) {
      console.error('❌ Erreur envoi email:', emailError);
      // Ne pas échouer la commande si l'email échoue
    }
    
    res.status(201).json({
      success: true,
      message: 'Commande créée avec succès. Un email de confirmation vous a été envoyé.',
      order: populatedOrder
    });
    
  } catch (error) {
    console.error('❌ Erreur création commande:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur: ' + error.message 
    });
  }
});

// Récupérer les commandes de l'utilisateur
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.userId })
      .populate('products.product', 'name price images')
      .sort({ createdAt: -1 });
    
    res.json({
      success: true,
      orders
    });
    
  } catch (error) {
    console.error('Erreur récupération commandes:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

module.exports = router;