import React, { useState, useEffect } from 'react';
import logoImage from '../assets/logo.webp';

export default function TopHeader({ darkMode, toggleDarkMode, siteViews }) {
  const [currentDate, setCurrentDate] = useState('');
  const [currentGmtTime, setCurrentGmtTime] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    
    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString('en-US', dateOptions));
      
      const timeOptions = { 
        hour: '2-digit', 
        minute: '2-digit', 
        timeZone: 'GMT',
        timeZoneName: 'short'
      };
      setCurrentGmtTime(now.toLocaleTimeString('en-US', timeOptions));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Subtle premium 3D tilt
    const tiltX = ((y / rect.height) - 0.5) * -12;
    const tiltY = ((x / rect.width) - 0.5) * 12;
    
    // Dynamic shine position coordinates
    const shineX = (x / rect.width) * 100;
    const shineY = (y / rect.height) * 100;
    
    setTilt({ x: tiltX, y: tiltY });
    setShine({ x: shineX, y: shineY, opacity: 0.55 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setShine({ x: 50, y: 50, opacity: 0 });
  };



  return (
    <>
      {/* Brand Logo Area - Large Centered */}
      <header className="brand-header">
        <div className="header-container-full">
          <div className="brand-header-inner-full">
            <a 
              href="/" 
              className="brand-logo-interactive-link"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              style={{
                transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                transition: 'transform 0.1s ease-out',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img
                src={logoImage}
                alt="The One Journal Logo"
                className="brand-logo-img-full"
                width="1600"
                height="239"
                fetchPriority="high"
                decoding="async"
              />
              <div 
                className="logo-shine-overlay"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: `radial-gradient(circle at ${shine.x}% ${shine.y}%, rgba(255,255,255,0.28) 0%, transparent 60%)`,
                  opacity: shine.opacity,
                  pointerEvents: 'none',
                  transition: 'opacity 0.25s ease',
                  mixBlendMode: 'overlay',
                  borderRadius: '4px'
                }}
              />
            </a>
          </div>
        </div>
      </header>

      {/* Slim Top Utility Bar */}
      <div className="top-utility-bar">
        <div className="container">
          <div className="utility-bar-inner" style={{ position: 'relative' }}>
            <div className="utility-left hide-mobile">
              <span className="site-views-pill" title="Total website views">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {siteViews === null
                  ? '—'
                  : `${siteViews.toLocaleString()} views`}
              </span>
            </div>
            <div className="utility-center">
              <span className="utility-date">{currentDate}</span>
              <span className="utility-sep" style={{ margin: '0 10px', opacity: 0.5 }}>|</span>
              <span className="utility-time">{currentGmtTime}</span>
            </div>
            <div className="utility-right">
              <div className="utility-edition">
                <span className="edition-label">Edition:</span>
                <span className="edition-value">International (EN)</span>
              </div>
              <span className="utility-sep">|</span>
              <button
                onClick={toggleDarkMode}
                className="utility-theme-btn"
                title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label="Toggle Theme"
              >
                {darkMode ? (
                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.868 0 1.71-.15 2.507-.444a.768.768 0 0 1 1.022.824 8.022 8.022 0 0 1-15.662-2.008zm11.471 4.704a3.208 3.208 0 0 1-3.664-3.664.768.768 0 0 1 .843-.815 5.012 5.012 0 0 0 5.644 5.644.768.768 0 0 1-.823.835z"/>
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
