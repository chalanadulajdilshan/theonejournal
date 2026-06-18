import React from 'react';
import Layout from '../components/Layout';

const Icon = ({ children, size = 20 }) => (
  <svg width={size} height={size} fill="currentColor" viewBox="0 0 16 16">{children}</svg>
);

const checkFill = (
  <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z" />
);

const checkOutline = (
  <>
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M10.97 4.97a.235.235 0 0 0-.02.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05z" />
  </>
);

const basic = {
  name: 'BASIC',
  price: '100',
  icon: (
    <Icon size={28}>
      <path d="M9.752 6.193c.599.6 1.73.437 2.528-.362.798-.799.96-1.932.362-2.531-.599-.6-1.73-.438-2.528.361-.798.8-.96 1.933-.362 2.532z" />
      <path d="M15.811 3.312c-.363 1.534-1.334 3.626-3.64 6.218l-.24 2.408a2.56 2.56 0 0 1-.732 1.526L8.817 15.85a.51.51 0 0 1-.867-.434l.27-1.899c.04-.28-.013-.593-.131-.956a9.42 9.42 0 0 0-.249-.657l-.082-.202c-.815-.197-1.578-.662-2.191-1.277-.614-.615-1.079-1.379-1.275-2.195l-.203-.083a9.556 9.556 0 0 0-.655-.248c-.363-.119-.675-.172-.955-.132l-1.896.27A.51.51 0 0 1 .15 7.17l2.382-2.383a2.56 2.56 0 0 1 1.524-.733l2.405-.24c2.59-2.308 4.68-3.28 6.213-3.644 1.562-.37 2.5-.249 3.018.27.52.518.64 1.456.27 3.018zm-4.46 5.3.224-2.244c-1.04 1.01-1.886 1.985-2.487 2.846l.97-.198a1.5 1.5 0 0 0 1.293-.404zm-2.886-2.886c.861-.601 1.835-1.448 2.846-2.487L9.077 3.456a1.5 1.5 0 0 0-.404 1.293l-.198.97z" />
    </Icon>
  ),
  features: [
    '12 feed posts / month',
    'Content caption writing',
    'Basic graphic design',
    'Post scheduling',
    'Hashtag research',
    'Basic engagement'
  ]
};

const tiers = [
  {
    name: 'STANDARD',
    price: '200',
    icon: (
      <Icon size={26}>
        <path d="M1 11a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1v-3zm5-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v7a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V7zm5-5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1V2z" />
      </Icon>
    ),
    features: [
      '20 feed posts / month',
      'Custom graphic design',
      'Caption copywriting',
      'Post scheduling & publishing',
      'Hashtag strategy',
      'Comment & message reply'
    ]
  },
  {
    name: 'PREMIUM',
    price: '350',
    icon: (
      <Icon size={26}>
        <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.114 5.318a.532.532 0 0 1 .01-.644L3.1.7z" />
      </Icon>
    ),
    features: [
      '30 feed posts / month',
      'High quality graphic design',
      'Pro caption copywriting',
      'Content calendar planning',
      'Competitor analysis',
      'Monthly analytics report'
    ]
  }
];

const mailto = (name) => `mailto:admin@theonejournal.org?subject=Social Media Management - ${name} Package`;

