import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function MeetOurTeam({ layoutProps }) {
  const pageData = useDynamicPage('meet-our-team');

  if (pageData && pageData.content) {
    var blocks = pageData.content.split('\n\n').map(function(b) { return b.trim(); }).filter(Boolean);
    var members = [];
    var closing = [];
    blocks.forEach(function(block) {
      var lines = block.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
      var firstLine = lines[0] || '';
      var dashIndex = firstLine.indexOf('—');
      if (dashIndex !== -1) {
        members.push({
          name: firstLine.slice(0, dashIndex).trim(),
          role: firstLine.slice(dashIndex + 1).trim(),
          description: lines.slice(1).join(' ').trim()
        });
      } else {
        closing.push(block);
      }
    });

    return (
      <Layout {...layoutProps}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            {pageData.title || 'Meet Our Team'}
          </h1>
          <div style={{ display: 'grid', gap: '2rem', marginTop: '1.5rem' }}>
            {members.map(function(m, i) {
              return (
                <div key={i} style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
                  <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>{m.name}</h3>
                  <p><strong>{m.role}</strong>{m.description ? <><br /><span style={{ color: 'var(--text-muted)' }}>{m.description}</span></> : null}</p>
                </div>
              );
            })}
          </div>
          {closing.map(function(c, i) {
            return (
              <p key={i} style={{ marginTop: '2.5rem', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
                {c}
              </p>
            );
          })}
        </div>
      </Layout>
    );
  }

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>Meet Our Team</h1>
        <div style={{ display: 'grid', gap: '2rem', marginTop: '1.5rem' }}>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Ahamed Zumry</h3>
            <p><strong>Founder</strong><br /><span style={{ color: 'var(--text-muted)' }}>Leads the editorial vision and oversees all content published on The One Journal.</span></p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Freya Johnson</h3>
            <p><strong>Co-founder &amp; Managing Editor</strong><br /><span style={{ color: 'var(--text-muted)' }}>Coordinates the editorial team and ensures every article meets quality standards.</span></p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Ayesha Anees</h3>
            <p><strong>Technology Editor</strong><br /><span style={{ color: 'var(--text-muted)' }}>Reports on technology, AI, startups, and digital innovation.</span></p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Ansha Gurung</h3>
            <p><strong>Lifestyle &amp; Culture Writer</strong><br /><span style={{ color: 'var(--text-muted)' }}>Writes features on travel, entertainment, health, and lifestyle.</span></p>
          </div>
          <div style={{ padding: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--border-radius)' }}>
            <h3 style={{ color: 'var(--accent-gold)', marginBottom: '0.5rem' }}>Mohamed Rimzan</h3>
            <p><strong>Social Media Manager</strong><br /><span style={{ color: 'var(--text-muted)' }}>Handles social media strategy and community interaction.</span></p>
          </div>
        </div>
        <p style={{ marginTop: '2.5rem', textAlign: 'center', fontStyle: 'italic', color: 'var(--text-muted)', fontSize: '1.1rem' }}>
          Together, we strive to deliver accurate, timely, and engaging journalism that connects readers across the globe.
        </p>
      </div>
    </Layout>
  );
}
