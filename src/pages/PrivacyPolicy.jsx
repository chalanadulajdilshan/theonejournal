import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

const DEFAULT_CONTENT = `Effective Date: 01/06/2025 | Last Updated: 15/06/2025

Welcome to The One Journal. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

By accessing or using The One Journal, you agree to the practices described in this Privacy Policy.

1. Information We Collect
We may collect personal information that you voluntarily provide, including full name, email address, phone number, contact information submitted through forms, newsletter subscription details, and comments or feedback.

2. How We Use Your Information
We may use collected information to operate and maintain our website, publish and improve news and editorial content, respond to inquiries, send newsletters and updates (with consent), personalize user experience, analyze website traffic, prevent fraud, and comply with legal obligations.

3. Cookies and Tracking Technologies
The One Journal uses cookies and similar technologies to enhance user experience. Users may disable cookies through browser settings; however, certain features may not function properly.

4. Data Security
We implement commercially reasonable administrative, technical, and organizational measures to protect your information against unauthorized access, disclosure, alteration, or destruction.

5. Changes to This Privacy Policy
We reserve the right to modify this Privacy Policy at any time. Continued use of the website constitutes acceptance of the updated policy.

6. Contact Us
The One Journal
Email: hello@theonejournal.org
Website: https://www.theonejournal.org`;

const EMAIL_RE = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

function linkify(text) {
  return text.split(/([\w.+-]+@[\w-]+\.[\w.-]+)/g).map(function(part, i) {
    if (EMAIL_RE.test(part)) {
      return <a key={i} href={'mailto:' + part} style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{part}</a>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

export default function PrivacyPolicy({ layoutProps }) {
  const pageData = useDynamicPage('privacy-policy');

  const content = (pageData && pageData.content) ? pageData.content : DEFAULT_CONTENT;
  const title = (pageData && pageData.title) ? pageData.title : 'Privacy Policy';

  const blocks = content.split('\n\n').map(function(b) { return b.trim(); }).filter(Boolean);
  let firstParaDone = false;

  return (
    <Layout {...layoutProps}>
      <style>{`
        .policy-card {
          display: flex;
          gap: 1.1rem;
          padding: 1.5rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .policy-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        .policy-card__badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: var(--accent-gold);
          color: #fff;
          font-weight: 700;
          font-size: 1.05rem;
        }
        .policy-card__title {
          color: var(--accent-gold);
          margin: 0 0 0.4rem 0;
          font-size: 1.2rem;
        }
      `}</style>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {title}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {blocks.map(function(block, i) {
            const lines = block.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
            const first = lines[0] || '';

            // Effective / Last Updated meta bar
            if (/effective date|last updated/i.test(first)) {
              return (
                <div key={i} style={{ display: 'inline-block', alignSelf: 'flex-start', padding: '0.6rem 1.1rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', borderLeft: '3px solid var(--accent-gold)', fontSize: '0.95rem', color: 'var(--text-muted)' }}>
                  {block.split('\n').join(' ')}
                </div>
              );
            }

            // Numbered section -> card with badge
            const numMatch = first.match(/^(\d+)\.\s+(.*)$/);
            if (numMatch) {
              const number = numMatch[1];
              const hasSeparateTitle = lines.length > 1;
              const cardTitle = hasSeparateTitle ? numMatch[2] : '';
              const body = hasSeparateTitle ? lines.slice(1).join(' ') : numMatch[2];
              return (
                <div key={i} className="policy-card">
                  <span className="policy-card__badge">{number}</span>
                  <div>
                    {cardTitle ? <h2 className="policy-card__title">{cardTitle}</h2> : null}
                    <p style={{ margin: 0 }}>{linkify(body)}</p>
                  </div>
                </div>
              );
            }

            // Intro / general paragraphs (first one rendered as a lead)
            const isLead = !firstParaDone;
            firstParaDone = true;
            return (
              <p key={i} style={isLead
                ? { margin: 0, fontSize: '1.15rem', fontWeight: 500 }
                : { margin: 0 }}>
                {linkify(block.split('\n').join(' '))}
              </p>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
