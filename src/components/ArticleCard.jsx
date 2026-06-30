import React from 'react';
import ViewsBadge from './ViewsBadge';

export default function ArticleCard({ article, onClick }) {
  if (!article) return null;

  return (
    <article className="article-card" onClick={() => onClick && onClick(article)}>
      <div className="card-img-wrapper">
        <img
          src={article.image}
          alt={article.title}
          className="card-img"
          loading="lazy"
          decoding="async"
        />
        {article.tag && (
          <span className="card-tag">{article.tag}</span>
        )}
      </div>
      <div className="card-content">
        <div className="card-meta">
          <span>{article.author}</span>
          <span>&bull;</span>
          <span>{article.readTime}</span>
        </div>
        <h3 className="card-headline">{article.title}</h3>
        <p className="card-excerpt">{article.excerpt}</p>
        <div className="card-footer">
          <ViewsBadge views={article.views} />
        </div>
      </div>
    </article>
  );
}
