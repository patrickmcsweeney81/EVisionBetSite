import React from 'react';
import './ContactUs.css';

function ContactUs() {
  return (
    <div className="contact-us-section">
      <div className="contact-content">
        <h3>📧 Contact Us</h3>
        <p className="contact-description">
          Have questions or need support? We're here to help!
        </p>
        
        <div className="contact-methods">
          <div className="contact-method">
            <span className="contact-icon">✉️</span>
            <div className="contact-details">
              <h4>Email</h4>
              <a href="mailto:support@evisionbet.com">support@evisionbet.com</a>
            </div>
          </div>
          
          <div className="contact-method">
            <span className="contact-icon">💬</span>
            <div className="contact-details">
              <h4>Live Chat</h4>
              <p>Available 24/7 for premium members</p>
            </div>
          </div>
          
          <div className="contact-method">
            <span className="contact-icon">📱</span>
            <div className="contact-details">
              <h4>Social Media</h4>
              <div className="social-links">
                <a href="https://twitter.com/evisionbet" target="_blank" rel="noopener noreferrer">Twitter</a>
                <a href="https://discord.gg/evisionbet" target="_blank" rel="noopener noreferrer">Discord</a>
              </div>
            </div>
          </div>
        </div>
        
        <p className="contact-tagline">
          Bet smarter with BET EVision — where value comes first.
        </p>
      </div>
    </div>
  );
}

export default ContactUs;
