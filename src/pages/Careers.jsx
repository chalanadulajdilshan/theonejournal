import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function Careers({ layoutProps }) {
  const pageData = useDynamicPage('careers');

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {pageData?.title || 'Careers at The One Journal'}
        </h1>
        {pageData?.content ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
            {pageData.content.split('\n\n').filter(p => p.trim()).map((p, i) => <p key={i}>{p.trim()}</p>)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
            <p>Excellence begins with exceptional people.</p>
            <p>The One Journal is a premium news and media platform dedicated to delivering trusted journalism, insightful analysis, and compelling stories. Our success is driven by professionals who share our commitment to quality and innovation.</p>
            <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Why Join Us?</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Work with a passionate and professional editorial team</li>
              <li>Publish content that reaches a global audience</li>
              <li>Flexible and remote-friendly opportunities</li>
              <li>Continuous learning and career growth</li>
              <li>A culture that values creativity and integrity</li>
            </ul>
            <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Open Positions</h2>
            <ul style={{ paddingLeft: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <li>Freelance Writer</li>
              <li>News Editor</li>
              <li>Content Strategist</li>
              <li>Journalist</li>
              <li>Marketing Executive</li>
              <li>Photographer</li>
              <li>Video Producer</li>
            </ul>
            <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Start Your Journey</h2>
            <p>Tell us about yourself and share your best work at <strong>hello@theonejournal.org</strong></p>
            <p>Together, let's build the future of premium journalism.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
