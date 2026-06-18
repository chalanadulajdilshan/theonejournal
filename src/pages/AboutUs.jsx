import React from 'react';
import Layout from '../components/Layout';
import useDynamicPage from '../hooks/useDynamicPage';

export default function AboutUs({ layoutProps }) {
  const pageData = useDynamicPage('about-us');

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
          {pageData ? pageData.title || 'ABOUT US' : 'ABOUT US'}
        </h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', lineHeight: '1.8' }}>
          {pageData && pageData.content
            ? pageData.content.split('\n\n').filter(function(p) { return p.trim(); }).map(function(p, i) { return <p key={i}>{p.trim()}</p>; })
            : (
              <>
                <p>The One Journal is an independent digital news and media platform founded in 2026 by Small Team of Freelancers based in GCC dedicated to connecting people with the stories that shape our world. Guided by our vision of "Connecting The World Together," we strive to deliver accurate, timely, and meaningful journalism that informs, educates, and inspires.</p>
                <p>Our mission is to keep readers informed through factual reporting, in-depth analysis, and engaging stories across a wide range of topics including world news, business, technology, finance, politics, entertainment, sports, and lifestyle.</p>
                <p>Our goal is to present information in a clear, balanced, and accessible way so readers can stay informed and make confident decisions.</p>
                <p>At The One Journal, we believe that trust is earned through integrity. Every article is created with a commitment to factual reporting, responsible journalism, and editorial independence.</p>
                <p>As the media landscape continues to evolve, we embrace innovation to bring news to audiences across multiple platforms while staying true to our core values of accuracy, credibility, and accountability.</p>
                <p>Whether you are following breaking news, exploring in-depth analysis, or discovering fresh perspectives, The One Journal is committed to being your trusted source for reliable information from around the world.</p>
                <p>Thank you for choosing The One Journal. Together, we stay informed, connected, and empowered.</p>
              </>
            )
          }
        </div>
      </div>
    </Layout>
  );
}
