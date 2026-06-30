import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

const DEFAULT_CONTENT = `The One Journal is an independent digital news and media platform founded in 2026 by Small Team of Freelancers based in GCC dedicated to connecting people with the stories that shape our world.

Reach our engaged global audience through targeted advertising opportunities tailored to your brand.

Partner Content — Sponsored articles and brand features written by our editorial team.

Display Banner Ads — Premium banner placements across high-traffic sections of the website.

Social Media Promotion — Amplify your message through our social media channels.

Newsletter Advertisements — Reach our subscriber base directly in their inbox.

Rates & Pricing — Competitive pricing packages for every budget and campaign goal.

To request a quote or discuss partnership opportunities, please contact us at hello@theonejournal.org`;

const EMAIL_GLOBAL = /([\w.+-]+@[\w-]+\.[\w.-]+)/g;
const EMAIL_ONE = /[\w.+-]+@[\w-]+\.[\w.-]+/;
const EMAIL_EXACT = /^[\w.+-]+@[\w-]+\.[\w.-]+$/;
const OPTION_RE = /^(.+?)\s[—–-]\s(.+)$/;

function linkify(text) {
  return text.split(EMAIL_GLOBAL).map(function(part, i) {
    if (EMAIL_EXACT.test(part)) {
      return <a key={i} href={'mailto:' + part} style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>{part}</a>;
    }
    return <React.Fragment key={i}>{part}</React.Fragment>;
  });
}

function MegaphoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m3 11 18-5v12L3 14v-3z" />
      <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" />
    </svg>
  );
}

export default function Advertise({ layoutProps }) {
  const pageData = useDynamicPage('advertise');

  const content = (pageData && pageData.content) ? pageData.content : DEFAULT_CONTENT;
  const title = (pageData && pageData.title) ? pageData.title : 'ADVERTISE WITH US';

  const blocks = content.split('\n\n').map(function(b) { return b.trim(); }).filter(Boolean);

  const intro = [];
  const options = [];
  const closing = [];
  let seenOption = false;
  let firstIntroDone = false;

  blocks.forEach(function(block) {
    const singleLine = block.split('\n').join(' ').trim();

    if (EMAIL_ONE.test(singleLine)) {
      seenOption = true;
      closing.push({ type: 'cta', text: singleLine, email: singleLine.match(EMAIL_ONE)[0] });
      return;
    }
    const optMatch = singleLine.match(OPTION_RE);
    if (optMatch && !/[.]$/.test(optMatch[1])) {
      seenOption = true;
      options.push({ name: optMatch[1].trim(), desc: optMatch[2].trim() });
      return;
    }
    if (!seenOption) {
      intro.push(singleLine);
    } else {
      closing.push({ type: 'p', text: singleLine });
    }
  });

  return (
    <Layout {...layoutProps}>
      <style>{`
        .ad-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
          gap: 1.25rem;
        }
        .ad-card {
          display: flex;
          gap: 1rem;
          padding: 1.4rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .ad-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 26px rgba(0, 0, 0, 0.12);
        }
        .ad-card__badge {
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
        .ad-card__name {
          color: var(--accent-gold);
          margin: 0 0 0.35rem 0;
          font-size: 1.1rem;
        }
        .ad-cta {
          padding: 2rem;
          background-color: var(--bg-secondary);
          border-radius: var(--border-radius);
          border-left: 3px solid var(--accent-gold);
          line-height: 1.8;
        }
        .ad-cta__button {
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
        .ad-cta__button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
      `}</style>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {title}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {intro.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
              {intro.map(function(p, i) {
                const isLead = !firstIntroDone;
                firstIntroDone = true;
                return (
                  <p key={i} style={isLead
                    ? { margin: 0, fontSize: '1.2rem', fontWeight: 500 }
                    : { margin: 0 }}>
                    {linkify(p)}
                  </p>
                );
              })}
            </div>
          )}

          {options.length > 0 && (
            <div className="ad-grid">
              {options.map(function(opt, i) {
                return (
                  <div key={i} className="ad-card">
                    <span className="ad-card__badge"><MegaphoneIcon /></span>
                    <div>
                      <h2 className="ad-card__name">{opt.name}</h2>
                      <p style={{ margin: 0, lineHeight: '1.6' }}>{opt.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {closing.map(function(item, i) {
            if (item.type === 'cta') {
              return (
                <div key={i} className="ad-cta">
                  <p style={{ margin: 0 }}>{linkify(item.text)}</p>
                  <a className="ad-cta__button" href={'mailto:' + item.email}>Request a Quote</a>
                </div>
              );
            }
            return <p key={i} style={{ margin: 0, lineHeight: '1.8' }}>{linkify(item.text)}</p>;
          })}
        </div>
      </div>
    </Layout>
  );
}
