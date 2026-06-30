import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

const DEFAULT_CONTENT = `The information published on The One Journal is provided for general informational and educational purposes only. While we strive to ensure that all content is accurate and up to date, we make no representations or warranties of any kind regarding the completeness, reliability, or accuracy of the information.

Any action you take based on the information found on this website is strictly at your own risk. The One Journal shall not be held liable for any losses or damages arising from the use of our website.

The views and opinions expressed in articles written by contributors or guest authors are their own and do not necessarily reflect the official position of The One Journal.

We reserve the right to modify, update, or remove content without prior notice.

Editorial Disclaimer
The One Journal is an independent news and media platform committed to providing timely news, opinions, and analysis.

Although every effort is made to verify facts before publication, errors or omissions may occasionally occur. Readers are encouraged to verify critical information through official sources before making decisions based on our content.

Opinions expressed in editorials, interviews, or contributed articles belong solely to the respective authors and should not be interpreted as endorsements by The One Journal.

Financial Information Disclaimer
Some articles published on The One Journal may discuss financial markets, cryptocurrencies, stocks, or investments.

The information provided is for educational and informational purposes only and should not be considered financial, investment, legal, or tax advice. Readers should consult qualified professionals before making investment decisions.

External Links
Our website may contain links to third-party websites for reference or convenience.

We do not control, endorse, or guarantee the accuracy, availability, or content of external websites. Visiting third-party sites is done entirely at your own risk.

Copyright Notice
Unless otherwise stated, all original content published on The One Journal, including text, graphics, logos, and multimedia, is protected by copyright laws.

Unauthorized reproduction, distribution, or republication of our content without prior written permission is prohibited.`;

function isHeading(line) {
  const words = line.split(/\s+/).filter(Boolean);
  return words.length > 0 && words.length <= 6 && line.length <= 50 && !/[.]$/.test(line) && /^[A-Z0-9]/.test(line);
}

function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export default function Disclaimer({ layoutProps }) {
  const pageData = useDynamicPage('disclaimer');

  const content = (pageData && pageData.content) ? pageData.content : DEFAULT_CONTENT;
  const title = (pageData && pageData.title) ? pageData.title : 'Disclaimer';

  const blocks = content.split('\n\n').map(function(b) { return b.trim(); }).filter(Boolean);

  const intro = [];
  const sections = [];
  let current = null;

  blocks.forEach(function(block) {
    const lines = block.split('\n').map(function(l) { return l.trim(); }).filter(Boolean);
    const first = lines[0] || '';

    if (isHeading(first)) {
      current = { title: first, paragraphs: [] };
      const rest = lines.slice(1).join(' ').trim();
      if (rest) current.paragraphs.push(rest);
      sections.push(current);
    } else if (current) {
      current.paragraphs.push(block.split('\n').join(' '));
    } else {
      intro.push(block.split('\n').join(' '));
    }
  });

  return (
    <Layout {...layoutProps}>
      <style>{`
        .disc-callout {
          background-color: var(--bg-secondary);
          border-left: 4px solid var(--accent-gold);
          border-radius: var(--border-radius);
          padding: 1.6rem 1.85rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          line-height: 1.8;
        }
        .disc-section {
          display: flex;
          gap: 1.1rem;
          padding: 1.5rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .disc-section:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
        }
        .disc-section__badge {
          flex-shrink: 0;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          background-color: var(--accent-gold);
          color: #fff;
        }
        .disc-section__title {
          color: var(--accent-gold);
          margin: 0 0 0.6rem 0;
          font-size: 1.2rem;
        }
        .disc-section__body {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          line-height: 1.8;
        }
        .disc-section__body p {
          margin: 0;
        }
      `}</style>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {title}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {intro.length > 0 && (
            <div className="disc-callout">
              {intro.map(function(p, i) {
                return (
                  <p key={i} style={i === 0
                    ? { margin: 0, fontWeight: 500 }
                    : { margin: 0 }}>
                    {p}
                  </p>
                );
              })}
            </div>
          )}

          {sections.map(function(section, i) {
            return (
              <div key={i} className="disc-section">
                <span className="disc-section__badge"><ShieldIcon /></span>
                <div>
                  <h2 className="disc-section__title">{section.title}</h2>
                  <div className="disc-section__body">
                    {section.paragraphs.map(function(p, j) { return <p key={j}>{p}</p>; })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
