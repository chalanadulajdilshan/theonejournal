import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function ContactUs({ layoutProps }) {
  const pageData = useDynamicPage('contact-us');

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {pageData?.title || 'CONTACT US'}
        </h1>
        {pageData?.content ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
            {pageData.content.split('\n\n').filter(p => p.trim()).map((p, i) => <p key={i}>{p.trim()}</p>)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
            <p style={{ fontSize: '1.1rem', fontWeight: '500' }}>Welcome to The One Journal</p>
            <p>We believe great journalism begins with great conversations. Whether you have breaking news, feedback, a business inquiry, or simply want to connect with our team, we're here to listen.</p>
            <h3 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>General Support / Advertising & Sponsorships / Partnerships & Business</h3>
            <p><strong>hello@theonejournal.org</strong></p>
            <h3 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Editorial Desk</h3>
            <p><strong>admin@theonejournal.org</strong></p>
            <p style={{ marginTop: '1.5rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>Our editorial team values transparency, integrity, and professionalism in every interaction. Thank you for helping us build a trusted global news platform.</p>
            <div style={{ marginTop: '2rem', padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)', textAlign: 'center' }}>
              <p style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: '0.5rem' }}>The One Journal</p>
              <p style={{ color: 'var(--accent-gold)' }}>Connecting The World Together</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
