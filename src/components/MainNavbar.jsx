import React, { useState } from 'react';

// The "Advertise With Us" menu links to dedicated marketing pages (not article
// categories), so it stays static and is appended after the dynamic categories.
const ADVERTISE_ITEM = {
  name: 'Advertise With Us',
  hash: '#advertise',
  advertise: true,
  subcategories: [
    { name: 'Partner Content', hash: '#partner-content' },
    { name: 'Display Banner Ads', hash: '#display-banner' },
    { name: 'Social Media Promotion', hash: '#social-media' },
    { name: 'Add-On Service', hash: '#add-on-service' },
    { name: 'Rates & Pricing', hash: '#rates-pricing' },
  ],
};

export default function MainNavbar({ onSearchChange, searchVal, categories: backendCategories }) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [activeMobileSub, setActiveMobileSub] = useState(null);

  // Build the menu fully from the admin-managed categories & sub-tags,
  // then append the static "Advertise With Us" marketing menu.
  const categories = [
    ...(backendCategories || []).map((cat) => ({
      name: cat.name,
      // Top-level item scrolls to that category's section on the homepage
      hash: `#section-${cat.slug}`,
      subcategories: (cat.subcategories || []).map((sub) => ({
        name: sub.name,
        hash: `#category-${cat.slug}`,
      })),
    })),
    ADVERTISE_ITEM,
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
      {/* Home link pinned to the far-left corner (desktop) */}
      <a
        href="/"
        className="nav-home-btn hide-mobile"
        aria-label="Home"
        onClick={(e) => {
          e.preventDefault();
          onSearchChange('');
          window.location.hash = '';
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      >
        <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
          <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5a.5.5 0 0 0 .5-.5v-4h2v4a.5.5 0 0 0 .5.5H14a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.354 1.146zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H10v-4a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5v4H2.5z" />
        </svg>
        Home
      </a>
      <div className="container">
        <nav className="navbar-main">
          {/* Mobile hamburger on left */}
          <button
            onClick={() => setIsMobileDrawerOpen(true)}
            className="mobile-menu-btn hide-desktop"
            aria-label="Open Menu"
          >
            <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Desktop Categories Menu - Centered */}
          <ul className="nav-menu hide-mobile">
            {categories.map((cat, idx) => (
              <li key={idx} className={`nav-item${cat.advertise ? ' advertise-item' : ''}`}>
                <a href={cat.hash} className="nav-link">
                  {cat.name}
                  {cat.subcategories.length > 0 && (
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" style={{marginLeft: '3px'}}>
                      <path d="M6 9l6 6 6-6" />
                    </svg>
                  )}
                </a>

                {cat.subcategories.length > 0 && (
                  <ul className="nav-dropdown">
                    {cat.subcategories.map((sub, subIdx) => (
                      <li key={subIdx}>
                        <a href={sub.hash} className="dropdown-link">{sub.name}</a>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

        </nav>
      </div>

      {/* Search + Back — pinned to the far-right corner of the full-width bar */}
      <div className="navbar-actions">
        <button
          onClick={toggleSearch}
          className="search-trigger-btn"
          aria-label="Toggle Search"
          title="Search articles"
        >
          {isSearchOpen ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </button>

        {/* Back to previous page (only on sub-pages) — icon only */}
        {window.location.hash && (
          <button
            onClick={() => { if (window.history.length > 1) window.history.back(); else { window.location.hash = ''; } }}
            className="nav-back-btn"
            aria-label="Go to previous page"
            title="Go back"
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}
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
          <h2 className="drawer-brand-title">THE ONE <span>JOURNAL</span></h2>
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
                  href={cat.hash}
                  onClick={() => setIsMobileDrawerOpen(false)}
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
                      <a href={sub.hash} className="drawer-sub-link" onClick={() => setIsMobileDrawerOpen(false)}>{sub.name}</a>
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
