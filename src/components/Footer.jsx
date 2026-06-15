import React, { useState } from 'react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email) {
      setIsSubscribed(true);
      setEmail('');
      setTimeout(() => setIsSubscribed(false), 5000);
    }
  };

  const socialLinks = [
    { label: 'FB', icon: 'F', url: '#' },
    { label: 'TW', icon: 'T', url: '#' },
    { label: 'LN', icon: 'L', url: '#' },
    { label: 'YT', icon: 'Y', url: '#' }
  ];

  return (
    <footer className="footer-wrapper">
      {/* Animated waves container */}
      <div className="footer-waves-container">
        <svg className="footer-waves" xmlns="http://www.w3.org/2000/svg" viewBox="0 24 150 28" preserveAspectRatio="none" shapeRendering="auto">
          <defs>
            <path id="gentle-wave" d="M-160 44c30 0 58-18 88-18s58 18 88 18 58-18 88-18 58 18 88 18v44h-352z" />
          </defs>
          <g className="parallax-waves">
            <use href="#gentle-wave" x="48" y="0" fill="rgba(209, 33, 40, 0.15)" />
            <use href="#gentle-wave" x="48" y="3" fill="rgba(197, 160, 89, 0.3)" />
            <use href="#gentle-wave" x="48" y="5" fill="rgba(209, 33, 40, 0.45)" />
            <use href="#gentle-wave" x="48" y="7" fill="var(--primary-color)" />
          </g>
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '1.5rem', position: 'relative', zIndex: 2 }}>
        <div className="footer-top-row">
          {/* Brand info */}
          <div className="footer-brand">
            <h2 className="logo-text" style={{color: '#fff'}}>UAE <span>NEWS</span></h2>
            <p className="footer-desc">
              Inspired by the premium styling of Khaleej Times, UAE News & Gossip is the leading source of breaking updates, deep business analysis, technology insights, and lifestyle features across the Gulf and globally.
            </p>
            <div className="footer-social-row">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.url} className="social-circle-btn" aria-label={`Follow us on ${social.label}`}>
                  <span className="bold" style={{fontSize: '0.8rem'}}>{social.icon}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="footer-col-title">News Sections</h3>
            <ul className="footer-links-list">
              <li><a href="#section-partner-content">Partner Content</a></li>
              <li><a href="#section-world">World News</a></li>
              <li><a href="#section-business">Business & Markets</a></li>
              <li><a href="#section-tech">Tech & BTR</a></li>
              <li><a href="#section-life">Lifestyle & Entertainment</a></li>
            </ul>
          </div>

          {/* Utility links */}
          <div>
            <h3 className="footer-col-title">Legal & Contact</h3>
            <ul className="footer-links-list">
              <li><a href="#">About Us</a></li>
              <li><a href="#">Careers</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="footer-newsletter">
            <h3 className="footer-col-title">Subscribe</h3>
            <p className="footer-newsletter-text">
              Sign up for our morning briefing and get the top news stories delivered straight to your inbox daily.
            </p>
            {isSubscribed ? (
              <div style={{color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.85rem', padding: '0.5rem', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px'}}>
                Thank you for subscribing! Check your inbox soon.
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="newsletter-form">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="newsletter-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button type="submit" className="newsletter-btn">Join</button>
              </form>
            )}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="footer-bottom-row">
          <span>&copy; {new Date().getFullYear()} UAE News & Gossip Portal. All rights reserved.</span>
          <div style={{display: 'flex', gap: '1rem'}}>
            <a href="#">Back to Top</a>
            <span>&bull;</span>
            <a href="#">Site Map</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
