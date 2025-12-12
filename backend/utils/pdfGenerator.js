const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Génère une facture PDF pour une commande
 * @param {Object} order - Commande avec produits populés
 * @param {Object} user - Informations utilisateur
 * @returns {Promise<Buffer>} Buffer du PDF
 */
const generateInvoicePDF = async (order, user) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ 
        size: 'A4', 
        margin: 50,
        info: {
          Title: `Facture Dryas - ${order._id}`,
          Author: 'Dryas Boutique',
          Subject: `Facture de commande ${order._id}`,
          Keywords: 'facture, commande, plantes, dryas',
          Creator: 'Dryas',
          CreationDate: new Date()
        }
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        resolve(pdfData);
      });

      // Styles
      const primaryColor = '#2e7d32';
      const secondaryColor = '#4caf50';
      const textColor = '#333333';
      const lightColor = '#666666';

      // En-tête avec logo
      doc.fillColor(primaryColor)
         .fontSize(24)
         .font('Helvetica-Bold')
         .text('DRYAS', 50, 50, { align: 'left' });

      doc.fillColor(lightColor)
         .fontSize(12)
         .font('Helvetica')
         .text('Boutique de plantes', 50, 80);

      // Numéro de facture
      doc.fillColor(textColor)
         .fontSize(18)
         .font('Helvetica-Bold')
         .text('FACTURE', 400, 50, { align: 'right' });

      doc.fillColor(lightColor)
         .fontSize(10)
         .font('Helvetica')
         .text(`N° ${order._id}`, 400, 75, { align: 'right' })
         .text(`Date: ${new Date(order.createdAt).toLocaleDateString('fr-FR')}`, 400, 90, { align: 'right' });

      // Séparateur
      doc.moveTo(50, 120).lineTo(550, 120).stroke(primaryColor).lineWidth(2);

      // Informations client
      doc.fillColor(textColor)
         .fontSize(14)
         .font('Helvetica-Bold')
         .text('INFORMATIONS CLIENT', 50, 140);

      doc.fillColor(textColor)
         .fontSize(11)
         .font('Helvetica')
         .text(`${user.firstName || ''} ${user.lastName || ''}`, 50, 165)
         .text(user.email, 50, 180);

      doc.fillColor(textColor)
         .fontSize(11)
         .text('Adresse de livraison:', 50, 200)
         .fillColor(lightColor)
         .fontSize(10)
         .text(order.shippingAddress, 50, 215, { width: 250 });

      doc.fillColor(textColor)
         .fontSize(11)
         .text('Téléphone:', 50, 250)
         .fillColor(lightColor)
         .fontSize(10)
         .text(order.phone, 50, 265);

      // Statut de commande
      doc.fillColor(textColor)
         .fontSize(11)
         .text('Statut:', 400, 165)
         .fillColor(secondaryColor)
         .text(order.status, 400, 180);

      doc.fillColor(textColor)
         .fontSize(11)
         .text('Date de commande:', 400, 200)
         .fillColor(lightColor)
         .fontSize(10)
         .text(new Date(order.createdAt).toLocaleDateString('fr-FR'), 400, 215);

      // Séparateur
      doc.moveTo(50, 300).lineTo(550, 300).stroke('#cccccc').lineWidth(1);

      // En-tête tableau produits
      const tableTop = 320;
      doc.fillColor(primaryColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('PRODUIT', 50, tableTop)
         .text('QTÉ', 300, tableTop)
         .text('PRIX UNIT.', 350, tableTop)
         .text('TOTAL', 450, tableTop);

      doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke('#cccccc').lineWidth(1);

      // Produits
      let y = tableTop + 30;
      order.products.forEach((item, index) => {
        if (y > 650) {
          doc.addPage();
          y = 50;
        }

        const productName = item.product?.name || 'Produit non disponible';
        
        doc.fillColor(textColor)
           .fontSize(10)
           .font('Helvetica')
           .text(productName, 50, y, { width: 200 })
           .text(item.quantity.toString(), 300, y)
           .text(`${item.price.toFixed(2)} TND`, 350, y)
           .text(`${(item.quantity * item.price).toFixed(2)} TND`, 450, y);

        y += 25;
      });

      // Séparateur avant total
      const totalY = y + 10;
      doc.moveTo(350, totalY).lineTo(550, totalY).stroke('#cccccc').lineWidth(1);

      // Total
      doc.fillColor(textColor)
         .fontSize(12)
         .font('Helvetica-Bold')
         .text('SOUS-TOTAL:', 350, totalY + 15)
         .text('TOTAL:', 350, totalY + 40);

      doc.fillColor(textColor)
         .fontSize(12)
         .font('Helvetica')
         .text(`${order.totalAmount.toFixed(2)} TND`, 450, totalY + 15, { align: 'right' })
         .text(`${order.totalAmount.toFixed(2)} TND`, 450, totalY + 40, { align: 'right' });

      // Pied de page
      const footerY = 750;
      doc.fillColor(lightColor)
         .fontSize(9)
         .text('Dryas - Boutique de plantes', 50, footerY)
         .text('Email: dryass.dryass@gmail.com', 50, footerY + 15)
         .text('Tél: +216 53 478 774', 50, footerY + 30)
         .text('Merci pour votre confiance !', 400, footerY, { align: 'right' });

      // Signature
      doc.moveTo(400, footerY + 40).lineTo(550, footerY + 40).stroke(textColor).lineWidth(1);
      doc.fillColor(lightColor)
         .fontSize(8)
         .text('Signature', 475, footerY + 45, { align: 'center' });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = { generateInvoicePDF };