import React from 'react';
import Layout from '../components/Layout';

const placements = [
  { name: 'Homepage Hero Banner', size: '1920 × 500', price: '$50' },
  { name: 'Homepage Top Banner', size: '728 × 90', price: '$50' },
  { name: 'Homepage Sidebar', size: '300 × 250', price: '$20' },
  { name: 'Article Top Banner', size: '728 × 90', price: '$40' },
  { name: 'Article In-Content Banner', size: '728 × 90', price: '$30' },
  { name: 'Article Sidebar Banner', size: '300 × 250', price: '$20' },
  { name: 'Footer Banner (Site-wide)', size: '728 × 90', price: '$40' },
  { name: 'Category Page Banner', size: '728 × 90', price: '$50' }
];

const reasons = [
  {
    text: 'Premium placements across the website',
    icon: <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
  },
  {
    text: 'Brand visibility to engaged readers',
    icon: <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
  },
  {
    text: 'Mobile and desktop optimization',
    icon: <path d="M13.5 3a.5.5 0 0 1 .5.5V11H2V3.5a.5.5 0 0 1 .5-.5h11zm-11-1A1.5 1.5 0 0 0 1 3.5V12h14V3.5A1.5 1.5 0 0 0 13.5 2h-11zM0 12.5h16a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 0 12.5z" />
  },
  {
    text: 'Fast ad approval process',
    icon: <path d="M11.251.068a.5.5 0 0 1 .227.58L9.677 6.5H13a.5.5 0 0 1 .364.843l-8 8.5a.5.5 0 0 1-.842-.49L6.323 9.5H3a.5.5 0 0 1-.364-.843l8-8.5a.5.5 0 0 1 .615-.09z" />
  },
  {
    text: 'Flexible monthly campaigns',
    icon: <><path d="M11 6.5a.5.5 0 0 1 .5-.5h1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-1a.5.5 0 0 1-.5-.5v-1z" /><path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" /></>
  },
  {
    text: 'Direct support from our advertising team',
    icon: <path d="M8 1a5 5 0 0 0-5 5v1h1a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a6 6 0 1 1 12 0v6a2.5 2.5 0 0 1-2.5 2.5H9.366a1 1 0 0 1-.866.5h-1a1 1 0 1 1 0-2h1a1 1 0 0 1 .866.5H11.5A1.5 1.5 0 0 0 13 12h-1a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h1V6a5 5 0 0 0-5-5z" />
  }
];

const bundleItems = [
  'Homepage Hero Banner',
  'Article Top Banner',
  'Category Page Banner',
  'Social media mention (1 post/month)',
  'Priority placement'
];

const techRequirements = [
  {
    text: 'Accepted formats: JPG, PNG, GIF, HTML5',
    icon: <><path d="M5.5 7a.5.5 0 0 0 0 1h5a.5.5 0 0 0 0-1h-5zM5 9.5a.5.5 0 0 1 .5-.5h5a.5.5 0 0 1 0 1h-5a.5.5 0 0 1-.5-.5zm0 2a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 0 1h-2a.5.5 0 0 1-.5-.5z" /><path d="M9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4.5L9.5 0zm0 1v2A1.5 1.5 0 0 0 11 4.5h2V14a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1h5.5z" /></>
  },
  {
    text: 'Maximum file size: 500 KB',
    icon: <path d="M8 2a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 6.095 0 7.555 0 9.318 0 11.366 1.708 13 3.781 13h8.906C14.502 13 16 11.57 16 9.773c0-1.636-1.242-2.969-2.834-3.194C12.923 3.999 10.69 2 8 2zm2.354 5.146a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708l2-2a.5.5 0 0 1 .708 0l2 2z" />
  },
  {
    text: 'Ads must comply with our advertising policies',
    icon: <path fillRule="evenodd" d="M8 0c-.69 0-1.843.265-2.928.56-1.11.3-2.229.655-2.887.87a1.54 1.54 0 0 0-1.044 1.262c-.596 4.477.787 7.795 2.465 9.99a11.777 11.777 0 0 0 2.517 2.453c.386.273.744.482 1.048.625.28.132.581.24.829.24s.548-.108.829-.24a7.159 7.159 0 0 0 1.048-.625 11.775 11.775 0 0 0 2.517-2.453c1.678-2.195 3.061-5.513 2.465-9.99a1.541 1.541 0 0 0-1.044-1.263 62.467 62.467 0 0 0-2.887-.87C9.843.266 8.69 0 8 0zm2.146 5.146a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 7.793l2.646-2.647z" />
  },
  {
    text: 'All advertisements are subject to review before publication',
    icon: <><path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" /><path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" /></>
  }
];

