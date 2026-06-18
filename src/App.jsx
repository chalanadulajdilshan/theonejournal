import { useState, useEffect } from 'react';

// Styles
import './App.css';

// Components
import SectionHeader from './components/SectionHeader';
import FeaturedCard from './components/FeaturedCard';
import ArticleCard from './components/ArticleCard';
import ViewsBadge from './components/ViewsBadge';
import MediaSection from './components/MediaSection';
import ArticlePage from './pages/ArticlePage';
import CustomCursor from './components/CustomCursor';
import Layout from './components/Layout';

// Pages
import AboutUs from './pages/AboutUs';
import Advertise from './pages/Advertise';
import Careers from './pages/Careers';
import ContactUs from './pages/ContactUs';
import Disclaimer from './pages/Disclaimer';
import MeetOurTeam from './pages/MeetOurTeam';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsAndConditions from './pages/TermsAndConditions';
import CategoryPage from './pages/CategoryPage';
import LiveUpdates from './pages/LiveUpdates';
import AddOnService from './pages/AddOnService';
import RatesPricing from './pages/RatesPricing';
import DisplayBanner from './pages/DisplayBanner';
import PartnerContent from './pages/PartnerContent';
import SocialMedia from './pages/SocialMedia';

// Module-level guard so a single page load only registers one site view,
// even though React StrictMode invokes mount effects twice in development.
let siteViewCounted = false;

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    // Read initial theme preference
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  const [articles, setArticles] = useState(null);
  const [breakingNews, setBreakingNews] = useState([]);
  const [liveUpdates, setLiveUpdates] = useState(null);
  const [siteViews, setSiteViews] = useState(null);
  const [categories, setCategories] = useState([]);
  // Remember which live updates have been opened so their titles show as "read"
  const [clickedLiveIds, setClickedLiveIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('clickedLiveIds') || '[]')); }
    catch { return new Set(); }
  });
  const [isLoading, setIsLoading] = useState(true);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

  // Fetch the admin-managed categories & sub-tags that drive the navbar/sections
  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/get_categories.php');
      if (res.ok) {
        const data = await res.json();
        setCategories(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchBreakingNews = async () => {
    try {
      const res = await fetch('/api/get_breaking_news.php');
      if (res.ok) {
        const data = await res.json();
        setBreakingNews(data);
      }
    } catch (err) {
      console.error('Failed to fetch breaking news:', err);
    }
  };

  // Register a site visit (POST) once per page load, then keep the total in state.
  const registerSiteView = async () => {
    try {
      const res = await fetch('/api/site_views.php', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setSiteViews(data.views);
      }
    } catch (err) {
      console.error('Failed to register site view:', err);
    }
  };

  const fetchLiveUpdates = async () => {
    try {
      const res = await fetch('/api/get_live_updates.php?limit=10');
      const data = await res.json();
      setLiveUpdates(Array.isArray(data) ? data : []);
    } catch (err) {
      setLiveUpdates([]);
    }
  };

  // Format a live update timestamp as date + hours:minutes
  // e.g. "Jun 18, 2026, 7:34 PM"
  const liveTimeAgo = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle dark mode side-effect
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Fetch articles from the PHP API
  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/get_articles.php');
      if (res.ok) {
        const data = await res.json();
        setArticles(data);
      }
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleArticleClick = async (article) => {
    setSelectedArticle(article);
    // Open the story as its own page (with header + footer)
    window.location.hash = article && article.id ? `#article-${article.id}` : '#article';
    if (article && article.id) {
      try {
        await fetch('/api/click_article.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: article.id })
        });
        fetchArticles();
      } catch (err) {
        console.error('Failed to log article click:', err);
      }
    }
  };

  // Open a live update as a full page and record its view count
  const handleLiveUpdateClick = (item) => {
    if (item && item.id) {
      setClickedLiveIds(prev => {
        const next = new Set(prev);
        next.add(item.id);
        localStorage.setItem('clickedLiveIds', JSON.stringify([...next]));
        return next;
      });
      fetch('/api/click_live_update.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id })
      }).then(() => fetchLiveUpdates()).catch(() => {});
    }
    handleArticleClick({
      title: item.title,
      excerpt: item.summary || item.title,
      content: item.content || item.summary || 'Stay tuned for more details as this story develops.',
      tag: 'LIVE UPDATE',
      readTime: '1 min read',
      date: new Date(item.created_at).toLocaleDateString(),
      author: item.author || 'Editorial Team',
      image: item.image || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop',
      category: item.category
    });
  };

  useEffect(() => {
    fetchArticles();
    fetchBreakingNews();
    fetchLiveUpdates();
    fetchCategories();

    // Count this visit only once per real page load (StrictMode-safe).
    if (!siteViewCounted) {
      siteViewCounted = true;
      registerSiteView();
    }

    // Listen for hash changes to navigate between pages
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Handle scrolling when hash changes
  useEffect(() => {
    const pageRoutes = [
      '#about-us', '#advertise', '#careers', '#contact-us',
      '#disclaimer', '#meet-our-team', '#privacy-policy', '#terms-and-conditions',
      '#live-updates', '#add-on-service', '#rates-pricing', '#display-banner', '#partner-content', '#social-media'
    ];

    if (pageRoutes.includes(currentHash) || currentHash.startsWith('#category-')) {
      window.scrollTo(0, 0);
    } else if (currentHash && currentHash.startsWith('#section-')) {
      // Smooth scroll to the section after render
      setTimeout(() => {
        const element = document.getElementById(currentHash.replace('#', ''));
        if (element) {
          // Calculate offset to prevent header from hiding the section title
          const headerOffset = 180; 
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
      }, 100);
    } else if (currentHash === '') {
      window.scrollTo(0, 0);
    }
  }, [currentHash]);

  // Deduplicated flat list of every article across all category groups
  // (includes any newly-added admin categories, e.g. "cars")
  const flatArticles = articles
    ? Object.values(articles).flat().filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)
    : [];

  // Filtering articles based on query
  const searchResults = searchQuery
    ? flatArticles.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.category.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  // Helper to split stories into 1 Featured and 4 Grid items
  const getStorySplit = (artList) => {
    const list = artList || [];
    const featured = list[0] || null;
    const gridItems = list.slice(1, 5); // display exactly 4 items in the 2x2 grid
    return { featured, gridItems };
  };

  // Helper to get exactly 3 articles for the "You May Like" grid
  const getYouMayLikeArticles = () => {
    if (!articles) return [];
    const dynamicList = articles.youMayLike || [];
    const fallbacks = [
      ...(articles.world || []),
      ...(articles.business || []),
      ...(articles.tech || []),
      ...(articles.life || [])
    ];
    const result = [...dynamicList];
    for (const art of fallbacks) {
      if (result.length >= 6) break;
      if (!result.some(r => r.id === art.id)) {
        result.push(art);
      }
    }
    return result.slice(0, 6);
  };

  // Articles belonging to a given admin category (matched by id)
  const articlesForCategory = (cat) => flatArticles.filter(a => a.categoryId === cat.id);

  // Categories that get their own homepage "story" section. The special ones
  // (You May Like, Partner Content, Videos & Podcasts) have dedicated sections.
  // Only categories ticked "visible" in the admin appear on the website
  const visibleCategories = categories.filter(c => c.is_visible !== 0);

  // "You May Like" is the auto-generated hero feed shown at the top, so it is
  // excluded from both the navbar and the ordered homepage body sections.
  // Everything else renders in the admin drag order (sort_order).
  const navCategories = visibleCategories.filter(c => c.slug !== 'you-may-like');

  // Prepare layout props for page components
  const layoutProps = {
    darkMode,
    toggleDarkMode,
    searchVal: searchQuery,
    onSearchChange: setSearchQuery,
    tickerItems: breakingNews,
    onArticleClick: handleArticleClick,
    siteViews,
    categories: navCategories
  };

  // Render Static Pages
  switch (currentHash) {
    case '#about-us': return <AboutUs layoutProps={layoutProps} />;
    case '#advertise': return <Advertise layoutProps={layoutProps} />;
    case '#careers': return <Careers layoutProps={layoutProps} />;
    case '#contact-us': return <ContactUs layoutProps={layoutProps} />;
    case '#disclaimer': return <Disclaimer layoutProps={layoutProps} />;
    case '#meet-our-team': return <MeetOurTeam layoutProps={layoutProps} />;
    case '#privacy-policy': return <PrivacyPolicy layoutProps={layoutProps} />;
    case '#terms-and-conditions': return <TermsAndConditions layoutProps={layoutProps} />;
    case '#live-updates': return <LiveUpdates layoutProps={layoutProps} />;
    case '#add-on-service': return <AddOnService layoutProps={layoutProps} />;
    case '#rates-pricing': return <RatesPricing layoutProps={layoutProps} />;
    case '#display-banner': return <DisplayBanner layoutProps={layoutProps} />;
    case '#partner-content': return <PartnerContent layoutProps={layoutProps} />;
    case '#social-media': return <SocialMedia layoutProps={layoutProps} />;

    default: break; // Continue to main app view if no route matched
  }

  // Render Loading Screen if fetching initial data OR articles failed to load
  if (isLoading || !articles) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: darkMode ? '#0f172a' : '#ffffff',
        color: darkMode ? '#f8fafc' : '#121212',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <svg width="40" height="40" viewBox="0 0 50 50" style={{ animation: 'spin 1.5s linear infinite', color: '#c5a059', marginBottom: '1rem' }}>
          <style>{`
            @keyframes spin { 100% { transform: rotate(360deg); } }
            @keyframes dash { 0% { stroke-dasharray: 1, 150; stroke-dashoffset: 0; } 50% { stroke-dasharray: 90, 150; stroke-dashoffset: -35; } 100% { stroke-dasharray: 90, 150; stroke-dashoffset: -124; } }
          `}</style>
          <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="4" style={{ strokeDasharray: '1, 150', strokeDashoffset: 0, animation: 'dash 1.5s ease-in-out infinite', strokeLinecap: 'round' }}></circle>
        </svg>
        <span style={{ fontSize: '0.8rem', fontWeight: 600, letterSpacing: '0.1em', color: '#c5a059' }}>LOADING NEWS PORTAL...</span>
      </div>
    );
  }

  // Full article page: clicking any news opens it as its own page.
  if (currentHash.startsWith('#article')) {
    let art = selectedArticle;
    if (!art && currentHash.startsWith('#article-')) {
      const id = currentHash.replace('#article-', '');
      art = flatArticles.find(a => String(a.id) === id);
    }
    return <ArticlePage layoutProps={layoutProps} article={art} />;
  }

  // Dynamic category page: any #category-<slug> is resolved against the
  // admin-managed categories and its articles are filtered from the feed.
  if (currentHash.startsWith('#category-')) {
    const slug = currentHash.replace('#category-', '');
    // Aliases keep older homepage "View All" links working
    const aliasMap = {
      videos: 'videos-podcasts',
      partner: 'partner-content',
      international: 'you-may-like',
      uae: 'you-may-like'
    };
    const realSlug = aliasMap[slug] || slug;
    const cat = categories.find(c => c.slug === realSlug);
    const list = cat ? articlesForCategory(cat) : [];
    return (
      <CategoryPage
        layoutProps={layoutProps}
        title={cat ? cat.name : 'Category'}
        articlesList={list}
        onArticleClick={handleArticleClick}
      />
    );
  }

  return (
    <div className="app-root">
      <CustomCursor />
      
      <Layout
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
        searchVal={searchQuery}
        onSearchChange={setSearchQuery}
        tickerItems={breakingNews}
        onArticleClick={handleArticleClick}
        siteViews={siteViews}
        categories={navCategories}
      >
        <div className="container" style={{ minHeight: '60vh', marginTop: '1.5rem' }}>
        {searchQuery ? (
          /* Search Results View */
          <div className="home-section">
            <SectionHeader title={`Search Results for "${searchQuery}"`} viewAllLink={null} />
            {searchResults.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem', marginTop: '1.5rem' }}>
                {searchResults.map((article) => (
                  <ArticleCard 
                    key={article.id} 
                    article={article} 
                    onClick={handleArticleClick} 
                  />
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1.5rem', border: '1px dashed var(--border-color)', borderRadius: 'var(--border-radius)', marginTop: '1.5rem' }}>
                <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h3>No articles match your search</h3>
                <p className="text-muted" style={{ marginTop: '0.5rem' }}>Try searching for generic terms like "Dubai", "AI", "Oman", or "Gold".</p>
                <button 
                  onClick={() => setSearchQuery('')} 
                  className="newsletter-btn" 
                  style={{ marginTop: '1.5rem', display: 'inline-block' }}
                >
                  Reset Search
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Main Homepage Sections Layout */
          <div className="main-layout">
            
            {/* 1. TOP SPLIT SECTION: You May Like & Live Feature Path */}
            <div id="section-you-may-like" className="you-may-like-live-split">
              {/* Left Column: You May Like (2/3 width) */}
              <div className="you-may-like-column">
                <SectionHeader title="You May Like" id="you-may-like" viewAllLink="#category-uae" />
                <div className="you-may-like-grid-3">
                  {getYouMayLikeArticles().map((art) => (
                    <ArticleCard key={art.id} article={art} onClick={handleArticleClick} />
                  ))}
                </div>
              </div>

              {/* Right Column: Live Feature Path (1/3 width) */}
              <div className="live-feature-column">
                <div className="live-feature-card">
                  <div className="live-feature-header">
                    <span className="live-feature-title">Live Updates</span>
                    <div className="live-badge">
                      <span className="live-dot"></span>
                      Live
                    </div>
                  </div>
                  {liveUpdates === null ? (
                    /* Loading skeleton */
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '0.5rem 0' }}>
                      {[1,2,3].map(i => (
                        <div key={i} style={{ height: i === 1 ? '180px' : '52px', borderRadius: '6px', background: 'linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-primary) 50%, var(--bg-secondary) 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
                      ))}
                      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
                    </div>
                  ) : liveUpdates.length > 0 ? (
                    <>
                      {/* Featured visual card for the latest live update */}
                      {(() => {
                        const latest = liveUpdates[0];
                        const featuredImage = latest.image || "https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop";
                        return (
                          <div
                            className="live-featured-card"
                            onClick={() => handleLiveUpdateClick(latest)}
                          >
                            <div className="live-featured-img-wrapper">
                              <img src={featuredImage} alt={latest.title} className="live-featured-img" />
                              <span className="live-featured-badge">{liveTimeAgo(latest.created_at)}</span>
                              <span className="live-featured-tag">{latest.category || 'Breaking'}</span>
                            </div>
                            <h4 className={`live-featured-title${clickedLiveIds.has(latest.id) ? ' live-visited' : ''}`}>{latest.title}</h4>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 0.85rem 0.85rem' }}>
                              <ViewsBadge views={latest.views_count} />
                            </div>
                          </div>
                        );
                      })()}

                      {/* Remaining timeline items */}
                      <div className="live-timeline">
                        {liveUpdates.slice(1, 5).map((item) => (
                          <div key={item.id} className="live-timeline-item">
                            <div className="live-timeline-node"></div>
                            <span className="live-time-badge">{liveTimeAgo(item.created_at)}</span>
                            <div
                              className={`live-title${clickedLiveIds.has(item.id) ? ' live-visited' : ''}`}
                              onClick={() => handleLiveUpdateClick(item)}
                            >
                              {item.title}
                            </div>
                            <div style={{ marginTop: '0.35rem' }}>
                              <ViewsBadge views={item.views_count} showLabel={false} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                      No live updates at this moment.
                    </div>
                  )}

                </div>
              </div>
            </div>

            {/* All category sections render in the admin drag order, so
                rearranging categories rearranges the whole homepage body. */}
            {navCategories.map((cat) => {
              const list = articlesForCategory(cat);
              if (list.length === 0) return null;

              // Partner Content → sponsored card grid
              if (cat.slug === 'partner-content') {
                return (
                  <section className="home-section" id={`section-${cat.slug}`} key={cat.id}>
                    <SectionHeader title={cat.name} id={cat.slug} viewAllLink={`#category-${cat.slug}`} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
                      {list.map((art) => (
                        <ArticleCard key={art.id} article={{ ...art, tag: art.tag || 'SPONSORED' }} onClick={handleArticleClick} />
                      ))}
                    </div>
                  </section>
                );
              }

              // Videos & Podcasts → horizontal media carousel
              if (cat.slug === 'videos-podcasts') {
                return (
                  <section className="home-section" id={`section-${cat.slug}`} key={cat.id}>
                    <SectionHeader title={cat.name} id={cat.slug} viewAllLink={`#category-${cat.slug}`} />
                    <MediaSection articles={list} onArticleClick={handleArticleClick} />
                  </section>
                );
              }

              // Regular category → featured + 2x2 grid
              const { featured, gridItems } = getStorySplit(list);
              return (
                <section className="home-section" id={`section-${cat.slug}`} key={cat.id}>
                  <SectionHeader title={cat.name} id={cat.slug} viewAllLink={`#category-${cat.slug}`} />
                  <div className="grid-5-stories">
                    <div className="featured-column">
                      <FeaturedCard article={featured} onClick={handleArticleClick} />
                    </div>
                    <div className="grid-column-2x2">
                      {gridItems.map((art) => (
                        <ArticleCard key={art.id} article={art} onClick={handleArticleClick} />
                      ))}
                    </div>
                  </div>
                </section>
              );
            })}

          </div>
        )}
        </div>
      </Layout>
    </div>
  );
}
