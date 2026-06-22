import React, { useEffect } from 'react';
import Layout from '../components/Layout';
import RichContent from '../components/RichContent';

const SITE_NAME = 'The One Journal';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Strip HTML and trim to a clean, meta-sized plain-text snippet.
const toPlainText = (html, max = 160) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  const text = (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
  return text.length > max ? text.slice(0, max - 1).trimEnd() + '…' : text;
};

// Full article view rendered as its own page (wrapped in the site Layout so it
// has the header + footer), opened when a reader clicks any news item.
export default function ArticlePage({ layoutProps, article }) {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [article]);

  // Apply per-article SEO: document title, meta description/keywords, and
  // Open Graph + Twitter card tags for rich link previews. Falls back to the
  // article's own fields when the optional SEO inputs are left blank, and
  // restores the previous head state when leaving the page.
  useEffect(() => {
    if (!article) return;

    const seoTitle = (article.seoTitle || '').trim() || article.title || SITE_NAME;
    const description = (article.metaDescription || '').trim() || toPlainText(article.excerpt || article.content);
    const keywords = (article.seoTags || '').trim();
    // og:image / twitter:image must be absolute URLs for crawlers.
    const rawImage = article.image || '';
    const image = rawImage && !/^https?:\/\//i.test(rawImage)
      ? `${window.location.origin}${rawImage.startsWith('/') ? '' : '/'}${rawImage}`
      : rawImage;
    const url = window.location.href;

    const prevTitle = document.title;
    document.title = `${seoTitle} | ${SITE_NAME}`;

    const tags = [
      { name: 'description', content: description },
      keywords && { name: 'keywords', content: keywords },
      { property: 'og:type', content: 'article' },
      { property: 'og:site_name', content: SITE_NAME },
      { property: 'og:title', content: seoTitle },
      { property: 'og:description', content: description },
      { property: 'og:url', content: url },
      image && { property: 'og:image', content: image },
      { name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' },
      { name: 'twitter:title', content: seoTitle },
      { name: 'twitter:description', content: description },
      image && { name: 'twitter:image', content: image },
    ].filter(Boolean);

    const restores = tags.map(({ name, property, content }) => {
      const attr = name ? 'name' : 'property';
      const key = name || property;
      let el = document.head.querySelector(`meta[${attr}="${key}"]`);
      const created = !el;
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, key);
        document.head.appendChild(el);
      }
      const prev = el.getAttribute('content');
      el.setAttribute('content', content);
      return () => {
        if (created) el.remove();
        else if (prev !== null) el.setAttribute('content', prev);
      };
    });

    return () => {
      document.title = prevTitle;
      restores.forEach((restore) => restore());
    };
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

  const bodyContent = article.content || article.excerpt || '';
  const ytId = getYouTubeId(article.mediaUrl);
  const metaDeck = (article.metaDescription || '').trim();
  const tagList = (article.seoTags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <Layout {...layoutProps}>
      <article className="article-page">
        <span className="modal-tag">{article.tag || article.category}</span>
        <h1 className="article-page-title">{article.title}</h1>

        {metaDeck && <p className="article-page-deck">{metaDeck}</p>}

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

        <RichContent content={bodyContent} className="modal-article-text" />

        {tagList.length > 0 && (
          <div className="article-page-tags">
            <span className="article-page-tags-label">Topics</span>
            <ul className="article-tag-chips">
              {tagList.map((t, i) => (
                <li key={i} className="article-tag-chip">{t}</li>
              ))}
            </ul>
          </div>
        )}
      </article>
    </Layout>
  );
}
