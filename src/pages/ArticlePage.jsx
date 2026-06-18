import React, { useEffect } from 'react';
import Layout from '../components/Layout';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Full article view rendered as its own page (wrapped in the site Layout so it
// has the header + footer), opened when a reader clicks any news item.
export default function ArticlePage({ layoutProps, article }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  if (!article) {
    return (
      <Layout {...layoutProps}>
        <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center', minHeight: '50vh' }}>
          <h2>Article not found</h2>
          <p className="text-muted" style={{ marginTop: '0.5rem' }}>This story may have moved or is no longer available.</p>
          <a href="/" className="newsletter-btn" style={{ marginTop: '1.5rem', display: 'inline-block' }}>Back to Home</a>
        </div>
      </Layout>
    );
  }

  const paragraphs = article.content ? article.content.split('\n\n').filter(p => p.trim()) : [article.excerpt];
  const ytId = getYouTubeId(article.mediaUrl);

  return (
    <Layout {...layoutProps}>
      <article className="article-page">
        <span className="modal-tag">{article.tag || article.category}</span>
        <h1 className="article-page-title">{article.title}</h1>

        <div className="article-page-meta">
          <span className="modal-author-avatar">{(article.author || 'T').charAt(0)}</span>
          <span className="bold">{article.author}</span>
          {article.date && <span>· Published: {article.date}</span>}
          {article.readTime && <span>· {article.readTime}</span>}
        </div>

        {ytId ? (
          <div className="article-page-media">
            <iframe
              src={`https://www.youtube.com/embed/${ytId}`}
              title={article.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          </div>
        ) : article.image ? (
          <img src={article.image} alt={article.title} className="article-page-img" />
        ) : null}

        <div className="modal-article-text">
          {paragraphs.map((para, idx) => (
            <p key={idx}>{para.trim()}</p>
          ))}
        </div>
      </article>
    </Layout>
  );
}
