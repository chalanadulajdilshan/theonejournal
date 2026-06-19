import React from 'react';

// Detects whether a stored body string is HTML (authored with the rich-text
// editor) or legacy plain text (paragraphs separated by blank lines).
const looksLikeHtml = (str) => /<\/?[a-z][\s\S]*>/i.test(str || '');

/**
 * Renders article / live-update / job body content on the public site.
 *
 * New content saved from the TinyMCE editor is an HTML string (with the bold,
 * italic, underline, colour and highlight formatting baked in) and is rendered
 * as HTML. Older content is plain text, so we keep the original behaviour of
 * splitting on blank lines into paragraphs.
 */
export default function RichContent({ content, className, style }) {
  const text = content || '';

  const cls = ['rich-content', className].filter(Boolean).join(' ');

  if (looksLikeHtml(text)) {
    return (
      <div
        className={cls}
        style={style}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    );
  }

  const paragraphs = text.split('\n\n').filter((p) => p.trim());
  return (
    <div className={cls} style={style}>
      {paragraphs.map((para, idx) => (
        <p key={idx}>{para.trim()}</p>
      ))}
    </div>
  );
}
