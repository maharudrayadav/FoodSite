// src/components/Footer.js
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h3>FoodExpress</h3>
            <p>Delivering delicious meals since 2023</p>
          </div>
          <div className="footer-section">
            <h3>Contact Us</h3>
            <p>contact@foodexpress.com</p>
            <p>+1 (555) 123-4567</p>
          </div>
          <div className="footer-section">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <span className="icon">📱</span>
              <span className="icon">📷</span>
              <span className="icon">🐦</span>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} FoodExpress. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;