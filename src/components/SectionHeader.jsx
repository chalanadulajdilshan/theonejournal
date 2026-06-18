import React from 'react';

export default function SectionHeader({ title, viewAllLink = "#", id }) {
  return (
    <div className="section-header" id={id}>
      <div className="section-title-wrapper">
        {viewAllLink ? (
          <a href={viewAllLink} className="section-title-link">
            <h2 className="section-title">{title}</h2>
          </a>
        ) : (
          <h2 className="section-title">{title}</h2>
        )}
      </div>
      {viewAllLink && (
        <a href={viewAllLink} className="section-view-all">
          <span>View All</span>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </a>
      )}
    </div>
  );
}
