import React, { useState, useEffect } from 'react';

// Styles
import './App.css'; // Will be cleared to prevent conflicts

// Components
import TopHeader from './components/TopHeader';
import MainNavbar from './components/MainNavbar';
import NewsTicker from './components/NewsTicker';
import SectionHeader from './components/SectionHeader';
import FeaturedCard from './components/FeaturedCard';
import ArticleCard from './components/ArticleCard';
import MediaSection from './components/MediaSection';
import ArticleDetailModal from './components/ArticleDetailModal';
import Footer from './components/Footer';
import AdminPanel from './components/AdminPanel';
import CustomCursor from './components/CustomCursor';

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
  const [isLoading, setIsLoading] = useState(true);
  const [currentHash, setCurrentHash] = useState(window.location.hash);

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

  // Sync hash changes for routing
  useEffect(() => {
    const handleHashChange = () => {
      setCurrentHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  useEffect(() => {
    fetchArticles();
    fetchBreakingNews();
  }, []);

  // Compile all articles for global search capability
  const allArticlesList = articles ? [
    ...(articles.partnerContent || []),
    ...(articles.videosAndPodcasts || []),
    ...(articles.youMayLike || []),
    ...(articles.world || []),
    ...(articles.business || []),
    ...(articles.tech || []),
    ...(articles.life || [])
  ] : [];

  // Filtering articles based on query
  const searchResults = searchQuery
    ? allArticlesList.filter(article =>
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

  // Render Admin Panel View if hash matches
  if (currentHash === '#admin') {
    return (
      <>
        <CustomCursor />
        <AdminPanel 
          articles={articles} 
          onRefreshArticles={fetchArticles} 
          breakingNews={breakingNews}
          onRefreshBreaking={fetchBreakingNews}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        />
      </>
    );
  }

  // Render Loading Screen if fetching initial data
  if (isLoading) {
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

  return (
    <div className="app-root">
      <CustomCursor />
      {/* 1. Top Utility Header */}
      <TopHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      {/* 2. Main Navigation Menu */}
      <MainNavbar onSearchChange={setSearchQuery} searchVal={searchQuery} />

      {/* Breaking News Ticker */}
      <NewsTicker 
        tickerItems={breakingNews} 
        onArticleClick={handleArticleClick} 
      />

      <main className="container" style={{ minHeight: '60vh', marginTop: '1.5rem' }}>
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
            
            {/* SECTION 1: Partner Content (UAE) */}
            <section className="home-section" id="section-uae">
              <SectionHeader title="Partner Content (UAE)" id="partner-content" />
              {(() => {
                const { featured, gridItems } = getStorySplit(articles.partnerContent);
                return (
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
                );
              })()}
            </section>

            {/* SECTION 2: Videos & Podcasts */}
            <section className="home-section" id="section-videos-&-podcasts">
              <SectionHeader title="Videos & Podcasts" id="videos-podcasts" />
              <MediaSection 
                articles={articles.videosAndPodcasts || []} 
                onArticleClick={handleArticleClick} 
              />
            </section>

            {/* SECTION 3: You May Like */}
            <section className="home-section" id="section-you-may-like">
              <SectionHeader title="You May Like" id="you-may-like" />
              {(() => {
                const { featured, gridItems } = getStorySplit(articles.youMayLike);
                return (
                  <div className="grid-you-may-like">
                    <div className="featured-column">
                      <FeaturedCard article={featured} onClick={handleArticleClick} />
                    </div>
                    <div className="trending-list-column">
                      {gridItems.map((art, idx) => (
                        <div key={art.id} className="trending-list-card" onClick={() => handleArticleClick(art)}>
                          <span className="trending-number">0{idx + 2}</span>
                          <div className="trending-card-content">
                            <h4 className="trending-headline">{art.title}</h4>
                            <span className="text-muted" style={{ fontSize: '0.7rem', fontWeight: 600 }}>
                              {art.tag} &bull; {art.readTime}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </section>

            {/* SECTION 4: World */}
            <section className="home-section" id="section-world">
              <SectionHeader title="World" id="world" />
              {(() => {
                const { featured, gridItems } = getStorySplit(articles.world);
                return (
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
                );
              })()}
            </section>

            {/* SECTION 5: Business */}
            <section className="home-section" id="section-business">
              <SectionHeader title="Business" id="business" />
              {(() => {
                const { featured, gridItems } = getStorySplit(articles.business);
                return (
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
                );
              })()}
            </section>

            {/* SECTION 6: Tech */}
            <section className="home-section" id="section-tech">
              <SectionHeader title="Tech" id="tech" />
              {(() => {
                const { featured, gridItems } = getStorySplit(articles.tech);
                return (
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
                );
              })()}
            </section>

            {/* SECTION 7: Life */}
            <section className="home-section" id="section-life">
              <SectionHeader title="Life" id="life" />
              {(() => {
                const { featured, gridItems } = getStorySplit(articles.life);
                return (
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
                );
              })()}
            </section>

          </div>
        )}
      </main>

      {/* 4. Footer */}
      <Footer />

      {/* 5. Article Detail Overlay Modal */}
      {selectedArticle && (
        <ArticleDetailModal 
          article={selectedArticle} 
          onClose={() => setSelectedArticle(null)} 
        />
      )}
    </div>
  );
}
