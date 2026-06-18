import React from 'react';
import TopHeader from './TopHeader';
import MainNavbar from './MainNavbar';
import NewsTicker from './NewsTicker';
import Footer from './Footer';

/**
 * Layout Component
 * This acts as a wrapper "class" that you can use on any new page.
 * It automatically includes the TopHeader, MainNavbar, NewsTicker, and Footer.
 * 
 * Usage:
 * <Layout darkMode={darkMode} toggleDarkMode={toggleDarkMode} ...>
 *    <main>Your page content here</main>
 * </Layout>
 */
export default function Layout({
  children,
  darkMode,
  toggleDarkMode,
  searchVal,
  onSearchChange,
  tickerItems,
  onArticleClick,
  siteViews,
  categories,
  activeCategory
}) {
  return (
    <div className="layout-wrapper">
      {/* 1. Top Header & Brand */}
      <TopHeader darkMode={darkMode} toggleDarkMode={toggleDarkMode} siteViews={siteViews} />

      {/* 2. Breaking News Ticker (Optional) */}
      {tickerItems && tickerItems.length > 0 && (
        <NewsTicker tickerItems={tickerItems} onArticleClick={onArticleClick} />
      )}

      {/* 3. Main Navigation Bar */}
      <MainNavbar searchVal={searchVal} onSearchChange={onSearchChange} categories={categories} activeCategory={activeCategory} />

      {/* 4. Main Page Content (Injected dynamically) */}
      <div className="main-content-wrapper">
        {children}
      </div>

      {/* 5. Footer */}
      <Footer categories={categories} />
    </div>
  );
}
