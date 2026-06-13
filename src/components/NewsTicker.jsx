import React from 'react';

export default function NewsTicker({ tickerItems, onArticleClick }) {
  // If no items, show default placeholder breaking news
  const items = tickerItems && tickerItems.length > 0 ? tickerItems : [
    { title: "BREAKING: Dubai Future District Announces New $100M Fintech Acceleration Program" },
    { title: "WEATHER ALERT: High Temperatures Expected Across the UAE This Weekend" },
    { title: "TRAVEL UPDATE: GCC Residents Can Now Apply for Unified Visa Online" },
    { title: "MARKETS: Gold Prices Stabilize Near All-Time Highs in Local Souks" }
  ];

  return (
    <div className="ticker-wrapper">
      <div className="ticker-label">
        Breaking News
      </div>
      <div className="ticker-content-flow">
        <div className="ticker-track">
          {items.map((item, idx) => {
            const isClickable = !!item.content;
            return (
              <div 
                key={idx} 
                className="ticker-item"
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
                onClick={() => isClickable && onArticleClick && onArticleClick(item)}
              >
                <span className="ticker-bullet">&#9670;</span>
                <span className="ticker-text">{item.title}</span>
              </div>
            );
          })}
          {/* Duplicate for infinite loop scroll */}
          {items.map((item, idx) => {
            const isClickable = !!item.content;
            return (
              <div 
                key={`dup-${idx}`} 
                className="ticker-item"
                style={{ cursor: isClickable ? 'pointer' : 'default' }}
                onClick={() => isClickable && onArticleClick && onArticleClick(item)}
              >
                <span className="ticker-bullet">&#9670;</span>
                <span className="ticker-text">{item.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
