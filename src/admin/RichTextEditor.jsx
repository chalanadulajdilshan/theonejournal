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
          'alignleft aligncenter alignright | bullist numlist | link removeformat',
        // Keep pasted formatting (bold/italic/etc.) instead of stripping it.
        paste_as_text: false,
        content_style:
          "body { font-family: 'Inter', system-ui, -apple-system, sans-serif; font-size: 14px; line-height: 1.7; color: #121212; } " +
          "p { margin: 0 0 1rem; }",
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
