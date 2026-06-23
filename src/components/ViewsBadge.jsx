import React from 'react';
import { useI18n } from '../i18n/I18nContext';

const formatViews = (count) => {
  const n = Number(count) || 0;
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return n.toString();
};

// Rounded pill showing an article's view count. Always renders (shows "0 views"
// for articles that have not been clicked yet).
export default function ViewsBadge({ views = 0, showLabel = true }) {
  const { t } = useI18n();
  const formatted = formatViews(views);
  const label = t('home.views');
  return (
    <span className="card-views" title={`${formatted} ${label}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
      {showLabel ? `${formatted} ${label}` : formatted}
    </span>
  );
}
