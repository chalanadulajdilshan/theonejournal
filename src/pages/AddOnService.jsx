import React from 'react';
import Layout from '../components/Layout';

// Premium add-on services offered alongside partner content. Each entry carries
// its own accent colour used for both the icon tile and the price badge.
const services = [
  {
    name: 'Extra Backlink',
    desc: 'Add an additional do-follow backlink to boost your SEO and reach.',
    price: '$10',
    color: '#1e293b',
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M4.715 6.542 3.343 7.914a3 3 0 1 0 4.243 4.243l1.828-1.829A3 3 0 0 0 8.586 5.5L8 6.086a1.002 1.002 0 0 0-.154.199 2 2 0 0 1 .861 3.337L6.88 11.45a2 2 0 1 1-2.83-2.83l.793-.792a4.018 4.018 0 0 1-.128-1.287z" />
        <path d="M6.586 4.672A3 3 0 0 0 7.414 9.5l.775-.776a2 2 0 0 1-.896-3.346L9.12 3.55a2 2 0 1 1 2.83 2.83l-.793.792c.112.42.155.855.128 1.287l1.372-1.372a3 3 0 1 0-4.243-4.243L6.586 4.672z" />
      </svg>
    )
  },
  {
    name: 'Homepage Feature (7 Days)',
    desc: 'Feature your article on our homepage for maximum visibility.',
    price: '$20',
    color: '#c0182b',
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.707 1.5a1 1 0 0 0-1.414 0L.646 8.146a.5.5 0 0 0 .708.708L2 8.207V13.5A1.5 1.5 0 0 0 3.5 15h9a1.5 1.5 0 0 0 1.5-1.5V8.207l.646.647a.5.5 0 0 0 .708-.708L13 5.793V2.5a.5.5 0 0 0-.5-.5h-1a.5.5 0 0 0-.5.5v1.293L8.707 1.5Z" />
      </svg>
    )
  },
  {
    name: 'Social Media Promotion',
    desc: 'Share your article across our social media channels.',
    price: '$15',
    color: '#3a9b40',
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M13 2.5a1.5 1.5 0 0 1 3 0v11a1.5 1.5 0 0 1-3 0v-.214c-2.162-1.241-4.49-1.843-6.912-2.083l.405 2.712A1 1 0 0 1 5.51 15.1h-.548a1 1 0 0 1-.916-.599l-1.85-3.49a68.14 68.14 0 0 0-.202-.003A2.014 2.014 0 0 1 0 9V7a2.02 2.02 0 0 1 1.992-2.013 74.663 74.663 0 0 0 2.483-.075c3.043-.154 6.148-.849 8.525-2.199V2.5z" />
      </svg>
    )
  },
  {
    name: 'SEO Optimization',
    desc: 'Optimize your content for better search engine rankings.',
    price: '$20',
    color: '#7a4ca0',
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path fillRule="evenodd" d="M0 0h1v15h15v1H0V0Zm14.817 3.113a.5.5 0 0 1 .07.704l-4.5 5.5a.5.5 0 0 1-.74.037L7.06 6.767l-3.656 5.027a.5.5 0 0 1-.808-.588l4-5.5a.5.5 0 0 1 .758-.06l2.609 2.61 4.15-5.073a.5.5 0 0 1 .704-.07Z" />
      </svg>
    )
  },
  {
    name: 'Express Publishing (Within 24 Hours)',
    desc: 'Get your article published within 24 hours.',
    price: '$15',
    color: '#e8821e',
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
      </svg>
    )
  },
  {
    name: 'Professional Article Writing',
    desc: 'Expert-written, high-quality article tailored to your brand.',
    price: '$30',
    color: '#2f6db5',
    icon: (
      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16">
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
      </svg>
    )
  }
];

export default function AddOnService({ layoutProps }) {
  return (
    <Layout {...layoutProps}>
      <div className="addon-page">
        <div className="addon-page-header">
          <h1 className="addon-page-title">ADD-ON SERVICES</h1>
          <div className="addon-title-rule"></div>
          <p className="addon-page-subtitle">
            Enhance your partner content and get more visibility with our premium add-on services.
          </p>
        </div>

        <div className="addon-list">
          {services.map((service, idx) => (
            <div className="addon-card" key={idx}>
              <div className="addon-icon" style={{ backgroundColor: service.color }}>
                {service.icon}
              </div>
              <div className="addon-body">
                <h3 className="addon-name">{service.name}</h3>
                <p className="addon-desc">{service.desc}</p>
              </div>
              <div className="addon-price" style={{ backgroundColor: service.color }}>
                {service.price}
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
