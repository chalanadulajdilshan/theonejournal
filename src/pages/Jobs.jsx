import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import ViewsBadge from '../components/ViewsBadge';

export default function Jobs({ layoutProps }) {
  const [countries, setCountries] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [jobs, setJobs] = useState(null);
  const [selected, setSelected] = useState(null);

  const fetchCountries = async () => {
    try {
      const res = await fetch('/api/get_countries.php?with_jobs=1');
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch {
      setCountries([]);
    }
  };

  const fetchJobs = async (countryId) => {
    setJobs(null);
    try {
      const res = await fetch(`/api/get_jobs.php?country_id=${countryId}`);
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch {
      setJobs([]);
    }
  };

  useEffect(() => {
    fetchCountries();
    const onFocus = () => { fetchCountries(); if (selectedCountry) fetchJobs(selectedCountry.id); };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (selected) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [selected]);

  const handleSelectCountry = (country) => {
    setSelectedCountry(country);
    fetchJobs(country.id);
    // Record a view for this country, and reflect it locally right away
    fetch(`/api/click_country.php?country_id=${country.id}`).catch(() => {});
    setCountries(prev => Array.isArray(prev)
      ? prev.map(c => c.id === country.id ? { ...c, views: (Number(c.views) || 0) + 1 } : c)
      : prev);
  };

  const handleBackToCountries = () => {
    setSelectedCountry(null);
    setJobs(null);
  };

  const handleClose = () => setSelected(null);
  const handleKeyDown = (e) => { if (e.key === 'Escape') handleClose(); };

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
        {!selectedCountry ? (
          <>
            <h1 style={{ marginBottom: '0.5rem', borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-block' }}>
              Foreign Jobs
            </h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '720px', lineHeight: 1.6 }}>
              Select a country to view open positions.
            </p>

            {countries === null ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} style={{ height: '160px', borderRadius: '8px', background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-primary) 50%, var(--bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
                <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
              </div>
            ) : countries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>No open positions at the moment</h3>
                <p className="text-muted">Please check back soon, or reach out at <strong>hello@theonejournal.org</strong></p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '1.25rem' }}>
                {countries.map(country => (
                  <button
                    key={country.id}
                    onClick={() => handleSelectCountry(country)}
                    style={{
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '1.25rem 1rem',
                      gap: '0.75rem',
                      boxShadow: 'var(--card-shadow)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease',
                      color: 'inherit',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {country.flag ? (
                      <img
                        src={country.flag}
                        alt={country.name}
                        style={{ width: '120px', height: '80px', objectFit: 'cover', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ width: '120px', height: '80px', background: 'var(--bg-secondary)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        No flag
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{country.name}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {country.job_count} {country.job_count == 1 ? 'opening' : 'openings'}
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '0.4rem' }}>
                        <ViewsBadge views={country.views} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem' }}>
              <button
                onClick={handleBackToCountries}
                aria-label="Back to countries"
                title="Back to countries"
                style={{
                  position: 'absolute', left: 0, top: '0.25rem',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--accent-gold)', fontWeight: 700, fontSize: '1.6rem',
                  lineHeight: 1, padding: '0.25rem 0.5rem'
                }}
              >
                ←
              </button>
              <h1 style={{ margin: 0, borderBottom: '2px solid var(--accent-gold)', paddingBottom: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.75rem' }}>
                {selectedCountry.flag && (
                  <img src={selectedCountry.flag} alt="" style={{ width: '36px', height: '24px', objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border-color)' }} />
                )}
                Openings in {selectedCountry.name}
              </h1>
              <p style={{ color: 'var(--text-muted)', marginTop: '0.85rem', marginBottom: 0, lineHeight: 1.6 }}>
                Click any role to view the full description and how to apply.
              </p>
            </div>

            {jobs === null ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} style={{ height: '320px', borderRadius: '8px', background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-primary) 50%, var(--bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                ))}
                <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
              </div>
            ) : jobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 1.5rem', border: '1px dashed var(--border-color)', borderRadius: '8px' }}>
                <h3 style={{ marginBottom: '0.5rem' }}>No open positions in this country right now</h3>
                <p className="text-muted">Please check back soon, or reach out at <strong>hello@theonejournal.org</strong></p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {jobs.map(job => (
                  <article
                    key={job.id}
                    onClick={() => setSelected(job)}
                    className="job-card"
                    style={{
                      cursor: 'pointer',
                      background: 'var(--bg-primary)',
                      border: '1px solid var(--border-color)',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      display: 'flex',
                      flexDirection: 'column',
                      boxShadow: 'var(--card-shadow)',
                      transition: 'transform 0.18s ease, box-shadow 0.18s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <div style={{ position: 'relative', width: '100%', paddingTop: '56%', background: 'var(--bg-secondary)' }}>
                      {job.image ? (
                        <img
                          src={job.image}
                          alt={job.title}
                          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          The One Journal · Careers
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '1rem 1.1rem 1.2rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                      <h3 style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.3 }}>{job.title}</h3>
                      {job.description && (
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {job.description}
                        </p>
                      )}
                      <span style={{ marginTop: 'auto', fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent-gold)' }}>
                        View details →
                      </span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {selected && (
        <div
          onClick={handleClose}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.72)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '1rem', animation: 'modalFadeIn 0.18s ease'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-primary)', color: 'var(--text-primary)',
              borderRadius: '10px', maxWidth: '780px', width: '100%',
              maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column',
              boxShadow: '0 20px 60px rgba(0,0,0,0.4)', animation: 'modalSlideIn 0.22s ease'
            }}
          >
            <div style={{ position: 'relative' }}>
              {selected.image ? (
                <img src={selected.image} alt={selected.title} style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }} />
              ) : (
                <div style={{ width: '100%', height: '140px', background: 'linear-gradient(135deg, var(--accent-gold), #8a6a2c)' }} />
              )}
              <button
                onClick={handleClose}
                aria-label="Close"
                style={{
                  position: 'absolute', top: '0.75rem', right: '0.75rem',
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'rgba(0,0,0,0.55)', color: '#fff', border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}
              >
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                </svg>
              </button>
            </div>
            <div style={{ padding: '1.5rem 1.75rem', overflowY: 'auto' }}>
              <h2 style={{ marginTop: 0, marginBottom: '0.5rem', lineHeight: 1.25 }}>{selected.title}</h2>
              {selected.country_name && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {selected.country_flag && (
                    <img src={selected.country_flag} alt="" style={{ width: '22px', height: '15px', objectFit: 'cover', borderRadius: '2px', border: '1px solid var(--border-color)' }} />
                  )}
                  {selected.country_name}
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', lineHeight: 1.75, fontSize: '0.95rem' }}>
                {(selected.description || '').split('\n\n').filter(p => p.trim()).map((p, i) => (
                  <p key={i} style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{p.trim()}</p>
                ))}
                {!selected.description && <p style={{ margin: 0, color: 'var(--text-muted)' }}>More details coming soon.</p>}
              </div>
              <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem' }}>
                <strong>How to apply:</strong> Send your CV and a short cover letter to{' '}
                <a href="mailto:hello@theonejournal.org" style={{ color: 'var(--accent-gold)', fontWeight: 600 }}>hello@theonejournal.org</a>
                {' '}with the subject line "{selected.title}".
              </div>
            </div>
          </div>
          <style>{`
            @keyframes modalFadeIn { from { opacity: 0; } to { opacity: 1; } }
            @keyframes modalSlideIn { from { opacity: 0; transform: translateY(12px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }
          `}</style>
        </div>
      )}
    </Layout>
  );
}
