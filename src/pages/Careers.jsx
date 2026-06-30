import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

const DEFAULT_CONTENT = `Excellence begins with exceptional people.

The One Journal is a premium news and media platform dedicated to delivering trusted journalism, insightful analysis, and compelling stories. Our success is driven by professionals who share our commitment to quality and innovation.

Why Join Us? - Work with a passionate and professional editorial team - Publish content that reaches a global audience - Flexible and remote-friendly opportunities - Continuous learning and career growth - A culture that values creativity and integrity

Open Positions: - Freelance Writer - News Editor - Content Strategist - Journalist - Marketing Executive - Photographer - Video Producer

Start Your Journey Tell us about yourself and share your best work at hello@theonejournal.org

Together, let's build the future of premium journalism.`;

const EMAIL_GLOBAL = /([\w.+-]+@[\w-]+\.[\w.-]+)/g;
const EMAIL_ONE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const EMAIL_EXACT = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;

function linkify(text) {
  return text.split(EMAIL_GLOBAL).map(function(part, i) {
    if (EMAIL_EXACT.test(part)) {
      return <a key={i} href={'mailto:' + part} style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{part}</a>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function Careers({ layoutProps }) {
  const pageData = useDynamicPage('careers');

  const content = (pageData && pageData.content) ? pageData.content : DEFAULT_CONTENT;
  const title = (pageData && pageData.title) ? pageData.title : 'Careers at The One Journal';

  const blocks = content.split('\n\n').map(function(b) { return b.trim(); }).filter(Boolean);
  let firstParaDone = false;

  return (
    <Layout {...layoutProps}>
      <style>{`
        .career-heading {
          color: var(--accent-gold);
          margin: 0 0 1rem 0;
          font-size: 1.4rem;
        }
        .benefit-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
        }
        .benefit-item {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          padding: 1.1rem 1.25rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          line-height: 1.6;
        }
        .benefit-item__icon {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background-color: var(--accent-gold);
          color: #fff;
          margin-top: 2px;
        }
        .job-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 0.75rem;
        }
        .job-chip {
          padding: 0.6rem 1.2rem;
          background-color: var(--bg-secondary);
          border: 1px solid var(--accent-gold);
          border-radius: 999px;
          font-weight: 500;
          transition: transform 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        .job-chip:hover {
          transform: translateY(-2px);
          background-color: var(--accent-gold);
          color: #fff;
        }
        .cta-card {
          padding: 2rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          line-height: 1.8;
        }
        .cta-button {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 1rem;
          padding: 0.7rem 1.5rem;
          background-color: var(--accent-gold);
          color: #fff;
          text-decoration: none;
          border-radius: var(--border-radius);
          font-weight: 600;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {title}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {blocks.map(function(block, i) {
            const singleLine = block.split('\n').join(' ').trim();

            // Call-to-action block (contains an email)
            if (EMAIL_ONE.test(singleLine)) {
              const email = singleLine.match(EMAIL_ONE)[0];
              return (
                <div key={i} className="cta-card">
                  <p style={{ margin: 0 }}>{linkify(singleLine)}</p>
                  <a className="cta-button" href={'mailto:' + email}>Apply via Email</a>
                </div>
              );
            }

            // List block: "Heading - item - item - item"
            if (/\s-\s/.test(singleLine)) {
              const parts = singleLine.split(/\s+-\s+/).map(function(s) { return s.trim(); }).filter(Boolean);
              const heading = parts[0];
              const items = parts.slice(1);
              const isPositions = /position/i.test(heading);
              return (
                <div key={i}>
                  <h2 className="career-heading">{heading}</h2>
                  {isPositions ? (
                    <div className="job-chips">
                      {items.map(function(item, j) { return <span key={j} className="job-chip">{item}</span>; })}
                    </div>
                  ) : (
                    <div className="benefit-grid">
                      {items.map(function(item, j) {
                        return (
                          <div key={j} className="benefit-item">
                            <span className="benefit-item__icon"><CheckIcon /></span>
                            <span>{item}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Plain paragraph (first is rendered as a lead tagline)
            const isLead = !firstParaDone;
            firstParaDone = true;
            return (
              <p key={i} style={isLead
                ? { margin: 0, fontSize: '1.3rem', fontWeight: 600, color: 'var(--accent-gold)' }
                : { margin: 0, lineHeight: '1.8' }}>
                {linkify(singleLine)}
              </p>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
