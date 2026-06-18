import React from 'react';
import ViewsBadge from './ViewsBadge';

export default function FeaturedCard({ article, onClick }) {
  if (!article) return null;

  return (
    <article className="featured-card" onClick={() => onClick && onClick(article)}>
      <div className="featured-img-wrapper">
        <img 
          src={article.image} 
          alt={article.title} 
          className="featured-img" 
          loading="lazy"
        />
      </div>
      <div className="featured-content">
        {article.tag && (
          <span className="featured-tag">{article.tag}</span>
        )}
        <div className="featured-meta">
          <span>By {article.author}</span>
          <span>&bull;</span>
          <span>{article.date}</span>
          <span>&bull;</span>
          <span>{article.readTime}</span>
          <ViewsBadge views={article.views} showLabel={false} />
        </div>
        <h3 className="featured-headline">{article.title}</h3>
        <p className="featured-excerpt">{article.excerpt}</p>
        <p className="text-accent bold" style={{fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: 'auto'}}>
          Read Full Story 
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </p>
      </div>
    </article>
  );
}