export default function SocialMedia({ layoutProps }) {
  return (
    <Layout {...layoutProps}>
      <div className="smm-page">
        {/* Header */}
        <div className="addon-page-header">
          <h1 className="addon-page-title">SOCIAL MEDIA MANAGEMENT PACKAGE</h1>
          <div className="addon-title-rule"></div>
          <p className="addon-page-subtitle">Strategic Content. Consistent Growth. Real Results.</p>
        </div>

        {/* Contact bar */}
        <div className="smm-contact-bar">
          <div className="smm-contact-item">
            <span className="smm-contact-icon">
              <Icon size={18}><path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328z" /></Icon>
            </span>
            <div>
              <strong>Contact Us</strong>
              <span>The One Journal</span>
            </div>
          </div>
          <div className="smm-contact-item">
            <span className="smm-contact-icon">
              <Icon size={18}><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2zm13 2.383-4.708 2.825L15 11.105V5.383zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741zM1 11.105l4.708-2.897L1 5.383v5.722z" /></Icon>
            </span>
            <div>
              <strong>Email</strong>
              <span>admin@theonejournal.org</span>
            </div>
          </div>
          <div className="smm-contact-item">
            <span className="smm-contact-icon">
              <Icon size={18}><path d="M0 8a8 8 0 1 1 16 0A8 8 0 0 1 0 8zm7.5-6.923c-.67.204-1.335.82-1.887 1.855A7.97 7.97 0 0 0 5.145 4H7.5V1.077zM4.09 4a9.267 9.267 0 0 1 .64-1.539 6.7 6.7 0 0 1 .597-.933A7.025 7.025 0 0 0 2.255 4H4.09zm-.582 3.5c.03-.877.138-1.718.312-2.5H1.674a6.958 6.958 0 0 0-.656 2.5h2.49zM4.847 5a12.5 12.5 0 0 0-.338 2.5H7.5V5H4.847zM8.5 5v2.5h2.99a12.495 12.495 0 0 0-.337-2.5H8.5zM4.51 8.5a12.5 12.5 0 0 0 .337 2.5H7.5V8.5H4.51zm3.99 0V11h2.653c.187-.765.306-1.608.338-2.5H8.5zM5.145 12c.138.386.295.744.468 1.068.552 1.035 1.218 1.65 1.887 1.855V12H5.145zm.182 2.472a6.696 6.696 0 0 1-.597-.933A9.268 9.268 0 0 1 4.09 12H2.255a7.024 7.024 0 0 0 3.072 2.472zM3.82 11a13.652 13.652 0 0 1-.312-2.5h-2.49c.062.89.291 1.733.656 2.5H3.82zm6.853 3.472A7.024 7.024 0 0 0 13.745 12H11.91a9.27 9.27 0 0 1-.64 1.539 6.688 6.688 0 0 1-.597.933zM8.5 12v2.923c.67-.204 1.335-.82 1.887-1.855.173-.324.33-.682.468-1.068H8.5zm3.68-1h2.146c.365-.767.594-1.61.656-2.5h-2.49a13.65 13.65 0 0 1-.312 2.5zm2.802-3.5a6.959 6.959 0 0 0-.656-2.5H12.18c.174.782.282 1.623.312 2.5h2.49zM11.27 2.461c.247.464.462.98.64 1.539h1.835a7.024 7.024 0 0 0-3.072-2.472c.218.284.418.598.597.933zM10.855 4a7.966 7.966 0 0 0-.468-1.068C9.835 1.897 9.17 1.282 8.5 1.077V4h2.355z" /></Icon>
            </span>
            <div>
              <strong>Website</strong>
              <span>www.theonejournal.org</span>
            </div>
          </div>
        </div>

        {/* Featured BASIC package */}
        <div className="smm-featured">
          <div className="smm-featured-top">
            <div className="smm-pkg-name">
              <span className="smm-pkg-name-icon">{basic.icon}</span>
              <h2>{basic.name}<span>PACKAGE</span></h2>
            </div>
            <div className="smm-featured-price">
              <span className="smm-amount">${basic.price}<span>/month</span></span>
              <a href={mailto(basic.name)} className="smm-get-started">GET STARTED</a>
            </div>
          </div>
          <div className="smm-featured-features">
            {basic.features.map((feature, idx) => (
              <span className="smm-feature" key={idx}>
                <Icon size={18}>{checkOutline}</Icon>
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Standard + Premium */}
        <div className="smm-grid">
          {tiers.map((tier, idx) => (
            <div className="smm-card" key={idx}>
              <div className="smm-card-head">
                <span className="smm-card-icon">{tier.icon}</span>
                <h3>{tier.name}<span>PACKAGE</span></h3>
              </div>
              <div className="smm-card-pricebar">
                <span className="smm-amount">${tier.price}<span>/month</span></span>
                <a href={mailto(tier.name)} className="smm-get-started">GET STARTED</a>
              </div>
              <ul className="smm-features">
                {tier.features.map((feature, fIdx) => (
                  <li key={fIdx}>
                    <Icon size={18}>{checkFill}</Icon>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer tagline */}
        <div className="smm-footer-banner">
          <Icon size={22}>
            <path d="M7 14s-1 0-1-1 1-4 5-4 5 3 5 4-1 1-1 1H7zm4-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm-5.784 6A2.238 2.238 0 0 1 5 13c0-1.355.68-2.75 1.936-3.72A6.325 6.325 0 0 0 5 9c-4 0-5 3-5 4s1 1 1 1h4.216zM4.5 8a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
          </Icon>
          Your Brand. Our Strategy. Exceptional Results.
        </div>
      </div>
    </Layout>
  );
}
