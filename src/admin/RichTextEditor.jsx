import React from 'react';
import { Editor } from '@tinymce/tinymce-react';

// TinyMCE core is loaded from the open-source jsDelivr build (GPL). This means
// NO API key and NO domain registration are required — it just works locally
// and in production. (Tiny's own cloud CDN would demand an API key.)
const TINYMCE_CDN = 'https://cdn.jsdelivr.net/npm/tinymce@7/tinymce.min.js';

/**
 * Reusable rich-text editor used for the Article body, Live Update body and
 * Job description fields in the admin panel.
 *
 * Behaves like a controlled input: pass the current HTML string as `value` and
 * receive the updated HTML through `onChange`. Authors can paste a full article
 * and then select words to make them Bold / Italic / Underline, change the text
 * colour, or highlight them.
 */
export default function RichTextEditor({ value, onChange, height = 340, placeholder = '' }) {
  return (
    <Editor
      tinymceScriptSrc={TINYMCE_CDN}
      value={value || ''}
      onEditorChange={(html) => onChange(html)}
      init={{
        height,
        menubar: false,
        placeholder,
        branding: false,
        statusbar: true,
        plugins: 'lists link autolink',
        // Exactly the formatting the brief asks for, plus paragraph/heading type
        // (blocks), font size, alignment and lists for general manual editing.
        toolbar:
          'undo redo | blocks fontsize | bold italic underline | forecolor backcolor | ' +
          'alignleft aligncenter alignright alignjustify | bullist numlist | link removeformat',
        // Keep pasted formatting (bold/italic/etc.) but strip Word/Google-Docs
        // inline font-family and font-size so the site typography (set by the
        // chosen block type — Paragraph / Heading 1-6) actually wins on the
        // public article page. Without this, pasted content keeps
        // `font-family: 'Times New Roman'; font-size: 14pt` on every span and
        // every heading ends up looking identical to body text.
        paste_as_text: false,
        paste_webkit_styles: 'color background-color text-align',
        paste_remove_styles_if_webkit: true,
        paste_merge_formats: true,
        paste_postprocess: (_plugin, args) => {
          const strip = (node) => {
            if (node.nodeType === 1) {
              const el = node;
              // Drop Word's MsoNormal / mso-* classes and inline font choices.
              el.removeAttribute('class');
              if (el.style) {
                el.style.removeProperty('font-family');
                el.style.removeProperty('font-size');
                el.style.removeProperty('line-height');
                el.style.removeProperty('mso-ascii-font-family');
                el.style.removeProperty('mso-hansi-font-family');
              }
              // Unwrap empty spans that only carried font-family/size.
              if (el.tagName === 'SPAN' && !el.getAttribute('style') && !el.attributes.length) {
                while (el.firstChild) el.parentNode.insertBefore(el.firstChild, el);
                el.parentNode.removeChild(el);
                return;
              }
            }
            Array.from(node.childNodes || []).forEach(strip);
          };
          strip(args.node);
        },
        // Mirrors the public-site type scale:
        //   H1/H2 → Merriweather (heading)
        //   H3-H6 → Inter Black (sub-heading)
        //   p / body → Inter Medium
        content_style:
          "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;900&family=Merriweather:wght@700&display=swap');" +
          "body { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-weight: 500; font-size: 16px; line-height: 1.75; color: #121212; } " +
          "p { margin: 0 0 1rem; font-size: 1rem; font-weight: 500; } " +
          "h1, h2 { font-family: 'Merriweather', Georgia, serif; font-weight: 700; margin: 1.25rem 0 0.6rem; } " +
          "h3, h4, h5, h6 { font-family: 'Inter', system-ui, sans-serif; font-weight: 900; margin: 1rem 0 0.5rem; } " +
          "h1 { font-size: 2.25rem; line-height: 1.25; } " +
          "h2 { font-size: 1.75rem; line-height: 1.3; } " +
          "h3 { font-size: 1.4rem; line-height: 1.35; } " +
          "h4 { font-size: 1.15rem; line-height: 1.4; } " +
          "h5 { font-size: 1rem; line-height: 1.45; } " +
          "h6 { font-size: 0.85rem; line-height: 1.5; text-transform: uppercase; letter-spacing: 0.5px; } " +
          "span { font-family: inherit; font-size: inherit; }",
        // Swatches offered under the text-colour & highlight buttons: a few ready
        // made highlights and the site's brand colours, plus the basics.
        color_map: [
          'FFF3A3', 'Highlight Yellow',
          'C8E6C9', 'Highlight Green',
          'BBDEFB', 'Highlight Blue',
          'F8BBD0', 'Highlight Pink',
          'D12128', 'Brand Red',
          '0B2240', 'Brand Navy',
          'C5A059', 'Brand Gold',
          '000000', 'Black',
          '7A7A7A', 'Grey',
          'FFFFFF', 'White',
        ],
      }}
    />
  );
}
