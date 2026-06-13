import React from 'react';

function MediaCard({ article, onClick }) {
  if (!article) return null;

  return (
    <div className="media-card" onClick={() => onClick && onClick(article)}>
      <div className="media-thumbnail-wrapper">
        <img 
          src={article.image} 
          alt={article.title} 
          className="media-thumbnail"
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        <div className="play-overlay-btn" aria-label="Play Media">
          <svg className="play-icon-svg" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </div>

        {/* Media Badge (Duration & Type) */}
        <div className="media-badge-icon">
          {article.mediaType === 'video' ? (
            /* Video Camera icon */
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
              <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1V1zm4 0v14h8V1H4zm1 1h6v12H5V2z"/>
            </svg>
          ) : (
            /* Microphone icon */
            <svg width="10" height="10" fill="currentColor" viewBox="0 0 16 16">
              <path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5z"/>
              <path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0V3z"/>
            </svg>
          )}
          <span>{article.duration}</span>
        </div>
      </div>
      <div className="media-card-content">
        <h3 className="media-card-headline">{article.title}</h3>
        <span className="text-accent bold" style={{fontSize: '0.7rem', textTransform: 'uppercase', marginTop: 'auto'}}>
          {article.tag}
        </span>
      </div>
    </div>
  );
}

export default function MediaSection({ articles, onArticleClick }) {
  if (!articles || articles.length === 0) return null;

  return (
    <div className="media-horizontal-grid">
      {articles.map((article) => (
        <MediaCard 
          key={article.id} 
          article={article} 
          onClick={onArticleClick} 
        />
      ))}
    </div>
  );
}
