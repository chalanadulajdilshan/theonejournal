import React, { useState, useEffect } from 'react';
import { useI18n } from '../i18n/I18nContext';

const logoImage = '/logo.webp';

export default function TopHeader({ darkMode, toggleDarkMode, siteViews }) {
  const { t, intlLocale, locale } = useI18n();
  const [currentDate, setCurrentDate] = useState('');
  const [currentGmtTime, setCurrentGmtTime] = useState('');
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [shine, setShine] = useState({ x: 50, y: 50, opacity: 0 });

  useEffect(() => {
    const dateOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

    const updateTime = () => {
      const now = new Date();
      setCurrentDate(now.toLocaleDateString(intlLocale, dateOptions));

      const timeOptions = {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'GMT',
        timeZoneName: 'short'
      };
      setCurrentGmtTime(now.toLocaleTimeString(intlLocale, timeOptions));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [intlLocale]);

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
                decoding="sync"
                loading="eager"
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
            <div className="utility-left hide-mobile" />
            <div className="utility-center">
              <span className="utility-date">{currentDate}</span>
              <span className="utility-sep" style={{ margin: '0 10px', opacity: 0.5 }}>|</span>
              <span className="utility-time">{currentGmtTime}</span>
            </div>
            <div className="utility-right">
              <span className="site-views-pill" title={t('home.totalViews')}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                {siteViews === null
                  ? '—'
                  : `${siteViews.toLocaleString(intlLocale)} ${t('home.views')}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
