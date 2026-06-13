import React, { useState } from 'react';

export default function MainNavbar({ onSearchChange, searchVal }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeMobileSub, setActiveMobileSub] = useState(null);

  const categories = [
    {
      name: 'SL',
      subcategories: ['Transport', 'Crime', 'Education', 'Legal', 'Weather']
    },
    {
      name: 'World',
      subcategories: ['GCC', 'Asia', 'Supplements']
    },
    {
      name: 'Business',
      subcategories: ['Program', 'Investing', 'Real Estate', 'Energy', 'Aviation', 'Leadership']
    },
    {
      name: 'Tech',
      subcategories: ['BTR']
    },
    {
      name: 'Life',
      subcategories: ['Sports', 'Entertainment', 'Food', 'Travel', 'Beauty & Health', 'Fashion']
    },
    {
      name: 'Events',
      subcategories: []
    },
    {
      name: 'Subscription',
      subcategories: ['Remote Jobs', 'Freelance Projects', 'Work From Home']
    }
  ];

  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      onSearchChange('');
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
  };

  const handleMobileSubToggle = (idx) => {
    if (activeMobileSub === idx) {
      setActiveMobileSub(null);
    } else {
      setActiveMobileSub(idx);
    }
  };

  return (
    <div className="navbar-wrapper">
      <div className="container">
        <nav className="navbar-main">
          {/* Logo on Left */}
          <div className="navbar-logo-container">
            <a href="/" className="logo-link">
              <svg className="logo-icon-svg" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
              </svg>
              <h1 className="logo-text">
                SL <span>NEWS</span>
              </h1>
            </a>
          </div>

          {/* Desktop Categories Menu */}
          <ul className="nav-menu hide-mobile">
            {categories.map((cat, idx) => (
              <li key={idx} className="nav-item">
                <a href={`#section-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`} className="nav-link">
                  {cat.name}
                  {cat.subcategories.length > 0 && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginLeft: '4px'}}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </a>
                
                {cat.subcategories.length > 0 && (
                  <ul className="nav-dropdown">
                    {cat.subcategories.map((sub, subIdx) => (
                      <li key={subIdx}>
                        <a href="#" className="dropdown-link">{sub}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          {/* Search Trigger and Mobile hamburger */}
          <div className="navbar-actions">
            <button 
              onClick={toggleSearch} 
              className="search-trigger-btn"
              aria-label="Toggle Search"
              title="Search articles"
            >
              {isSearchOpen ? (
                /* Close icon */
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                /* Search icon */
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              )}
            </button>

            <button 
              onClick={() => setIsMobileDrawerOpen(true)} 
              className="mobile-menu-btn hide-desktop"
              aria-label="Open Menu"
            >
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Search Input Bar Overlay */}
      {isSearchOpen && (
        <div className="search-overlay-bar">
          <div className="container">
            <form onSubmit={handleSearchSubmit} className="search-form-container">
              <input 
                type="text" 
                placeholder="Search breaking news, lifestyle stories, or partner content..." 
                className="search-input-field"
                value={searchVal}
                onChange={(e) => onSearchChange(e.target.value)}
                autoFocus
              />
              <button 
                type="button" 
                onClick={() => { onSearchChange(''); toggleSearch(); }} 
                className="search-close-btn"
              >
                Clear & Close
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Drawer Navigation Menu */}
      {isMobileDrawerOpen && (
        <div className="mobile-drawer-overlay" onClick={() => setIsMobileDrawerOpen(false)} />
      )}
      <div className={`mobile-drawer ${isMobileDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <h2 className="logo-text">SL <span>NEWS</span></h2>
          <button onClick={() => setIsMobileDrawerOpen(false)} className="drawer-close-btn" aria-label="Close Menu">
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <ul className="drawer-menu">
          {categories.map((cat, idx) => (
            <li key={idx} className="drawer-item">
              <div 
                className="drawer-link" 
                onClick={() => cat.subcategories.length > 0 ? handleMobileSubToggle(idx) : setIsMobileDrawerOpen(false)}
              >
                <a 
                  href={`#section-${cat.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={(e) => {
                    if (cat.subcategories.length > 0) {
                      e.preventDefault();
                    } else {
                      setIsMobileDrawerOpen(false);
                    }
                  }}
                >
                  {cat.name}
                </a>
                {cat.subcategories.length > 0 && (
                  <button className="drawer-sub-btn">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{ transform: activeMobileSub === idx ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <path d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {cat.subcategories.length > 0 && activeMobileSub === idx && (
                <ul className="drawer-subcategories">
                  {cat.subcategories.map((sub, subIdx) => (
                    <li key={subIdx}>
                      <a href="#" className="drawer-sub-link" onClick={() => setIsMobileDrawerOpen(false)}>{sub}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
