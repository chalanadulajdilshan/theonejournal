import { useState, useEffect } from 'react';
import AdminPanel from './AdminPanel';

// Standalone host for the admin dashboard. Provides the data and theme state
// that AdminPanel expects, independent of the public website app.
export default function AdminApp() {
  const [articles, setArticles] = useState(null);
  const [breakingNews, setBreakingNews] = useState([]);
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Apply the theme to the document body.
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode((d) => !d);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/get_articles.php');
      if (res.ok) setArticles(await res.json());
    } catch (err) {
      console.error('Failed to fetch articles:', err);
    }
  };

  const fetchBreakingNews = async () => {
    try {
      const res = await fetch('/api/get_breaking_news.php');
      if (res.ok) setBreakingNews(await res.json());
    } catch (err) {
      console.error('Failed to fetch breaking news:', err);
    }
  };

  useEffect(() => {
    fetchArticles();
    fetchBreakingNews();
  }, []);

  return (
    <AdminPanel
      articles={articles}
      onRefreshArticles={fetchArticles}
      breakingNews={breakingNews}
      onRefreshBreaking={fetchBreakingNews}
      darkMode={darkMode}
      toggleDarkMode={toggleDarkMode}
    />
  );
}
