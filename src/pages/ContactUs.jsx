import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

const DEFAULT_CONTENT = `Welcome to The One Journal

We believe great journalism begins with great conversations. Whether you have breaking news, feedback, a business inquiry, or simply want to connect with our team, we're here to listen.

General Support / Advertising & Sponsorships / Partnerships & Business: hello@theonejournal.org

Editorial Desk: admin@theonejournal.org

Our editorial team values transparency, integrity, and professionalism in every interaction. Thank you for helping us build a trusted global news platform.`;

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/;

function EnvelopeIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-10 6L2 7" />
    </svg>
  );
}

export default function ContactUs({ layoutProps }) {
  const pageData = useDynamicPage('contact-us');

  const content = (pageData && pageData.content) ? pageData.content : DEFAULT_CONTENT;
  const title = (pageData && pageData.title) ? pageData.title : 'CONTACT US';

  const blocks = content.split('\n\n').map(b => b.trim()).filter(Boolean);
  const intro = [];
  const contacts = [];
  const closing = [];
  let seenContact = false;

  blocks.forEach(block => {
    const match = block.match(EMAIL_RE);
    if (match) {
      seenContact = true;
      const email = match[0];
      let label = block.slice(0, block.indexOf(email)).replace(/[:\-–—]\s*$/, '').trim();
      if (!label) label = 'Email Us';
      contacts.push({ label, email });
    } else if (!seenContact) {
      intro.push(block);
    } else {
      closing.push(block);
    }
  });

  return (
    <Layout {...layoutProps}>
      <style>{`
        .contact-card {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          padding: 1.6rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .contact-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12);
        }
        .contact-card__icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: rgba(0, 0, 0, 0.04);
          color: var(--accent-gold);
        }
        .contact-card__label {
          font-weight: 600;
          line-height: 1.5;
        }
        .contact-card__email {
          color: var(--accent-gold);
          font-weight: 700;
          word-break: break-all;
        }
      `}</style>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {title}
        </h1>

        {intro.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8', marginBottom: '2.5rem' }}>
            {intro.map((p, i) =>
              i === 0 ? (
                <p key={i} style={{ fontSize: '1.4rem', fontWeight: 600, color: 'var(--accent-gold)', margin: 0 }}>{p}</p>
              ) : (
                <p key={i} style={{ margin: 0 }}>{p}</p>
              )
            )}
          </div>
        )}

        {contacts.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem' }}>
            {contacts.map((c, i) => (
              <a key={i} href={`mailto:${c.email}`} className="contact-card">
                <span className="contact-card__icon"><EnvelopeIcon /></span>
                <span className="contact-card__label">{c.label}</span>
                <span className="contact-card__email">{c.email}</span>
              </a>
            ))}
          </div>
        )}

        {closing.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8', marginTop: '2.5rem' }}>
            {closing.map((p, i) => (
              <p key={i} style={{ margin: 0, fontStyle: 'italic', color: 'var(--text-muted)' }}>{p}</p>
            ))}
          </div>
        )}

        <div style={{ marginTop: '2.5rem', padding: '1.75rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
          <p style={{ fontWeight: 'bold', fontSize: '1.3rem', marginBottom: '0.4rem' }}>The One Journal</p>
          <p style={{ color: 'var(--accent-gold)', margin: 0, letterSpacing: '0.5px' }}>Connecting The World Together</p>
        </div>
      </div>
    </Layout>
  );
}
