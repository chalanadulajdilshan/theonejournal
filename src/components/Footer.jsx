import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const footerLogo = '/footer_logo.webp';

export default function Footer({ categories = [] }) {
  const { t, localized } = useI18n();
  const socialLinks = [
    { 
      label: 'Facebook', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z"/>
        </svg>
      ), 
      url: '#' 
    },
    { 
      label: 'Twitter', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ), 
      url: '#' 
    },
    { 
      label: 'Instagram', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
        </svg>
      ), 
      url: '#' 
    },
    { 
      label: 'LinkedIn', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ), 
      url: '#' 
    },
    { 
      label: 'YouTube', 
      icon: (
        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.53 3.545 12 3.545 12 3.545s-7.53 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.017 0 12 0 12s0 3.983.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.858.507 9.388.507 9.388.507s7.53 0 9.388-.507a3.003 3.003 0 0 0 2.11-2.11C24 15.983 24 12 24 12s0-3.983-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ), 
      url: '#' 
    }
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
            <use href="#gentle-wave" x="48" y="0" fill="rgba(59, 130, 246, 0.08)" />
            <use href="#gentle-wave" x="48" y="3" fill="rgba(255, 215, 0, 0.35)" />
            <use href="#gentle-wave" x="48" y="5" fill="rgba(255, 255, 255, 0.6)" />
            <use href="#gentle-wave" x="48" y="7" fill="#f4f7fa" />
          </g>
        </svg>
      </div>

      <div className="container" style={{ paddingTop: '0.5rem', position: 'relative', zIndex: 2 }}>
        {/* Upper Brand Row */}
        <div className="footer-upper-brand-row">
          <div className="footer-upper-links">
            {categories.map((cat, idx) => (
              <React.Fragment key={cat.id}>
                {idx > 0 && <span className="divider">|</span>}
                <a href={`#category-${cat.slug}`}>{localized(cat)}</a>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Brand Divider */}
        <div className="footer-brand-divider" />

        <div className="footer-top-row">
          {/* Brand info */}
          <div className="footer-brand">
            <img src={footerLogo} alt="The One Journal Crest Logo" className="footer-crest-logo" width="130" height="130" loading="lazy" decoding="async" />
            <p className="footer-desc">
              {t('footer.description')}
            </p>
            <div className="footer-social-row">
              {socialLinks.map((social, idx) => (
                <a key={idx} href={social.url} className="social-circle-btn" aria-label={`Follow us on ${social.label}`}>
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Other sections */}
          <div className="footer-col footer-col-sections">
            <h3 className="footer-col-title">{t('footer.otherSections')}</h3>
            <ul className="footer-links-list">
              <li><a href="#about-us">{t('footer.aboutUs')}</a></li>
              <li><a href="#careers">{t('footer.careers')}</a></li>
              <li><a href="#privacy-policy">{t('footer.privacyPolicy')}</a></li>
              <li><a href="#terms-and-conditions">{t('footer.terms')}</a></li>
            </ul>
          </div>

          {/* Company links (heading hidden, kept for column alignment) */}
          <div className="footer-col footer-col-company">
            <h3 className="footer-col-title footer-col-title-hidden">{t('footer.company')}</h3>
            <ul className="footer-links-list">
              <li><a href="#contact-us">{t('footer.contactUs')}</a></li>
              <li><a href="#advertise">{t('footer.advertise')}</a></li>
              <li><a href="#meet-our-team">{t('footer.meetTeam')}</a></li>
              <li><a href="#disclaimer">{t('footer.disclaimer')}</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom Strip */}
      <div className="footer-bottom-strip">
        <div className="container">
          <div className="footer-bottom-row">
            <span>&copy; {new Date().getFullYear()} The One Journal. {t('footer.rights')}</span>
            <div style={{display: 'flex', gap: '1rem'}}>
              <a href="#">{t('footer.backToTop')}</a>
              <span>&bull;</span>
              <a href="#">{t('footer.siteMap')}</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
