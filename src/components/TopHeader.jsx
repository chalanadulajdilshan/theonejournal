import React, { useState, useEffect } from 'react';

export default function TopHeader({ darkMode, toggleDarkMode }) {
  const [currentDate, setCurrentDate] = useState('');

  useEffect(() => {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const dateStr = new Date().toLocaleDateString('en-US', options);
    setCurrentDate(dateStr);
  }, []);

  const utilityLinks = [
    { label: 'Emergencies', url: '#' },
    { label: 'Jobs', url: '#' },
    { label: 'Holiday', url: '#' },
    { label: 'Banking', url: '#' },
    { label: 'Visa', url: '#' },
    { label: 'School', url: '#' },
    { label: 'Global', url: '#' },
  ];

  return (
    <header className="top-header">
      <div className="container">
        <div className="top-header-links">
          {utilityLinks.map((link, idx) => (
            <a key={idx} href={link.url} className="semibold">
              {link.label}
            </a>
          ))}
        </div>
        <div className="top-header-right">
          <span className="semibold hide-mobile">{currentDate}</span>
          <span className="hide-mobile">|</span>
          <div className="top-header-widget">
            <span className="bold text-gold">Edition:</span>
            <span className="semibold text-primary">UAE (EN)</span>
          </div>
          <span>|</span>
          <a 
            href="#admin" 
            className="admin-link semibold" 
            style={{ 
              textDecoration: 'none', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '0.35rem', 
              color: 'var(--text-color)',
              fontSize: '0.75rem' 
            }}
          >
            <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--gold-primary, #c9933b)' }}>
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2zM5 8h6a1 1 0 0 1 1 1v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/>
            </svg>
            Admin Panel
          </a>
          <span>|</span>
          <button 
            onClick={toggleDarkMode} 
            className="theme-toggle-btn" 
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            aria-label="Toggle Theme"
          >
            {darkMode ? (
              /* Sun icon */
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
              </svg>
            ) : (
              /* Moon icon */
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.868 0 1.71-.15 2.507-.444a.768.768 0 0 1 1.022.824 8.022 8.022 0 0 1-15.662-2.008zm11.471 4.704a3.208 3.208 0 0 1-3.664-3.664.768.768 0 0 1 .843-.815 5.012 5.012 0 0 0 5.644 5.644.768.768 0 0 1-.823.835z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
