const nodemailer = require("nodemailer");
const sendEmail = async (to, subject, text, html = null, attachments = []) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL, // dryass.dryass@gmail.com
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: process.env.EMAIL, // CORRECTION: juste l'email, pas d'alias
      to,
      subject,
      text
    };

    if (html) mailOptions.html = html;
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return false;
  }
};

module.exports = sendEmail;
