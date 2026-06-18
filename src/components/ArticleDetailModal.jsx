import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const getYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export default function ArticleDetailModal({ article, onClose }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Disable body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  // Media playback simulation
  useEffect(() => {
    let interval;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 300);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  if (!article) return null;

  // Split content by paragraph returns
  const paragraphs = article.content
    ? article.content.split('\n\n')
    : [article.excerpt];

  const handleOverlayClick = (e) => {
    if (e.target.className === 'modal-overlay') {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-card">
        {/* Close button */}
        <button className="modal-close-x" onClick={onClose} aria-label="Close modal">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>

        {/* Media or Banner Image */}
        {article.mediaUrl && getYouTubeId(article.mediaUrl) ? (
          <div className="modal-video-container">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${getYouTubeId(article.mediaUrl)}?autoplay=1`}
              title={article.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{ border: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            ></iframe>
          </div>
        ) : article.mediaType ? (
          <div className="modal-video-container">
            {article.mediaType === 'video' ? (
              <div className="modal-mock-video">
                {isPlaying ? (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <div className="video-status-icon">
                      {/* Video playing animation */}
                      <svg width="64" height="64" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M11.5 6.027a.5.5 0 1 1 .707.707L10.207 8.734a.5.5 0 0 1-.708 0L7.5 6.734a.5.5 0 1 1 .708-.707l1.5 1.5 1.792-1.792z" />
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                      </svg>
                    </div>
                    <h4 className="bold">Streaming: {article.title}</h4>
                    <span className="text-muted" style={{ fontSize: '0.8rem', marginTop: '5px' }}>Simulated Video Playback ({progress}%)</span>
                    <div style={{ width: '60%', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', marginTop: '15px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent-color)', transition: 'width 0.3s linear' }} />
                    </div>
                  </div>
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <button
                      onClick={() => setIsPlaying(true)}
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--accent-color)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '2rem',
                        boxShadow: '0 8px 25px rgba(209, 33, 40, 0.5)'
                      }}
                      title="Play video"
                    >
                      <svg width="28" height="28" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: '4px' }}>
                        <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                      </svg>
                    </button>
                    <h4 className="bold" style={{ marginTop: '1.5rem' }}>{article.title}</h4>
                    <span className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Click to Play Video ({article.duration})</span>
                  </div>
                )}
                {/* Control Bar Overlay */}
                <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', padding: '0.75rem 1.5rem', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                  <button onClick={() => setIsPlaying(!isPlaying)} style={{ color: '#fff' }}>
                    {isPlaying ? "Pause" : "Play"}
                  </button>
                  <div style={{ flex: 1, margin: '0 1rem', height: '4px', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: '2px' }}>
                    <div style={{ width: `${progress}%`, height: '100%', backgroundColor: 'var(--accent-color)' }} />
                  </div>
                  <span style={{ color: 'rgba(255,255,255,0.7)' }}>{article.duration}</span>
                </div>
              </div>
            ) : (
              /* Podcast Player layout */
              <div className="modal-mock-video" style={{ background: 'linear-gradient(135deg, #0b2240, #1e3a5f)' }}>
                <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                  {/* Waveform/Visualizer representation */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '60px', marginBottom: '1.5rem' }}>
                    {[...Array(18)].map((_, i) => {
                      const h = isPlaying ? Math.floor(Math.random() * 45) + 15 : 10;
                      return (
                        <div
                          key={i}
                          style={{
                            width: '4px',
                            height: `${h}px`,
                            backgroundColor: isPlaying ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)',
                            borderRadius: '2px',
                            transition: 'height 0.15s ease'
                          }}
                        />
                      );
                    })}
                  </div>

                  <h4 className="bold">{article.title}</h4>
                  <p className="text-gold semibold" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>{article.author}</p>

                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-gold)',
                      color: 'var(--primary-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: '1.5rem',
                      boxShadow: '0 4px 15px rgba(197, 160, 89, 0.4)'
                    }}
                    title={isPlaying ? "Pause podcast" : "Play podcast"}
                  >
                    {isPlaying ? (
                      /* Pause icon */
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5zm5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5z" />
                      </svg>
                    ) : (
                      /* Play icon */
                      <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16" style={{ marginLeft: '2px' }}>
                        <path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393z" />
                      </svg>
                    )}
                  </button>
                  <span className="text-muted" style={{ fontSize: '0.75rem', marginTop: '0.75rem' }}>
                    {isPlaying ? "Streaming Live Audio..." : "Click to Listen to Podcast"} ({article.duration})
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <img src={article.image} alt={article.title} className="modal-banner-img" />
        )}

        {/* Modal Info */}
        <div className="modal-body-content">
          <span className="modal-tag">{article.tag || article.category}</span>
          <h2 className="modal-headline">{article.title}</h2>

          <div className="modal-meta-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="modal-author-avatar">
                {article.author.charAt(0)}
              </span>
              <span className="bold">{article.author}</span>
            </div>
            <span>Published: {article.date}</span>
            <span>{article.readTime}</span>
          </div>

          <div className="modal-article-text">
            {paragraphs.map((para, idx) => (
              <p key={idx}>{para.trim()}</p>
            ))}
          </div>

          {/* Social shares */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem', marginTop: '2rem' }}>
            <span className="bold text-secondary" style={{ fontSize: '0.85rem' }}>Share this article:</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['Facebook', 'Twitter', 'LinkedIn', 'WhatsApp'].map((platform, pIdx) => (
                <button
                  key={pIdx}
                  style={{
                    padding: '0.4rem 0.8rem',
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '2px',
                    fontSize: '0.75rem',
                    fontWeight: 600
                  }}
                  onClick={() => {
                    Swal.fire({
                      title: 'Shared!',
                      text: `Article shared on ${platform}.`,
                      icon: 'success',
                      timer: 1500,
                      showConfirmButton: false,
                      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
                      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
                    });
                  }}
                >
                  {platform}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
