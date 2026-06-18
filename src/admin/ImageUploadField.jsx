import React, { useRef, useState } from 'react';

// Image field with a file-upload button. Uploads to /api/upload_image.php and
// stores the returned path in `value`. A text box is kept so an external URL
// can still be pasted (and existing URL-based articles keep working).
export default function ImageUploadField({ value, onChange, onToast, required }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const res = await fetch('/api/upload_image.php', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.success) {
        onChange(data.url);
        onToast && onToast('Image uploaded.', 'success');
      } else {
        onToast && onToast(data.error || 'Upload failed.', 'error');
      }
    } catch (err) {
      onToast && onToast('Upload failed. Is the server running?', 'error');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {value ? (
          <img
            src={value}
            alt="preview"
            style={{ width: 84, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }}
            onError={(e) => { e.target.style.opacity = '0.3'; }}
          />
        ) : (
          <div style={{ width: 84, height: 60, borderRadius: 6, border: '1px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
            No image
          </div>
        )}
        <button
          type="button"
          className="btn-secondary"
          style={{ width: 'auto' }}
          disabled={uploading}
          onClick={() => fileRef.current && fileRef.current.click()}
        >
          {uploading ? 'Uploading…' : (value ? 'Change Image' : 'Upload Image')}
        </button>
        {value && (
          <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => onChange('')}>
            Remove
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: 'none' }} />
      </div>

      <input
        type="text"
        className="form-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Upload an image, or paste an image URL"
        style={{ marginTop: '0.6rem' }}
        required={required}
      />
    </div>
  );
}
