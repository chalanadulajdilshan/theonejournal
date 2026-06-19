import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import RichContent from '../components/RichContent';

const CATEGORIES = ['All', 'General', 'Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'International'];

function timeAgo(dateStr) {
  var now = new Date();
  var past = new Date(dateStr);
  var diffMs = now - past;
  var diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'Just now';
  if (diffMin < 60) return diffMin + ' min ago';
  var diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return diffHr + 'h ago';
  var diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return diffDay + 'd ago';
  return past.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function formatDate(dateStr) {
  var d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) +
    ' — ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
}

export default function LiveUpdates({ layoutProps }) {
  var [updates, setUpdates] = useState([]);
  var [loading, setLoading] = useState(true);
  var [activeCategory, setActiveCategory] = useState('All');
  var [expanded, setExpanded] = useState({});

  function fetchUpdates() {
    setLoading(true);
    fetch('/api/get_live_updates.php?limit=100')
      .then(function(r) { return r.json(); })
      .then(function(data) {
        setUpdates(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(function() { setLoading(false); });
  }

  useEffect(function() {
    fetchUpdates();
    var timer = setInterval(fetchUpdates, 60000);
    return function() { clearInterval(timer); };
  }, []);

  var filtered = activeCategory === 'All'
    ? updates
    : updates.filter(function(u) { return u.category === activeCategory; });

  function toggleExpand(id) {
    setExpanded(function(prev) {
      var next = Object.assign({}, prev);
      next[id] = !next[id];
      return next;
    });
  }

  return (
    <Layout {...layoutProps}>
      <div style={{ backgroundColor: 'var(--bg-primary)', minHeight: '100vh' }}>

        {/* Page hero header */}
        <div style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '3px solid var(--accent-gold)', padding: '2.5rem 1.5rem 1.5rem' }}>
          <div className="container" style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#e53e3e', animation: 'pulse 1.5s ease-in-out infinite' }}></span>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.12em', color: '#e53e3e', textTransform: 'uppercase' }}>Live</span>
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem', color: 'var(--text-primary)' }}>Live Updates</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              Real-time news and developments as they happen. Refreshes every minute.
            </p>
          </div>
        </div>

        {/* Category filter pills */}
        <div style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-primary)', position: 'sticky', top: 0, zIndex: 10, overflowX: 'auto' }}>
          <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0.75rem 1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'nowrap', minWidth: 'max-content' }}>
            {CATEGORIES.map(function(cat) {
              return (
                <button
                  key={cat}
                  onClick={function() { setActiveCategory(cat); }}
                  style={{
                    padding: '0.3rem 0.9rem',
                    borderRadius: '999px',
                    border: '1px solid',
                    borderColor: activeCategory === cat ? 'var(--accent-gold)' : 'var(--border-color)',
                    backgroundColor: activeCategory === cat ? 'var(--accent-gold)' : 'transparent',
                    color: activeCategory === cat ? '#000' : 'var(--text-secondary)',
                    fontWeight: activeCategory === cat ? 700 : 500,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>

          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '0.9rem' }}>Loading live updates...</div>
            </div>
          )}

          {!loading && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📡</div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
                {activeCategory === 'All' ? 'No live updates yet. Check back soon.' : 'No updates in this category.'}
              </p>
            </div>
          )}

          {/* Timeline feed */}
          {!loading && filtered.length > 0 && (
            <div style={{ position: 'relative' }}>
              {/* Vertical timeline line */}
              <div style={{ position: 'absolute', left: '20px', top: '8px', bottom: '8px', width: '2px', backgroundColor: 'var(--border-color)', borderRadius: '1px' }}></div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {filtered.map(function(update, idx) {
                  var isExpanded = expanded[update.id];
                  var hasContent = update.content && update.content.trim().length > 0;
                  return (
                    <div key={update.id} style={{ display: 'flex', gap: '1.5rem', paddingBottom: '2rem', position: 'relative' }}>
                      {/* Dot */}
                      <div style={{ flexShrink: 0, width: '42px', display: 'flex', justifyContent: 'center', paddingTop: '2px' }}>
                        <div style={{
                          width: '14px',
                          height: '14px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#e53e3e' : 'var(--accent-gold)',
                          border: '3px solid var(--bg-primary)',
                          boxShadow: idx === 0 ? '0 0 0 3px rgba(229,62,62,0.25)' : 'none',
                          zIndex: 1,
                          position: 'relative'
                        }}></div>
                      </div>

                      {/* Card */}
                      <div style={{
                        flex: 1,
                        backgroundColor: 'var(--bg-secondary)',
                        border: '1px solid var(--border-color)',
                        borderRadius: '8px',
                        padding: '1.25rem 1.5rem',
                        boxShadow: idx === 0 ? '0 2px 12px rgba(0,0,0,0.07)' : 'none',
                        transition: 'box-shadow 0.2s'
                      }}>
                        {/* Meta row */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.6rem', flexWrap: 'wrap' }}>
                          {idx === 0 && (
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.1em', color: '#e53e3e', textTransform: 'uppercase', backgroundColor: 'rgba(229,62,62,0.1)', padding: '0.15rem 0.5rem', borderRadius: '3px' }}>
                              Latest
                            </span>
                          )}
                          <span style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '3px', backgroundColor: 'rgba(197,160,89,0.12)', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                            {update.category}
                          </span>
                          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginLeft: 'auto' }} title={formatDate(update.created_at)}>
                            {timeAgo(update.created_at)}
                          </span>
                        </div>

                        {/* Title */}
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, lineHeight: 1.4, marginBottom: update.summary ? '0.5rem' : 0, color: 'var(--text-primary)' }}>
                          {update.title}
                        </h3>

                        {/* Summary */}
                        {update.summary && (
                          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                            {update.summary}
                          </p>
                        )}

                        {/* Full content (expandable) */}
                        {hasContent && (
                          <div style={{ marginTop: '0.75rem' }}>
                            {isExpanded && (
                              <RichContent
                                content={update.content}
                                className="live-rich-content"
                                style={{ fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.75, paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', marginBottom: '0.75rem' }}
                              />
                            )}
                            <button
                              onClick={function() { toggleExpand(update.id); }}
                              style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-gold)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                            >
                              {isExpanded ? 'Show less ▴' : 'Read more ▾'}
                            </button>
                          </div>
                        )}

                        {/* Date footer */}
                        <div style={{ marginTop: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {formatDate(update.created_at)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.15); }
        }
      `}</style>
    </Layout>
  );
}
