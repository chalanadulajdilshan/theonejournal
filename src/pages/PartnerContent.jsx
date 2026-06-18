import React from 'react';
import Layout from '../components/Layout';

const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 16 16">{children}</svg>
);

const checkIcon = (
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
);

const packages = [
  {
    name: 'BASIC',
    price: '20',
    desc: 'Simple, clean, and effective design solution.',
    headerColor: '#2f5fb0',
    btnColor: '#0e2a5e',
    icon: (
      <Icon size={30}>
        <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
        <path fillRule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z" />
      </Icon>
    ),
    features: ['1 Sponsor Article', '2 Revisions', 'High-Resolution File', 'Post within 24 Hours', '1000 - 1200 Words']
  },
  {
    name: 'STANDARD',
    price: '50',
    desc: 'More concepts, more flexibility, better results.',
    headerColor: '#1d4ed8',
    btnColor: '#1d4ed8',
    icon: (
      <Icon size={30}>
        <path d="M3.612 15.443c-.386.198-.824-.149-.746-.592l.83-4.73L.173 6.765c-.329-.314-.158-.888.283-.95l4.898-.696L7.538.792c.197-.39.73-.39.927 0l2.184 4.327 4.898.696c.441.062.612.636.282.95l-3.522 3.356.83 4.73c.078.443-.36.79-.746.592L8 13.187l-4.389 2.256z" />
      </Icon>
    ),
    features: ['3 Sponsor Article', '4 Revisions', 'Featured Home Page', 'Post within 24 Hours', '1000 - 1200 Words']
  },
  {
    name: 'PREMIUM',
    price: '100',
    desc: 'Complete branding with unlimited creative freedom.',
    headerColor: '#0e2a5e',
    btnColor: '#0e2a5e',
    icon: (
      <Icon size={30}>
        <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.114 5.318a.532.532 0 0 1 .01-.644L3.1.7z" />
      </Icon>
    ),
    features: ['7 Sponsor Article', 'Unlimited Revisions', 'Featured Home Page', 'Post within 24 Hours', '1000 - 1200 Words', 'Priority Publishing']
  }
];

export default function PartnerContent({ layoutProps }) {
  return (
    <Layout {...layoutProps}>
      <div className="partner-pkg-page">
        {/* Header */}
        <div className="addon-page-header">
          <h1 className="addon-page-title">PARTNER CONTENT PACKAGES</h1>
          <div className="addon-title-rule"></div>
          <p className="addon-page-subtitle">Choose the Right Plan for Your Needs</p>
        </div>

        {/* Compliance callout */}
        <div className="partner-pkg-callout">
          <div className="partner-pkg-callout-icon">
            <Icon size={24}>
              <path d="M5.338 1.59a61.44 61.44 0 0 0-2.837.856.481.481 0 0 0-.328.39c-.554 4.157.726 7.19 2.253 9.188a10.725 10.725 0 0 0 2.287 2.233c.346.244.652.42.893.533.12.057.218.095.293.118a.55.55 0 0 0 .101.025.615.615 0 0 0 .1-.025c.076-.023.174-.061.294-.118.24-.113.547-.29.893-.533a10.726 10.726 0 0 0 2.287-2.233c1.527-1.997 2.807-5.031 2.253-9.188a.48.48 0 0 0-.328-.39c-.651-.213-1.75-.56-2.837-.855C9.552 1.29 8.531 1.067 8 1.067c-.53 0-1.552.223-2.662.524z" />
            </Icon>
          </div>
          <p>
            All partner content is clearly labeled as sponsored and must comply with our editorial guidelines.
            We reserve the right to reject content that is misleading, illegal, or does not meet our quality standards.
          </p>
        </div>

        {/* Pricing tiers */}
        <div className="partner-pkg-grid">
          {packages.map((pkg, idx) => (
            <div className="partner-pkg-card" key={idx}>
              <div className="partner-pkg-header" style={{ backgroundColor: pkg.headerColor }}>
                {pkg.name}
              </div>
              <div className="partner-pkg-body">
                <div className="partner-pkg-badge">{pkg.icon}</div>
                <div className="partner-pkg-price">${pkg.price}<span>/month</span></div>
                <p className="partner-pkg-desc">{pkg.desc}</p>
                <a
                  href={`mailto:admin@theonejournal.org?subject=Partner Content - ${pkg.name} Package`}
                  className="partner-pkg-btn"
                  style={{ backgroundColor: pkg.btnColor }}
                >
                  SELECT PACKAGE
                </a>
                <ul className="partner-pkg-features">
                  {pkg.features.map((feature, fIdx) => (
                    <li key={fIdx}>
                      <Icon size={18}>{checkIcon}</Icon>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Contact CTA */}
        <div className="partner-pkg-cta">
          <div className="partner-pkg-cta-icon">
            <Icon size={24}>
              <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" />
            </Icon>
          </div>
          <h3 className="partner-pkg-cta-title">READY TO GET STARTED?</h3>
          <p>Let's build your brand with confidence and creativity.</p>
          <p className="partner-pkg-cta-label">Contact Us Today at:</p>
          <a href="mailto:admin@theonejournal.org" className="partner-pkg-cta-email">admin@theonejournal.org</a>
        </div>
      </div>
    </Layout>
  );
}
