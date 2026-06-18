import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function PrivacyPolicy({ layoutProps }) {
  const pageData = useDynamicPage('privacy-policy');

  if (pageData && pageData.content) {
    return (
      <Layout {...layoutProps}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            {pageData.title || 'Privacy Policy'}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pageData.content.split('\n\n').filter(function(p) { return p.trim(); }).map(function(p, i) { return <p key={i}>{p.trim()}</p>; })}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>Privacy Policy</h1>
        <p><strong>Effective Date:</strong> [01/06/2025]<br /><strong>Last Updated:</strong> [15/06/2025]</p>
        <p>Welcome to The One Journal. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.</p>
        <p>By accessing or using The One Journal, you agree to the practices described in this Privacy Policy.</p>
        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.2 }} />
        <h2 style={{ color: 'var(--accent-gold)' }}>1. Information We Collect</h2>
        <p>We may collect personal information that you voluntarily provide, including full name, email address, phone number, contact information submitted through forms, newsletter subscription details, and comments or feedback.</p>
        <h2 style={{ color: 'var(--accent-gold)' }}>2. How We Use Your Information</h2>
        <p>We may use collected information to operate and maintain our website, publish and improve news and editorial content, respond to inquiries, send newsletters and updates (with consent), personalize user experience, analyze website traffic, prevent fraud, and comply with legal obligations.</p>
        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.2 }} />
        <h2 style={{ color: 'var(--accent-gold)' }}>3. Cookies and Tracking Technologies</h2>
        <p>The One Journal uses cookies and similar technologies to enhance user experience. Users may disable cookies through browser settings; however, certain features may not function properly.</p>
        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.2 }} />
        <h2 style={{ color: 'var(--accent-gold)' }}>4. Data Security</h2>
        <p>We implement commercially reasonable administrative, technical, and organizational measures to protect your information against unauthorized access, disclosure, alteration, or destruction.</p>
        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.2 }} />
        <h2 style={{ color: 'var(--accent-gold)' }}>5. Changes to This Privacy Policy</h2>
        <p>We reserve the right to modify this Privacy Policy at any time. Continued use of the website constitutes acceptance of the updated policy.</p>
        <hr style={{ margin: '2rem 0', borderColor: 'var(--border-color)', opacity: 0.2 }} />
        <h2 style={{ color: 'var(--accent-gold)' }}>6. Contact Us</h2>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
          <p><strong>The One Journal</strong><br />Email: hello@theonejournal.org<br />Website: https://www.theonejournal.org</p>
        </div>
      </div>
    </Layout>
  );
}