const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 16 16">{children}</svg>
);

export default function DisplayBanner({ layoutProps }) {
  return (
    <Layout {...layoutProps}>
      <div className="banner-ad-page">
        {/* Header */}
        <div className="addon-page-header">
          <h1 className="addon-page-title">DISPLAY BANNER ADVERTISEMENTS</h1>
          <div className="addon-title-rule"></div>
          <p className="addon-page-subtitle">
            Promote your brand on The One Journal with high-visibility display banner advertisements across our website.
          </p>
        </div>

        {/* Highlight callout */}
        <div className="banner-ad-callout">
          <div className="banner-ad-callout-icon">
            <Icon size={26}>
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M8 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm0 1a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
              <path d="M9.5 8a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z" />
            </Icon>
          </div>
          <p>Reach a growing audience through premium placements designed to maximize exposure and engagement.</p>
        </div>

        {/* Pricing table */}
        <div className="banner-ad-table-wrap">
          <table className="banner-ad-table">
            <thead>
              <tr>
                <th>Banner Placement</th>
                <th>Size (px)</th>
                <th>Monthly Price</th>
              </tr>
            </thead>
            <tbody>
              {placements.map((p, idx) => (
                <tr key={idx}>
                  <td>
                    <span className="banner-ad-num">{idx + 1}</span>
                    {p.name}
                  </td>
                  <td>{p.size}</td>
                  <td className="banner-ad-price">{p.price}<span>/month</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Why advertise with us */}
        <section className="banner-ad-section">
          <h2 className="banner-ad-heading">Why Advertise With Us?</h2>
          <div className="banner-ad-why-grid">
            {reasons.map((r, idx) => (
              <div className="banner-ad-why-item" key={idx}>
                <span className="banner-ad-why-icon"><Icon>{r.icon}</Icon></span>
                <span>{r.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Bundle offer + Technical requirements */}
        <div className="banner-ad-two-col">
          <div className="banner-ad-bundle">
            <span className="banner-ad-best-value">BEST VALUE</span>
            <h3 className="banner-ad-bundle-title">BUNDLE OFFER</h3>
            <p className="banner-ad-bundle-sub">Premium Advertising Package</p>
            <div className="banner-ad-bundle-price">$150<span>/month</span></div>
            <ul className="banner-ad-bundle-list">
              {bundleItems.map((item, idx) => (
                <li key={idx}>
                  <Icon size={16}><path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" /></Icon>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="banner-ad-tech">
            <h3 className="banner-ad-heading">Technical Requirements</h3>
            <ul className="banner-ad-tech-list">
              {techRequirements.map((t, idx) => (
                <li key={idx}>
                  <span className="banner-ad-tech-icon"><Icon size={18}>{t.icon}</Icon></span>
                  <span>{t.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="banner-ad-cta">
          <div className="banner-ad-cta-text">
            <h3>Ready to Advertise?</h3>
            <p>Contact our advertising team to reserve your banner placement and grow your brand with The One Journal.</p>
          </div>
          <a href="mailto:admin@theonejournal.org" className="banner-ad-cta-link">
            <Icon size={18}>
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
            </Icon>
            admin@theonejournal.org
          </a>
        </div>
      </div>
    </Layout>
  );
}
