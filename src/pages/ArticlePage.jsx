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

  const bodyContent = article.content || '';
  const ytId = getYouTubeId(article.mediaUrl);
  const intro = (article.excerpt || '').trim();
  const imageCredit = (article.imageCredit || '').trim();
  const tagList = (article.seoTags || '')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean);

  const mediaBlock = ytId ? (
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
  ) : null;

  return (
    <Layout {...layoutProps}>
      <article className="article-page">
        <span className="modal-tag">{article.tag || article.category}</span>
        <h1 className="article-page-title">{article.title}</h1>

        {mediaBlock && (
          <figure className="article-page-figure">
            {mediaBlock}
            {imageCredit && (
              <figcaption className="article-page-credit">Photo: {imageCredit}</figcaption>
            )}
          </figure>
        )}

        {intro && <p className="article-page-deck">{intro}</p>}

        <div className="article-page-meta" style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
          <span className="modal-author-avatar">{(article.author || 'T').charAt(0)}</span>
          <span className="bold">{article.author}</span>
          {article.date && <span>· Published: {article.date}</span>}
          {article.readTime && <span style={{ fontSize: '0.7rem' }}>· {article.readTime}</span>}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: 'auto', flexWrap: 'wrap' }}>
            <span className="bold text-secondary" style={{ fontSize: '0.8rem' }}>Share</span>
            {(() => {
              // Two share URLs:
              //  • sharePageUrl     → share.php?id=... (used by FB + X — keeps
              //                       their existing behaviour unchanged).
              //  • whatsappPageUrl  → pretty /s/<id> form (rewritten to
              //                       share.php by .htaccess) so the link
              //                       inside the WhatsApp message stays short
              //                       and looks professional — same OG card.
              // Build a URL-friendly slug from the SEO title (falls back to
              // the article title). Strips diacritics, lowercases, replaces
              // any non-alphanumeric run with a single dash, trims dashes.
              const slugSource = (article.seoTitle || article.title || '').toString();
              const slug = slugSource
                .normalize('NFKD')
                .replace(/[̀-ͯ]/g, '')
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
                .slice(0, 80) || 'article';

              const sharePageUrl = article.id
                ? `${window.location.origin}/share.php?id=${encodeURIComponent(article.id)}`
                : window.location.href;
              const whatsappPageUrl = article.id
                ? `${window.location.origin}/s/${slug}/${encodeURIComponent(article.id)}`
                : window.location.href;
              const shareUrl = encodeURIComponent(sharePageUrl);
              const whatsappShareUrl = encodeURIComponent(whatsappPageUrl);
              const shareTitle = encodeURIComponent(article.title || '');
              // Detect mobile up-front so we can route Facebook through the
              // mobile sharer URL — the desktop sharer (www.facebook.com/sharer)
              // is intercepted by the FB app's universal-link handler and
              // opens an empty composer with no link prefilled.
              const isMobileUA = typeof navigator !== 'undefined' && /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
              const fbBase = isMobileUA
                ? 'https://m.facebook.com/sharer/sharer.php'
                : 'https://www.facebook.com/sharer/sharer.php';

              const platforms = [
                {
                  name: 'Facebook',
                  href: `${fbBase}?u=${shareUrl}`,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                    </svg>
                  ),
                },
                {
                  name: 'WhatsApp',
                  // Send ONLY the URL — no surrounding text. On modern
                  // WhatsApp builds this displays as a clean preview card
                  // (image + og:title + og:description + domain) without
                  // a visible URL line, which is the look the user wants.
                  // The title/description come from share.php's OG tags.
                  href: `https://api.whatsapp.com/send?text=${whatsappShareUrl}`,
                  icon: (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c0-5.45 4.436-9.884 9.888-9.884a9.825 9.825 0 0 1 6.994 2.898 9.825 9.825 0 0 1 2.892 6.993c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
                    </svg>
                  ),
                },
                {
                  name: 'X',
                  href: `https://twitter.com/intent/tweet?url=${shareUrl}&text=${shareTitle}`,
                  icon: (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                    </svg>
                  ),
                },
              ];
              // On mobile, clicking a facebook.com sharer link gets hijacked
              // by the FB app's universal-link handler and opens an empty
              // composer (the URL param is dropped). The only reliable
              // workaround is the OS share sheet: it passes the URL to the FB
              // app via a system intent, which FB's app *does* honour and
              // opens the proper "share to feed" dialog with link preview.
              const canNativeShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';
              const handleClick = (platform) => (e) => {
                if (platform.name === 'Facebook' && isMobileUA && canNativeShare) {
                  e.preventDefault();
                  navigator.share({
                    title: article.title || '',
                    text: article.title || '',
                    url: sharePageUrl,
                  }).catch(() => {});
                }
              };

              return platforms.map((p) => (
                <a
                  key={p.name}
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Share on ${p.name}`}
                  aria-label={`Share on ${p.name}`}
                  onClick={handleClick(p)}
                  style={{
                    width: '2rem',
                    height: '2rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '50%',
                    color: 'inherit',
                    textDecoration: 'none',
                  }}
                >
                  {p.icon}
                </a>
              ));
            })()}
          </div>
        </div>

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
