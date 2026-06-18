import React from 'react';
import Layout from '../components/Layout';
import ArticleCard from '../components/ArticleCard';

export default function CategoryPage({ layoutProps, title, articlesList, onArticleClick }) {
  const safeList = articlesList || [];

  return (
    <Layout {...layoutProps}>
      <div className="container" style={{ padding: '3rem 1.5rem', minHeight: '60vh' }}>
        <h1 style={{ 
          marginBottom: '2rem', 
          borderBottom: '2px solid var(--accent-gold)', 
          paddingBottom: '0.5rem', 
          display: 'inline-block' 
        }}>
          {title}
        </h1>

        {safeList.length > 0 ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '1.5rem' 
          }}>
            {safeList.map(article => (
              <ArticleCard 
                key={article.id} 
                article={article} 
                onClick={onArticleClick} 
              />
            ))}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            No articles available in this category.
          </div>
        )}
      </div>
    </Layout>
  );
}
