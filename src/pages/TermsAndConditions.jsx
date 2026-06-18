import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function TermsAndConditions({ layoutProps }) {
  const pageData = useDynamicPage('terms-and-conditions');

  if (pageData && pageData.content) {
    return (
      <Layout {...layoutProps}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            {pageData.title || 'Terms and Conditions'}
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
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>Terms and Conditions</h1>
        <p><strong>Effective Date:</strong> June 15, 2026<br /><strong>Last Updated:</strong> June 16, 2026</p>
        <p>Welcome to The One Journal. By accessing or using our website, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree with any part of these terms, please discontinue using our website.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Acceptable Use</h2>
        <p>You agree not to use the website for unlawful purposes, copy or scrape content using automated tools, upload malware or harmful code, misrepresent your identity, or violate the rights of others.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Intellectual Property</h2>
        <p>All content on The One Journal, including articles, text, images, videos, graphics, logos, designs, and website layout is owned by or licensed to The One Journal and protected by applicable copyright and intellectual property laws. Unauthorized copying, reproduction, distribution, or commercial use without written permission is prohibited.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Accuracy of Information</h2>
        <p>While we strive for accuracy, news stories may evolve and information may change over time. We do not guarantee that all content is complete, current, or error-free.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Third-Party Links</h2>
        <p>Our website may include links to external websites. The One Journal is not responsible for the content, policies, or practices of those third-party sites.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Limitation of Liability</h2>
        <p>To the fullest extent permitted by law, The One Journal, its owners, editors, employees, and affiliates shall not be liable for direct or indirect damages, financial losses, data loss, business interruption, or decisions made based on published content. Use of the website is entirely at your own risk.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Changes to These Terms</h2>
        <p>We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Continued use of the website after changes are posted constitutes acceptance of the revised terms.</p>
        <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Contact Us</h2>
        <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--border-radius)', marginTop: '1rem' }}>
          <p><strong>The One Journal</strong><br />Email: hello@theonejournal.org<br />Website: https://theonejournal.org</p>
        </div>
        <p style={{ marginTop: '1rem', fontStyle: 'italic', color: 'var(--text-muted)' }}>By using The One Journal, you acknowledge that you have read and agreed to these Terms and Conditions.</p>
      </div>
    </Layout>
  );
}
