import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function Disclaimer({ layoutProps }) {
  const pageData = useDynamicPage('disclaimer');

  if (pageData && pageData.content) {
    return (
      <Layout {...layoutProps}>
        <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
          <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
            {pageData.title || 'Disclaimer'}
          </h1>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
            {pageData.content.split('\n\n').filter(function(p) { return p.trim(); }).map(function(p, i) { return <p key={i}>{p.trim()}</p>; })}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>Disclaimer</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
          <p>The information published on The One Journal is provided for general informational and educational purposes only. While we strive to ensure that all content is accurate and up to date, we make no representations or warranties of any kind regarding the completeness, reliability, or accuracy of the information.</p>
          <p>Any action you take based on the information found on this website is strictly at your own risk. The One Journal shall not be held liable for any losses or damages arising from the use of our website.</p>
          <p>The views and opinions expressed in articles written by contributors or guest authors are their own and do not necessarily reflect the official position of The One Journal.</p>
          <p>We reserve the right to modify, update, or remove content without prior notice.</p>

          <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Editorial Disclaimer</h2>
          <p>The One Journal is an independent news and media platform committed to providing timely news, opinions, and analysis.</p>
          <p>Although every effort is made to verify facts before publication, errors or omissions may occasionally occur. Readers are encouraged to verify critical information through official sources before making decisions based on our content.</p>
          <p>Opinions expressed in editorials, interviews, or contributed articles belong solely to the respective authors and should not be interpreted as endorsements by The One Journal.</p>

          <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Financial Information Disclaimer</h2>
          <p>Some articles published on The One Journal may discuss financial markets, cryptocurrencies, stocks, or investments.</p>
          <p>The information provided is for educational and informational purposes only and should not be considered financial, investment, legal, or tax advice. Readers should consult qualified professionals before making investment decisions.</p>

          <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>External Links</h2>
          <p>Our website may contain links to third-party websites for reference or convenience.</p>
          <p>We do not control, endorse, or guarantee the accuracy, availability, or content of external websites. Visiting third-party sites is done entirely at your own risk.</p>

          <h2 style={{ marginTop: '1.5rem', color: 'var(--accent-gold)' }}>Copyright Notice</h2>
          <p>Unless otherwise stated, all original content published on The One Journal, including text, graphics, logos, and multimedia, is protected by copyright laws.</p>
          <p>Unauthorized reproduction, distribution, or republication of our content without prior written permission is prohibited.</p>
        </div>
      </div>
    </Layout>
  );
}
