// Contact.js
import React from 'react';
import Navbar from '../components/Navbar'; // Importez la navbar depuis le dossier components

const Contact = () => {
  return (
    <div className="dryas-container">
      <Navbar />
      <hr />
      
      <div className="dryas-main">
        <div className="dryas-content-full">
          <div className="content-header">
            <h1>Contactez-nous</h1>
            <p>Nous sommes là pour vous aider</p>
          </div>

          <div className="contact-container">
            <div className="contact-info">
              <div className="contact-item">
                <div className="contact-icon">📧</div>
                <div>
                  <h3>Email</h3>
                  <p>dryass.dryass@gmail.com</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📱</div>
                <div>
                  <h3>Téléphone</h3>
                  <p>+216 93531547</p>
                </div>
              </div>
              
              <div className="contact-item">
                <div className="contact-icon">📍</div>
                <div>
                  <h3>Adresse</h3>
                  <p>Tunis, Tunisia</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;