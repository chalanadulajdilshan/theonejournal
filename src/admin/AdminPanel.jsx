import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './admin.css';
import ImageUploadField from './ImageUploadField';
import RichTextEditor from './RichTextEditor';

// Strip HTML tags to a plain-text snippet for list previews (descriptions are
// now rich HTML authored in the editor).
const stripHtml = (html) => {
  if (!html) return '';
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return (tmp.textContent || tmp.innerText || '').replace(/\s+/g, ' ').trim();
};

// --- YouTube helpers: derive the thumbnail + auto-calculate MM:SS length ---
const getYouTubeId = (url) => {
  if (!url) return null;
  const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
  return (m && m[2] && m[2].length === 11) ? m[2] : null;
};

const formatMMSS = (totalSeconds) => {
  const s = Math.max(0, Math.round(totalSeconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

let ytApiPromise = null;
const ensureYouTubeApi = () => {
  if (window.YT && window.YT.Player) return Promise.resolve();
  if (ytApiPromise) return ytApiPromise;
  ytApiPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { if (typeof prev === 'function') prev(); resolve(); };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const s = document.createElement('script');
      s.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(s);
    }
  });
  return ytApiPromise;
};

// Loads the video off-screen and reads its duration (no API key needed)
const fetchYouTubeDuration = (videoId) => ensureYouTubeApi().then(() => new Promise((resolve, reject) => {
  const holder = document.createElement('div');
  holder.style.cssText = 'position:fixed;left:-10000px;top:0;width:1px;height:1px;';
  document.body.appendChild(holder);
  let done = false;
  const finish = (fn, val, player) => {
    if (done) return;
    done = true;
    try { player && player.destroy(); } catch (e) { /* ignore */ }
    holder.remove();
    fn(val);
  };
  const player = new window.YT.Player(holder, {
    videoId,
    events: {
      onReady: (e) => finish(resolve, e.target.getDuration(), e.target),
      onError: () => finish(reject, new Error('yt error'), player),
    },
  });
  setTimeout(() => finish(reject, new Error('timeout'), player), 8000);
}));

// Password input with a built-in show/hide (eye) toggle.
function PasswordInput({ value, onChange, placeholder, autoComplete, required }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        className="form-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        required={required}
        style={{ margin: 0, paddingRight: '2.75rem' }}
      />
      <button
        type="button"
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setShow(s => !s)}
        title={show ? 'Hide password' : 'Show password'}
        aria-label={show ? 'Hide password' : 'Show password'}
        style={{ position: 'absolute', top: '50%', right: '0.6rem', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: '0.25rem', zIndex: 2 }}
      >
        {show ? (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="m10.79 12.912-1.614-1.615a3.5 3.5 0 0 1-4.474-4.474l-2.06-2.06C.938 6.278 0 8 0 8s3 5.5 8 5.5a7.029 7.029 0 0 0 2.79-.588zM5.21 3.088A7.028 7.028 0 0 1 8 2.5c5 0 8 5.5 8 5.5s-.939 1.721-2.641 3.238l-2.062-2.062a3.5 3.5 0 0 0-4.474-4.474L5.21 3.089z" />
            <path d="M5.525 7.646a2.5 2.5 0 0 0 2.829 2.829l-2.83-2.829zm4.95.708-2.829-2.83a2.5 2.5 0 0 1 2.829 2.829zm3.171 6-12-12 .708-.708 12 12-.708.708z" />
          </svg>
        ) : (
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
            <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8zM1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z" />
            <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0z" />
          </svg>
        )}
      </button>
    </div>
  );
}

// Textarea that auto-grows in height to fit its content so long titles and
// excerpts are fully visible instead of being clipped on a single scrolling
// line. Behaves like a single-line field (Enter blocked) when singleLine.
function AutoGrowTextarea({ value, singleLine = false, onKeyDown, ...props }) {
  const ref = React.useRef(null);

  const resize = (el) => {
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  };

  // Re-fit whenever the value changes, including when the modal opens with
  // existing content during an edit.
  useEffect(() => {
    resize(ref.current);
  }, [value]);

  return (
    <textarea
      ref={ref}
      rows={1}
      value={value}
      onInput={(e) => resize(e.target)}
      onKeyDown={(e) => {
        if (singleLine && e.key === 'Enter') e.preventDefault();
        onKeyDown?.(e);
      }}
      {...props}
    />
  );
}

export default function AdminPanel({ articles, onRefreshArticles, breakingNews, onRefreshBreaking, darkMode, toggleDarkMode }) {
  // Auth state — the admin panel ALWAYS starts logged out. Every visit (a fresh
  // page load, returning from the website, or after logging out) requires
  // entering the username & password again. Nothing is persisted, so there is
  // no "remembered" auto-login.
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');

  // Login form state
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSubmitting, setLoginSubmitting] = useState(false);

  // Tab routing: 'articles' | 'categories'
  const [activeTab, setActiveTab] = useState('articles');

  // Category and Subcategory list
  const [categoriesList, setCategoriesList] = useState([]);

  // Article list view states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');

  // Drag-and-drop ordering state for the articles table
  const [dragIndex, setDragIndex] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);

  // Drag-and-drop ordering state for the categories list
  const [dragCatIndex, setDragCatIndex] = useState(null);
  const [dragOverCatIndex, setDragOverCatIndex] = useState(null);

  // Modal / Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('add'); // 'add' | 'edit'
  const [editingArticle, setEditingArticle] = useState(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [imageCredit, setImageCredit] = useState('');
  const [categoryId, setCategoryId] = useState(0);
  const [tag, setTag] = useState('');
  const [subcategoryId, setSubcategoryId] = useState(0);
  const [languageId, setLanguageId] = useState('');
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('');
  const [isSponsored, setIsSponsored] = useState(false);
  const [mediaType, setMediaType] = useState(''); // 'video' | 'podcast' | ''
  const [duration, setDuration] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  // SEO metadata
  const [seoTitle, setSeoTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [seoTags, setSeoTags] = useState('');

  // Category Manager tab states
  const [selectedManagerCat, setSelectedManagerCat] = useState(null);
  const [newCatName, setNewCatName] = useState('');
  const [newSubcatName, setNewSubcatName] = useState('');
  const [editingCatId, setEditingCatId] = useState(null);
  const [editingCatName, setEditingCatName] = useState('');
  const [editingSubcatId, setEditingSubcatId] = useState(null);
  const [editingSubcatName, setEditingSubcatName] = useState('');

  // Breaking News Manager state
  const [newBreakingTitle, setNewBreakingTitle] = useState('');
  const [editingBreakingId, setEditingBreakingId] = useState(null);
  const [editingBreakingTitle, setEditingBreakingTitle] = useState('');

  // Pages Manager state
  const [selectedPageSlug, setSelectedPageSlug] = useState(null);
  const [editingPageTitle, setEditingPageTitle] = useState('');
  const [editingPageContent, setEditingPageContent] = useState('');
  const [pagesLoading, setPagesLoading] = useState(false);
  const [pagesSaving, setPagesSaving] = useState(false);

  // Live Updates Manager state
  const [liveUpdates, setLiveUpdates] = useState([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [editingLiveId, setEditingLiveId] = useState(null);
  const [luTitle, setLuTitle] = useState('');
  const [luSummary, setLuSummary] = useState('');
  const [luContent, setLuContent] = useState('');
  const [luImage, setLuImage] = useState('');
  const [luAuthor, setLuAuthor] = useState('Editorial Team');
  const [luCategory, setLuCategory] = useState('General');
  const [luPublished, setLuPublished] = useState(true);
  const [luFormOpen, setLuFormOpen] = useState(false);
  const [luSaving, setLuSaving] = useState(false);

  const LU_CATEGORIES = ['General', 'Politics', 'Business', 'Technology', 'Sports', 'Entertainment', 'Health', 'International'];

  // Jobs Manager state
  const [jobs, setJobs] = useState([]);
  const [jobsLoading, setJobsLoading] = useState(false);
  const [editingJobId, setEditingJobId] = useState(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobImage, setJobImage] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [jobPublished, setJobPublished] = useState(true);
  const [jobCountryId, setJobCountryId] = useState('');
  const [jobFormOpen, setJobFormOpen] = useState(false);
  const [jobSaving, setJobSaving] = useState(false);
  const [jobDragIndex, setJobDragIndex] = useState(null);
  const [jobDragOverIndex, setJobDragOverIndex] = useState(null);

  // Languages Manager state
  const [languages, setLanguages] = useState([]);
  const [languagesLoading, setLanguagesLoading] = useState(false);
  const [editingLanguageId, setEditingLanguageId] = useState(null);
  const [languageName, setLanguageName] = useState('');
  const [languageCode, setLanguageCode] = useState('');
  const [languageFormOpen, setLanguageFormOpen] = useState(false);
  const [languageSaving, setLanguageSaving] = useState(false);

  // Countries Manager state
  const [countries, setCountries] = useState([]);
  const [countriesLoading, setCountriesLoading] = useState(false);
  const [editingCountryId, setEditingCountryId] = useState(null);
  const [countryName, setCountryName] = useState('');
  const [countryFlag, setCountryFlag] = useState('');
  const [countryFormOpen, setCountryFormOpen] = useState(false);
  const [countrySaving, setCountrySaving] = useState(false);

  // Users Manager state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [userUsername, setUserUsername] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [userFormOpen, setUserFormOpen] = useState(false);
  const [userSaving, setUserSaving] = useState(false);

  // Account / Credentials Manager state
  const [accNewUsername, setAccNewUsername] = useState('');
  const [accNewPassword, setAccNewPassword] = useState('');
  const [accConfirmPassword, setAccConfirmPassword] = useState('');
  const [accCurrentPassword, setAccCurrentPassword] = useState('');
  const [accSaving, setAccSaving] = useState(false);

  const STATIC_PAGES = [
    { slug: 'about-us', label: 'About Us', hash: '#about-us' },
    { slug: 'advertise', label: 'Advertise With Us', hash: '#advertise' },
    { slug: 'careers', label: 'Careers', hash: '#careers' },
    { slug: 'contact-us', label: 'Contact Us', hash: '#contact-us' },
    { slug: 'disclaimer', label: 'Disclaimer', hash: '#disclaimer' },
    { slug: 'meet-our-team', label: 'Meet Our Team', hash: '#meet-our-team' },
    { slug: 'privacy-policy', label: 'Privacy Policy', hash: '#privacy-policy' },
    { slug: 'terms-and-conditions', label: 'Terms & Conditions', hash: '#terms-and-conditions' },
  ];

  const PAGE_DEFAULTS = {
    'about-us': {
      title: 'ABOUT US',
      content: `The One Journal is an independent digital news and media platform founded in 2026 by Small Team of Freelancers based in GCC dedicated to connecting people with the stories that shape our world. Guided by our vision of "Connecting The World Together," we strive to deliver accurate, timely, and meaningful journalism that informs, educates, and inspires.

Our mission is to keep readers informed through factual reporting, in-depth analysis, and engaging stories across a wide range of topics including world news, business, technology, finance, politics, entertainment, sports, and lifestyle.

Our goal is to present information in a clear, balanced, and accessible way so readers can stay informed and make confident decisions.

At The One Journal, we believe that trust is earned through integrity. Every article is created with a commitment to factual reporting, responsible journalism, and editorial independence. Our team works continuously to bring you breaking news, exclusive features, opinion pieces, and educational content that connects people with the stories shaping our world.

As the media landscape continues to evolve, we embrace innovation to bring news to audiences across multiple platforms while staying true to our core values of accuracy, credibility, and accountability.

Whether you're following breaking news, exploring in-depth analysis, or discovering fresh perspectives, The One Journal is committed to being your trusted source for reliable information from around the world.

Thank you for choosing The One Journal. Together, we stay informed, connected, and empowered.`
    },
    'advertise': {
      title: 'ADVERTISE WITH US',
      content: `The One Journal is an independent digital news and media platform founded in 2026 by a small team of freelancers based in GCC, dedicated to connecting people with the stories that shape our world.

Reach our engaged global audience through targeted advertising opportunities tailored to your brand.

Partner Content — Sponsored articles and brand features written by our editorial team.

Display Banner Ads — Premium banner placements across high-traffic sections of the website.

Social Media Promotion — Amplify your message through our social media channels.

Newsletter Advertisements — Reach our subscriber base directly in their inbox.

Rates & Pricing — Competitive pricing packages for every budget and campaign goal.

To request a quote or discuss partnership opportunities, please contact us at hello@theonejournal.org`
    },
    'careers': {
      title: 'Careers at The One Journal',
      content: `Excellence begins with exceptional people.

The One Journal is a premium news and media platform dedicated to delivering trusted journalism, insightful analysis, and compelling stories. Our success is driven by professionals who share our commitment to quality and innovation.

Why Join Us?
- Work with a passionate and professional editorial team
- Publish content that reaches a global audience
- Flexible and remote-friendly opportunities
- Continuous learning and career growth
- A culture that values creativity and integrity

Open Positions:
- Freelance Writer
- News Editor
- Content Strategist
- Journalist
- Marketing Executive
- Photographer
- Video Producer

Start Your Journey
Tell us about yourself and share your best work at hello@theonejournal.org

Together, let's build the future of premium journalism.`
    },
    'contact-us': {
      title: 'CONTACT US',
      content: `Welcome to The One Journal

We believe great journalism begins with great conversations. Whether you have breaking news, feedback, a business inquiry, or simply want to connect with our team, we're here to listen.

General Support / Advertising & Sponsorships / Partnerships & Business:
hello@theonejournal.org

Editorial Desk:
admin@theonejournal.org

Our editorial team values transparency, integrity, and professionalism in every interaction. Thank you for helping us build a trusted global news platform.`
    },
    'disclaimer': {
      title: 'Disclaimer',
      content: `The information published on The One Journal is provided for general informational and educational purposes only. While we strive to ensure that all content is accurate and up to date, we make no representations or warranties of any kind regarding the completeness, reliability, or accuracy of the information.

Any action you take based on the information found on this website is strictly at your own risk. The One Journal shall not be held liable for any losses or damages arising from the use of our website.

The views and opinions expressed in articles written by contributors or guest authors are their own and do not necessarily reflect the official position of The One Journal.

We reserve the right to modify, update, or remove content without prior notice.

Editorial Disclaimer
The One Journal is an independent news and media platform committed to providing timely news, opinions, and analysis. Although every effort is made to verify facts before publication, errors or omissions may occasionally occur.

Financial Information Disclaimer
Some articles may discuss financial markets, cryptocurrencies, stocks, or investments. The information provided is for educational purposes only and should not be considered financial, investment, legal, or tax advice.

External Links
Our website may contain links to third-party websites for reference or convenience. We do not control, endorse, or guarantee the accuracy of external websites.

Copyright Notice
All original content published on The One Journal, including text, graphics, logos, and multimedia, is protected by copyright laws. Unauthorized reproduction or distribution without prior written permission is prohibited.`
    },
    'meet-our-team': {
      title: 'Meet Our Team',
      content: `Ahamed Zumry — Founder
Leads the editorial vision and oversees all content published on The One Journal.

Freya Johnson — Co-founder & Managing Editor
Coordinates the editorial team and ensures every article meets quality standards.

Ayesha Anees — Technology Editor
Reports on technology, AI, startups, and digital innovation.

Ansha Gurung — Lifestyle & Culture Writer
Writes features on travel, entertainment, health, and lifestyle.

Mohamed Rimzan — Social Media Manager
Handles social media strategy and community interaction.

Together, we strive to deliver accurate, timely, and engaging journalism that connects readers across the globe.`
    },
    'privacy-policy': {
      title: 'Privacy Policy',
      content: `Effective Date: 01/06/2025 | Last Updated: 15/06/2025

Welcome to The One Journal. Your privacy is important to us. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.

By accessing or using The One Journal, you agree to the practices described in this Privacy Policy.

1. Information We Collect
We may collect personal information you voluntarily provide: full name, email address, phone number, contact forms, newsletter subscriptions, and comments. We also automatically collect non-personal data such as IP address, browser type, pages visited, and general location.

2. How We Use Your Information
We use collected information to operate and maintain our website, publish and improve content, respond to inquiries, send newsletters (with consent), personalize user experience, analyze traffic, prevent fraud, and comply with legal obligations.

3. Cookies and Tracking Technologies
We use cookies to remember preferences, analyze performance, and improve navigation. Users may disable cookies through browser settings; however, certain features may not function properly.

4. Data Security
We implement commercially reasonable administrative, technical, and organizational measures to protect your information. However, no method of internet transmission is completely secure.

5. Data Retention
We retain personal information only for as long as necessary to provide our services, comply with legal obligations, and maintain legitimate business records.

6. Your Privacy Rights
Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data.

7. Changes to This Privacy Policy
We reserve the right to modify this Privacy Policy at any time. Continued use of the website constitutes acceptance of the updated policy.

18. Contact Us
If you have questions regarding this Privacy Policy, please contact us at hello@theonejournal.org`
    },
    'terms-and-conditions': {
      title: 'Terms and Conditions',
      content: `Effective Date: June 15, 2026 | Last Updated: June 16, 2026

Welcome to The One Journal. By accessing or using our website, you agree to comply with and be bound by the following Terms and Conditions. If you do not agree, please discontinue using our website.

Acceptable Use
You agree not to use the website for unlawful purposes, copy or scrape content using automated tools, upload malware or harmful code, misrepresent your identity, or violate the rights of others.

Intellectual Property
All content on The One Journal — articles, text, images, videos, graphics, logos, designs, and website layout — is owned by or licensed to The One Journal and protected by copyright law. Unauthorized reproduction or distribution without written permission is prohibited.

Accuracy of Information
While we strive for accuracy, news stories may evolve and information may change over time. We do not guarantee that all content is complete, current, or error-free.

Third-Party Links
Our website may include links to external websites. The One Journal is not responsible for the content, policies, or practices of those third-party sites.

Sponsored Content
Some articles or features may contain sponsored or promotional material. Such content will be identified where appropriate.

Limitation of Liability
To the fullest extent permitted by law, The One Journal shall not be liable for direct or indirect damages, financial losses, data loss, business interruption, or decisions made based on published content. Use of the website is entirely at your own risk.

Changes to These Terms
We reserve the right to update or modify these Terms and Conditions at any time without prior notice. Continued use of the website after changes are posted constitutes acceptance of the revised terms.

Contact Us
Email: hello@theonejournal.org | Website: https://theonejournal.org

By using The One Journal, you acknowledge that you have read and agreed to these Terms and Conditions.`
    }
  };

  // Top Header Settings state
  const [headerRates, setHeaderRates] = useState([]);
  const [headerRatesLoading, setHeaderRatesLoading] = useState(false);


  const addToast = (message, type = 'success') => {
    Swal.mixin({
      toast: true,
      position: 'bottom-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    }).fire({
      icon: type,
      title: message
    });
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/get_categories.php');
      if (res.ok) {
        const data = await res.json();
        setCategoriesList(data);

        // Update manager category references
        if (data.length > 0) {
          if (!selectedManagerCat) {
            setSelectedManagerCat(data[0]);
          } else {
            const updated = data.find(c => c.id === selectedManagerCat.id);
            setSelectedManagerCat(updated || data[0]);
          }
        } else {
          setSelectedManagerCat(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchHeaderRates = async () => {
    setHeaderRatesLoading(true);
    try {
      const res = await fetch('/api/get_configs.php?key=top_header_rates');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.value) {
          setHeaderRates(data.value);
        }
      }
    } catch (err) {
      console.error('Failed to fetch header rates:', err);
    } finally {
      setHeaderRatesLoading(false);
    }
  };

  const handleSaveHeaderRates = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/save_configs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'top_header_rates', value: headerRates })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Top header settings saved successfully!', 'success');
      } else {
        addToast(data.error || 'Failed to save settings.', 'error');
      }
    } catch (err) {
      addToast('Connection error while saving settings.', 'error');
    }
  };

  const handleRateChange = (index, field, value) => {
    const updated = [...headerRates];
    updated[index][field] = value;
    setHeaderRates(updated);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!loginUser || !loginPass) {
      setLoginError('Please enter both username and password.');
      return;
    }

    setLoginSubmitting(true);
    setLoginError('');

    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: loginUser, password: loginPass })
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setAdminUsername(data.username);
        addToast(`Welcome back, ${data.username}!`, 'success');
        onRefreshArticles();
        await fetchCategories();
        await fetchLanguages();
        await fetchHeaderRates();
      } else {
        setLoginError(data.error || 'Invalid credentials.');
      }
    } catch (err) {
      setLoginError('Connection to server failed. Is Apache running?');
    } finally {
      setLoginSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/logout.php');
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(false);
        setAdminUsername('');
        addToast('Logged out successfully.', 'success');
      }
    } catch (err) {
      addToast('Logout failed.', 'error');
    }
  };

  const handleViewWebsite = () => {
    // Admin lives on its own page now — just open the public website.
    window.location.href = '/';
  };

  // Compile a deduplicated flat list of articles. The public feed repeats
  // top-viewed items inside the "You May Like" group, which would otherwise
  // show duplicate rows and break the category filter / counts.
  const allArticlesList = articles
    ? Object.values(articles).flat().filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)
    : [];

  // Categorized breakdown stats
  const totalCount = allArticlesList.length;
  const sponsoredCount = allArticlesList.filter(a => a.isSponsored).length;
  const videoPodcastCount = allArticlesList.filter(a => a.category.toLowerCase() === 'videos & podcasts').length;
  const partnerCount = allArticlesList.filter(a => a.category.toLowerCase() === 'partner content').length;

  // Filter list
  const filteredArticles = allArticlesList.filter(art => {
    const matchesSearch = art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase());

    if (categoryFilter === 'All') return matchesSearch;
    return matchesSearch && art.category.toLowerCase() === categoryFilter.toLowerCase();
  });

  // Open Modal for Add
  const openAddModal = () => {
    setFormMode('add');
    setEditingArticle(null);
    setTitle('');
    setExcerpt('');
    setContent('');
    setImage('');
    setImageCredit('');

    // Select first category on load (skip 'You May Like' — it's auto-populated by views)
    const selectableCats = categoriesList.filter(c => c.slug !== 'you-may-like');
    if (selectableCats.length > 0) {
      const firstCat = selectableCats[0];
      setCategoryId(firstCat.id);
      setCategory(firstCat.name);
      if (firstCat.subcategories && firstCat.subcategories.length > 0) {
        setSubcategoryId(firstCat.subcategories[0].id);
        setTag(firstCat.subcategories[0].name);
      } else {
        setSubcategoryId(0);
        setTag('');
      }
    } else {
      setCategoryId(0);
      setCategory('');
      setSubcategoryId(0);
      setTag('');
    }

    setAuthor('Staff Reporter');
    setReadTime('3 min read');
    setIsSponsored(false);
    setMediaType('');
    setDuration('');
    setMediaUrl('');
    setSeoTitle('');
    setMetaDescription('');
    setSeoTags('');
    setLanguageId(languages.length > 0 ? String(languages[0].id) : '');
    setIsFormOpen(true);
  };

  // Open Modal for Edit
  const openEditModal = (art) => {
    setFormMode('edit');
    setEditingArticle(art);
    setTitle(art.title);
    setExcerpt(art.excerpt);
    setContent(art.content);
    setImage(art.image);
    setImageCredit(art.imageCredit || '');
    setCategoryId(art.categoryId || 0);
    setCategory(art.category);
    setSubcategoryId(art.subcategoryId || 0);
    setTag(art.tag);
    setAuthor(art.author);
    setReadTime(art.readTime);
    setIsSponsored(art.isSponsored || false);
    setMediaType(art.mediaType || '');
    setDuration(art.duration || '');
    setMediaUrl(art.mediaUrl || '');
    setSeoTitle(art.seoTitle || '');
    setMetaDescription(art.metaDescription || '');
    setSeoTags(art.seoTags || '');
    setLanguageId(art.languageId ? String(art.languageId) : '');
    setIsFormOpen(true);
  };

  // Handle Form Submit
  // When a YouTube link is pasted: use its thumbnail as the image and
  // auto-calculate the exact MM:SS length.
  const handleMediaUrlChange = (url) => {
    setMediaUrl(url);
    const id = getYouTubeId(url);
    if (!id) return;
    setImage(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    fetchYouTubeDuration(id)
      .then((secs) => { if (secs > 0) setDuration(formatMMSS(secs)); })
      .catch(() => {});
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    // For Videos & Podcasts the image comes from the YouTube thumbnail, so it
    // isn't required manually.
    const isVideoCat = category.toLowerCase() === 'videos & podcasts';
    if (!title || !excerpt || !content || (!image && !isVideoCat) || !categoryId || !subcategoryId || !author) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    const payload = {
      title,
      excerpt,
      content,
      image,
      imageCredit: imageCredit.trim() || null,
      categoryId,
      subcategoryId,
      author,
      readTime,
      isSponsored: isSponsored ? 1 : 0,
      mediaType: category.toLowerCase() === 'videos & podcasts' ? mediaType : null,
      duration: category.toLowerCase() === 'videos & podcasts' ? duration : null,
      mediaUrl: category.toLowerCase() === 'videos & podcasts' ? mediaUrl : null,
      seoTitle,
      metaDescription,
      seoTags,
      languageId: languageId ? parseInt(languageId) : null
    };

    if (formMode === 'edit') {
      payload.id = editingArticle.id;
      payload.date = editingArticle.date;
    }

    const endpoint = formMode === 'edit' ? '/api/edit_article.php' : '/api/add_article.php';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();

      if (res.ok && data.success) {
        addToast(
          formMode === 'edit' ? 'Article updated successfully!' : 'Article created successfully!',
          'success'
        );
        setIsFormOpen(false);
        onRefreshArticles();
      } else {
        addToast(data.error || 'Failed to save article.', 'error');
      }
    } catch (err) {
      addToast('Network connection failed.', 'error');
    }
  };

  // Delete article via SweetAlert2 confirmation
  const handleDeleteArticle = (art) => {
    Swal.fire({
      title: 'Are you sure?',
      text: `You want to permanently delete: "${art.title}"`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d12128',
      cancelButtonColor: '#7a7a7a',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('/api/delete_article.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: art.id })
          });
          const data = await res.json();

          if (res.ok && data.success) {
            addToast('Article deleted successfully.', 'success');
            onRefreshArticles();
          } else {
            addToast(data.error || 'Failed to delete article.', 'error');
          }
        } catch (err) {
          addToast('Network connection failed.', 'error');
        }
      }
    });
  };

  // DRAG-AND-DROP ARTICLE ORDERING
  // Persists the new display order; the website feed (get_articles) is ordered
  // by sort_order, so the change is reflected on the frontend after refresh.
  const saveArticleOrder = async (newOrderIds) => {
    try {
      const res = await fetch('/api/reorder_articles.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrderIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Article order updated — now live on the website.', 'success');
        onRefreshArticles();
      } else {
        addToast(data.error || 'Failed to reorder.', 'error');
      }
    } catch (err) {
      addToast('Network connection failed.', 'error');
    }
  };

  const handleArticleDrop = (dropIndex) => {
    const fromIndex = dragIndex;
    setDragIndex(null);
    setDragOverIndex(null);
    if (fromIndex === null || fromIndex === dropIndex) return;
    const list = [...filteredArticles];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(dropIndex, 0, moved);
    saveArticleOrder(list.map(a => a.id));
  };

  // CATEGORY & SUBCATEGORY CRUD HANDLERS
  const handleAddCategory = async (e) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_category', name: newCatName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Category created successfully.', 'success');
        setNewCatName('');
        await fetchCategories();
      } else {
        addToast(data.error || 'Failed to add category.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleEditCategory = async (e) => {
    e.preventDefault();
    if (!editingCatName.trim() || !editingCatId) return;

    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_category', id: editingCatId, name: editingCatName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Category updated successfully.', 'success');
        setEditingCatId(null);
        setEditingCatName('');
        await fetchCategories();
        onRefreshArticles(); // Refresh string names in cache
      } else {
        addToast(data.error || 'Failed to update category.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  // Toggle whether a category is shown on the public website
  const handleToggleCategoryVisibility = async (cat) => {
    const newVal = cat.is_visible ? 0 : 1;
    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_category_visibility', id: cat.id, is_visible: newVal })
      });
      const data = await res.json();
      if (data.success) {
        addToast(newVal ? 'Category shown on website.' : 'Category hidden from website.', 'success');
        await fetchCategories();
      } else {
        addToast(data.error || 'Failed to update visibility.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  // Persist a new category order; the website header/sections follow this order
  const saveCategoryOrder = async (newOrderIds) => {
    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder_categories', order: newOrderIds })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Category order updated — now live on the website.', 'success');
        await fetchCategories();
      } else {
        addToast(data.error || 'Failed to reorder.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleCategoryDrop = (dropIndex) => {
    const fromIndex = dragCatIndex;
    setDragCatIndex(null);
    setDragOverCatIndex(null);
    if (fromIndex === null || fromIndex === dropIndex) return;
    const list = [...categoriesList];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(dropIndex, 0, moved);
    saveCategoryOrder(list.map(c => c.id));
  };

  const handleDeleteCategory = (catId) => {
    Swal.fire({
      title: 'Delete Category?',
      text: 'WARNING: This permanently deletes the category, all its sub-tags, AND every article in it. This cannot be undone. Proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d12128',
      cancelButtonColor: '#7a7a7a',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('/api/manage_categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_category', id: catId })
          });
          const data = await res.json();
          if (data.success) {
            addToast('Category deleted successfully.', 'success');
            if (selectedManagerCat && selectedManagerCat.id === catId) {
              setSelectedManagerCat(null);
            }
            await fetchCategories();
            onRefreshArticles();
          } else {
            addToast(data.error || 'Failed to delete category.', 'error');
          }
        } catch (err) {
          addToast('Request failed.', 'error');
        }
      }
    });
  };

  const handleAddSubcategory = async (e) => {
    e.preventDefault();
    if (!newSubcatName.trim() || !selectedManagerCat) return;

    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_subcategory', category_id: selectedManagerCat.id, name: newSubcatName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Sub-tag added successfully.', 'success');
        setNewSubcatName('');
        await fetchCategories();
      } else {
        addToast(data.error || 'Failed to add sub-tag.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleEditSubcategory = async (e) => {
    e.preventDefault();
    if (!editingSubcatName.trim() || !editingSubcatId) return;

    try {
      const res = await fetch('/api/manage_categories.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_subcategory', id: editingSubcatId, name: editingSubcatName.trim() })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Sub-tag updated successfully.', 'success');
        setEditingSubcatId(null);
        setEditingSubcatName('');
        await fetchCategories();
        onRefreshArticles();
      } else {
        addToast(data.error || 'Failed to update sub-tag.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleDeleteSubcategory = (subId) => {
    Swal.fire({
      title: 'Delete Sub-tag?',
      text: 'WARNING: This permanently deletes the sub-tag and any articles using it. This cannot be undone. Proceed?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d12128',
      cancelButtonColor: '#7a7a7a',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('/api/manage_categories.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_subcategory', id: subId })
          });
          const data = await res.json();
          if (data.success) {
            addToast('Sub-tag deleted successfully.', 'success');
            await fetchCategories();
            onRefreshArticles();
          } else {
            addToast(data.error || 'Failed to delete sub-tag.', 'error');
          }
        } catch (err) {
          addToast('Request failed.', 'error');
        }
      }
    });
  };

  // BREAKING NEWS CRUD HANDLERS
  const handleAddBreaking = async (e) => {
    e.preventDefault();
    if (!newBreakingTitle.trim()) return;

    try {
      const res = await fetch('/api/manage_breaking_news.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_breaking', title: newBreakingTitle.trim() })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Breaking news added successfully.', 'success');
        setNewBreakingTitle('');
        onRefreshBreaking();
      } else {
        addToast(data.error || 'Failed to add breaking news.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleEditBreaking = async (e) => {
    e.preventDefault();
    if (!editingBreakingTitle.trim() || !editingBreakingId) return;

    try {
      const res = await fetch('/api/manage_breaking_news.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'edit_breaking', id: editingBreakingId, title: editingBreakingTitle.trim() })
      });
      const data = await res.json();
      if (data.success) {
        addToast('Breaking news updated successfully.', 'success');
        setEditingBreakingId(null);
        setEditingBreakingTitle('');
        onRefreshBreaking();
      } else {
        addToast(data.error || 'Failed to update breaking news.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleDeleteBreaking = (breakingId) => {
    Swal.fire({
      title: 'Delete Breaking News?',
      text: 'Are you sure you want to permanently delete this breaking news line?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d12128',
      cancelButtonColor: '#7a7a7a',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('/api/manage_breaking_news.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete_breaking', id: breakingId })
          });
          const data = await res.json();
          if (data.success) {
            addToast('Breaking news deleted successfully.', 'success');
            onRefreshBreaking();
          } else {
            addToast(data.error || 'Failed to delete breaking news.', 'error');
          }
        } catch (err) {
          addToast('Request failed.', 'error');
        }
      }
    });
  };

  // LIVE UPDATES CRUD HANDLERS
  const fetchLiveUpdates = async () => {
    setLiveLoading(true);
    try {
      const res = await fetch('/api/manage_live_updates.php');
      const data = await res.json();
      setLiveUpdates(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load live updates.', 'error');
    } finally {
      setLiveLoading(false);
    }
  };

  const openAddLiveUpdate = () => {
    setEditingLiveId(null);
    setLuTitle('');
    setLuSummary('');
    setLuContent('');
    setLuImage('');
    setLuAuthor('Editorial Team');
    setLuCategory('General');
    setLuPublished(true);
    setLuFormOpen(true);
  };

  const openEditLiveUpdate = (item) => {
    setEditingLiveId(item.id);
    setLuTitle(item.title);
    setLuSummary(item.summary || '');
    setLuContent(item.content || '');
    setLuImage(item.image || '');
    setLuAuthor(item.author || 'Editorial Team');
    setLuCategory(item.category || 'General');
    setLuPublished(item.is_published === 1 || item.is_published === true);
    setLuFormOpen(true);
  };

  const handleSaveLiveUpdate = async (e) => {
    e.preventDefault();
    if (!luTitle.trim()) return;
    setLuSaving(true);
    const action = editingLiveId ? 'edit' : 'add';
    const payload = {
      action,
      title: luTitle,
      summary: luSummary,
      content: luContent,
      image: luImage,
      author: luAuthor,
      category: luCategory,
      is_published: luPublished ? 1 : 0
    };
    if (editingLiveId) payload.id = editingLiveId;
    try {
      const res = await fetch('/api/manage_live_updates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast(editingLiveId ? 'Live update saved.' : 'Live update published.', 'success');
        setLuFormOpen(false);
        fetchLiveUpdates();
      } else {
        addToast(data.error || 'Failed to save.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    } finally {
      setLuSaving(false);
    }
  };

  const handleToggleLivePublish = async (item) => {
    const newVal = item.is_published ? 0 : 1;
    try {
      const res = await fetch('/api/manage_live_updates.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_publish', id: item.id, is_published: newVal })
      });
      const data = await res.json();
      if (data.success) {
        addToast(newVal ? 'Published.' : 'Set to draft.', 'success');
        fetchLiveUpdates();
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleDeleteLiveUpdate = (id) => {
    Swal.fire({
      title: 'Delete Live Update?',
      text: 'This update will be permanently removed from the website.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d12128',
      cancelButtonColor: '#7a7a7a',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('/api/manage_live_updates.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
          });
          const data = await res.json();
          if (data.success) {
            addToast('Live update deleted.', 'success');
            fetchLiveUpdates();
          } else {
            addToast(data.error || 'Failed to delete.', 'error');
          }
        } catch (err) {
          addToast('Request failed.', 'error');
        }
      }
    });
  };

  // JOBS CRUD HANDLERS
  const fetchJobs = async () => {
    setJobsLoading(true);
    try {
      const res = await fetch('/api/manage_jobs.php');
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : []);
    } catch (err) {
      addToast('Failed to load jobs.', 'error');
    } finally {
      setJobsLoading(false);
    }
  };

  const openAddJob = () => {
    setEditingJobId(null);
    setJobTitle('');
    setJobImage('');
    setJobDescription('');
    setJobPublished(true);
    setJobCountryId('');
    fetchCountries();
    setJobFormOpen(true);
  };

  const openEditJob = (item) => {
    setEditingJobId(item.id);
    setJobTitle(item.title);
    setJobImage(item.image || '');
    setJobDescription(item.description || '');
    setJobPublished(item.is_published === 1 || item.is_published === true);
    setJobCountryId(item.country_id ? String(item.country_id) : '');
    fetchCountries();
    setJobFormOpen(true);
  };

  const handleSaveJob = async (e) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    setJobSaving(true);
    const action = editingJobId ? 'edit' : 'add';
    const payload = {
      action,
      title: jobTitle,
      image: jobImage,
      description: jobDescription,
      is_published: jobPublished ? 1 : 0,
      country_id: jobCountryId === '' ? null : Number(jobCountryId)
    };
    if (editingJobId) payload.id = editingJobId;
    try {
      const res = await fetch('/api/manage_jobs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        addToast(editingJobId ? 'Job saved.' : 'Job published.', 'success');
        setJobFormOpen(false);
        fetchJobs();
      } else {
        addToast(data.error || 'Failed to save.', 'error');
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    } finally {
      setJobSaving(false);
    }
  };

  const handleToggleJobPublish = async (item) => {
    const newVal = item.is_published ? 0 : 1;
    try {
      const res = await fetch('/api/manage_jobs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle_publish', id: item.id, is_published: newVal })
      });
      const data = await res.json();
      if (data.success) {
        addToast(newVal ? 'Published.' : 'Set to draft.', 'success');
        fetchJobs();
      }
    } catch (err) {
      addToast('Request failed.', 'error');
    }
  };

  const handleDeleteJob = (id) => {
    Swal.fire({
      title: 'Delete Job?',
      text: 'This job listing will be permanently removed from the website.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d12128',
      cancelButtonColor: '#7a7a7a',
      confirmButtonText: 'Yes, delete it!',
      background: document.body.classList.contains('dark-mode') ? '#1e293b' : '#ffffff',
      color: document.body.classList.contains('dark-mode') ? '#f8fafc' : '#121212',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await fetch('/api/manage_jobs.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'delete', id })
          });
          const data = await res.json();
          if (data.success) {
            addToast('Job deleted.', 'success');
            fetchJobs();
          } else {
            addToast(data.error || 'Failed to delete.', 'error');
          }
        } catch (err) {
          addToast('Request failed.', 'error');
        }
      }
    });
  };

  const saveJobOrder = async (newOrderIds) => {
    try {
      const res = await fetch('/api/manage_jobs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reorder', order: newOrderIds })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Job order updated — now live on the website.', 'success');
        fetchJobs();
      } else {
        addToast(data.error || 'Failed to reorder.', 'error');
      }
    } catch (err) {
      addToast('Network connection failed.', 'error');
    }
  };

  const handleJobDrop = (dropIndex) => {
    const fromIndex = jobDragIndex;
    setJobDragIndex(null);
    setJobDragOverIndex(null);
    if (fromIndex === null || fromIndex === dropIndex) return;
    const list = [...jobs];
    const [moved] = list.splice(fromIndex, 1);
    list.splice(dropIndex, 0, moved);
    setJobs(list);
    saveJobOrder(list.map(j => j.id));
  };

  // COUNTRIES CRUD HANDLERS
  const fetchCountries = async () => {
    setCountriesLoading(true);
    try {
      const res = await fetch('/api/manage_countries.php');
      const data = await res.json();
      setCountries(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load countries.', 'error');
    } finally {
      setCountriesLoading(false);
    }
  };

  const openAddCountry = () => {
    setEditingCountryId(null);
    setCountryName('');
    setCountryFlag('');
    setCountryFormOpen(true);
  };

  const openEditCountry = (item) => {
    setEditingCountryId(item.id);
    setCountryName(item.name);
    setCountryFlag(item.flag || '');
    setCountryFormOpen(true);
  };

  const handleSaveCountry = async (e) => {
    e.preventDefault();
    if (!countryName.trim()) return;
    setCountrySaving(true);
    const action = editingCountryId ? 'edit' : 'add';
    const payload = { action, name: countryName.trim(), flag: countryFlag };
    if (editingCountryId) payload.id = editingCountryId;
    try {
      const res = await fetch('/api/manage_countries.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(editingCountryId ? 'Country saved.' : 'Country added.', 'success');
        setCountryFormOpen(false);
        fetchCountries();
      } else {
        addToast(data.error || 'Failed to save country.', 'error');
      }
    } catch {
      addToast('Network connection failed.', 'error');
    } finally {
      setCountrySaving(false);
    }
  };

  const handleDeleteCountry = (id) => {
    Swal.fire({
      title: 'Delete Country?',
      text: 'Jobs assigned to this country will become unassigned.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await fetch('/api/manage_countries.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          addToast('Country deleted.', 'success');
          fetchCountries();
        } else {
          addToast(data.error || 'Failed to delete.', 'error');
        }
      } catch {
        addToast('Network connection failed.', 'error');
      }
    });
  };

  // LANGUAGES MANAGER HANDLERS
  const fetchLanguages = async () => {
    setLanguagesLoading(true);
    try {
      const res = await fetch('/api/manage_languages.php');
      const data = await res.json();
      setLanguages(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load languages.', 'error');
    } finally {
      setLanguagesLoading(false);
    }
  };

  const openAddLanguage = () => {
    setEditingLanguageId(null);
    setLanguageName('');
    setLanguageCode('');
    setLanguageFormOpen(true);
  };

  const openEditLanguage = (item) => {
    setEditingLanguageId(item.id);
    setLanguageName(item.name);
    setLanguageCode(item.code || '');
    setLanguageFormOpen(true);
  };

  const handleSaveLanguage = async (e) => {
    e.preventDefault();
    if (!languageName.trim()) return;
    setLanguageSaving(true);
    const action = editingLanguageId ? 'edit' : 'add';
    const payload = { action, name: languageName.trim(), code: languageCode.trim() };
    if (editingLanguageId) payload.id = editingLanguageId;
    try {
      const res = await fetch('/api/manage_languages.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(editingLanguageId ? 'Language saved.' : 'Language added.', 'success');
        setLanguageFormOpen(false);
        fetchLanguages();
      } else {
        addToast(data.error || 'Failed to save language.', 'error');
      }
    } catch {
      addToast('Network connection failed.', 'error');
    } finally {
      setLanguageSaving(false);
    }
  };

  const handleDeleteLanguage = (id) => {
    Swal.fire({
      title: 'Delete Language?',
      text: 'Articles using this language will keep their content but lose the language tag.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await fetch('/api/manage_languages.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          addToast('Language deleted.', 'success');
          fetchLanguages();
        } else {
          addToast(data.error || 'Failed to delete.', 'error');
        }
      } catch {
        addToast('Network connection failed.', 'error');
      }
    });
  };

  // USERS MANAGER HANDLERS
  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await fetch('/api/manage_users.php', { credentials: 'same-origin' });
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch {
      addToast('Failed to load users.', 'error');
    } finally {
      setUsersLoading(false);
    }
  };

  const openAddUser = () => {
    setEditingUserId(null);
    setUserUsername('');
    setUserPassword('');
    setUserFormOpen(true);
  };

  const openEditUser = (item) => {
    setEditingUserId(item.id);
    setUserUsername(item.username);
    setUserPassword('');
    setUserFormOpen(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!userUsername.trim()) {
      addToast('Username is required.', 'error');
      return;
    }
    if (!editingUserId && (!userPassword || userPassword.length < 8)) {
      addToast('Password must be at least 8 characters.', 'error');
      return;
    }
    if (editingUserId && userPassword && userPassword.length < 8) {
      addToast('New password must be at least 8 characters.', 'error');
      return;
    }
    setUserSaving(true);
    const action = editingUserId ? 'edit' : 'add';
    const payload = { action, username: userUsername.trim(), password: userPassword };
    if (editingUserId) payload.id = editingUserId;
    try {
      const res = await fetch('/api/manage_users.php', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast(editingUserId ? 'User saved.' : 'User added.', 'success');
        setUserFormOpen(false);
        fetchUsers();
      } else {
        addToast(data.error || 'Failed to save user.', 'error');
      }
    } catch {
      addToast('Network connection failed.', 'error');
    } finally {
      setUserSaving(false);
    }
  };

  const handleDeleteUser = (id, username) => {
    Swal.fire({
      title: 'Delete User?',
      text: `"${username}" will no longer be able to sign in to the admin panel.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#dc3545'
    }).then(async (r) => {
      if (!r.isConfirmed) return;
      try {
        const res = await fetch('/api/manage_users.php', {
          method: 'POST',
          credentials: 'same-origin',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'delete', id })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          addToast('User deleted.', 'success');
          fetchUsers();
        } else {
          addToast(data.error || 'Failed to delete.', 'error');
        }
      } catch {
        addToast('Network connection failed.', 'error');
      }
    });
  };

  // ACCOUNT / CREDENTIALS HANDLER
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    if (!accCurrentPassword) {
      addToast('Enter your current password to confirm changes.', 'error');
      return;
    }
    if (!accNewUsername.trim() && !accNewPassword) {
      addToast('Enter a new username and/or a new password.', 'error');
      return;
    }
    if (accNewPassword && accNewPassword.length < 8) {
      addToast('New password must be at least 8 characters.', 'error');
      return;
    }
    if (accNewPassword && accNewPassword !== accConfirmPassword) {
      addToast('New password and confirmation do not match.', 'error');
      return;
    }
    setAccSaving(true);
    try {
      const res = await fetch('/api/update_admin.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_password: accCurrentPassword,
          new_username: accNewUsername.trim(),
          new_password: accNewPassword
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Credentials updated successfully.', 'success');
        if (data.username) {
          setAdminUsername(data.username);
        }
        setAccNewUsername('');
        setAccNewPassword('');
        setAccConfirmPassword('');
        setAccCurrentPassword('');
      } else {
        addToast(data.error || 'Failed to update credentials.', 'error');
      }
    } catch (err) {
      addToast('Network connection failed.', 'error');
    } finally {
      setAccSaving(false);
    }
  };

  // PAGES CRUD HANDLERS
  const fetchPageContent = async (slug) => {
    setPagesLoading(true);
    const defaults = PAGE_DEFAULTS[slug] || { title: '', content: '' };
    try {
      const res = await fetch(`/api/get_configs.php?key=page_${slug}`);
      const data = await res.json();
      if (data.success && data.value && data.value.content) {
        setEditingPageTitle(data.value.title || defaults.title);
        setEditingPageContent(data.value.content);
      } else {
        setEditingPageTitle(defaults.title);
        setEditingPageContent(defaults.content);
      }
    } catch (err) {
      setEditingPageTitle(defaults.title);
      setEditingPageContent(defaults.content);
    } finally {
      setPagesLoading(false);
    }
  };

  const handlePageSelect = (slug) => {
    setSelectedPageSlug(slug);
    fetchPageContent(slug);
  };

  const handleSavePage = async (e) => {
    e.preventDefault();
    if (!selectedPageSlug) return;
    setPagesSaving(true);
    try {
      const res = await fetch('/api/save_configs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: `page_${selectedPageSlug}`,
          value: { title: editingPageTitle, content: editingPageContent }
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        addToast('Page saved — changes are now live on the website!', 'success');
      } else {
        addToast(data.error || 'Failed to save page.', 'error');
      }
    } catch (err) {
      addToast('Network connection failed.', 'error');
    } finally {
      setPagesSaving(false);
    }
  };

  const handleResetPage = async () => {
    if (!selectedPageSlug) return;
    setPagesSaving(true);
    try {
      const res = await fetch('/api/save_configs.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: `page_${selectedPageSlug}`, value: { title: '', content: '' } })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setEditingPageTitle('');
        setEditingPageContent('');
        addToast('Page reset to default static content.', 'success');
      }
    } catch (err) {
      addToast('Network connection failed.', 'error');
    } finally {
      setPagesSaving(false);
    }
  };

  // If loading auth state
  if (isAdminLoading) {
    return (
      <div className="admin-login-container" style={{ color: '#ffffff', flexDirection: 'column', gap: '1rem' }}>
        <svg className="spinner" viewBox="0 0 50 50" style={{ width: '40px', height: '40px' }}>
          <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
        </svg>
        <p className="semibold text-gold">Loading Admin Console...</p>
      </div>
    );
  }

  // LOGIN SCREEN VIEW
  if (!isAuthenticated) {
    return (
      <div className="admin-login-container" style={{ position: 'relative' }}>
        <button
          onClick={toggleDarkMode}
          className="theme-toggle-btn"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          aria-label="Toggle Theme"
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            color: '#ffffff',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
        >
          {darkMode ? (
            /* Sun icon */
            <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
              <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
            </svg>
          ) : (
            /* Moon icon */
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.868 0 1.71-.15 2.507-.444a.768.768 0 0 1 1.022.824 8.022 8.022 0 0 1-15.662-2.008zm11.471 4.704a3.208 3.208 0 0 1-3.664-3.664.768.768 0 0 1 .843-.815 5.012 5.012 0 0 0 5.644 5.644.768.768 0 0 1-.823.835z" />
            </svg>
          )}
        </button>
        <div className="admin-login-card">
          <div className="login-header">
            <div className="login-logo">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
              </svg>
            </div>
            <h2>Admin Console</h2>
            <p>Sign in to modify news portal details</p>
          </div>

          {loginError && (
            <div className="login-error-alert">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0L7.1 4.995z" />
              </svg>
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                className="form-input"
                value={loginUser}
                onChange={(e) => setLoginUser(e.target.value)}
                placeholder="admin"
                disabled={loginSubmitting}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                value={loginPass}
                onChange={(e) => setLoginPass(e.target.value)}
                placeholder="••••••••"
                disabled={loginSubmitting}
                required
              />
            </div>
            <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }} disabled={loginSubmitting}>
              {loginSubmitting ? (
                <>
                  <svg className="spinner" viewBox="0 0 50 50">
                    <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                  </svg>
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                'Log In'
              )}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <a href="#" className="semibold" style={{ color: 'var(--accent-gold)', fontSize: '0.85rem', textDecoration: 'none' }}>
              ← Return to Main News Portal
            </a>
          </div>
        </div>
      </div>
    );
  }

  // DASHBOARD VIEW (AUTHENTICATED)
  return (
    <div className="admin-wrapper">
      {/* Admin Navbar */}
      <nav className="admin-navbar">
        <div className="container admin-nav-container">
          <a href="/admin/" className="admin-brand">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
            </svg>
            <span>News Admin Console</span>
          </a>
          <div className="admin-nav-actions">
            <span className="semibold hide-mobile" style={{ fontSize: '0.85rem', marginRight: '0.5rem' }}>
              Logged in: <strong style={{ color: 'var(--accent-gold)' }}>{adminUsername}</strong>
            </span>
            <button
              onClick={toggleDarkMode}
              className="theme-toggle-btn"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
              aria-label="Toggle Theme"
              style={{
                marginRight: '0.5rem',
                border: '1px solid var(--border-color)',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-tertiary)',
                color: 'var(--text-secondary)'
              }}
            >
              {darkMode ? (
                /* Sun icon */
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z" />
                </svg>
              ) : (
                /* Moon icon */
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.868 0 1.71-.15 2.507-.444a.768.768 0 0 1 1.022.824 8.022 8.022 0 0 1-15.662-2.008zm11.471 4.704a3.208 3.208 0 0 1-3.664-3.664.768.768 0 0 1 .843-.815 5.012 5.012 0 0 0 5.644 5.644.768.768 0 0 1-.823.835z" />
                </svg>
              )}
            </button>
            <button onClick={handleViewWebsite} className="btn-secondary">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z" />
              </svg>
              View Website
            </button>
            <button onClick={handleLogout} className="btn-danger">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z" />
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z" />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container" style={{ marginTop: '2rem' }}>
        {/* Quick Stats Grid */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-info">
              <h3>Total Articles</h3>
              <div className="stat-value">{totalCount}</div>
            </div>
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Partner content</h3>
              <div className="stat-value">{partnerCount}</div>
            </div>
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Videos & Podcasts</h3>
              <div className="stat-value">{videoPodcastCount}</div>
            </div>
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-info">
              <h3>Sponsored Ads</h3>
              <div className="stat-value">{sponsoredCount}</div>
            </div>
            <div className="stat-icon">
              <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Tab Selection */}
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', margin: '2rem 0 1.5rem 0', paddingBottom: '0.1rem', overflowX: 'auto', scrollbarWidth: 'thin' }}>
          <button
            onClick={() => setActiveTab('articles')}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'articles' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'articles' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Articles Manager
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'categories' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'categories' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Categories & Sub-tags
          </button>
          <button
            onClick={() => setActiveTab('breaking')}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'breaking' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'breaking' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Breaking News Ticker
          </button>
          <button
            onClick={() => setActiveTab('pages')}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'pages' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'pages' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Pages Manager
          </button>
          <button
            onClick={() => { setActiveTab('jobs'); fetchJobs(); }}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'jobs' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'jobs' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            Foreign Jobs Manager
          </button>
          <button
            onClick={() => { setActiveTab('countries'); fetchCountries(); }}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'countries' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'countries' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            Countries
          </button>
          <button
            onClick={() => { setActiveTab('languages'); fetchLanguages(); }}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'languages' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'languages' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            Languages
          </button>
          <button
            onClick={() => { setActiveTab('liveupdates'); fetchLiveUpdates(); }}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'liveupdates' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'liveupdates' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            Live Updates
          </button>
          <button
            onClick={() => { setActiveTab('users'); fetchUsers(); }}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'users' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'users' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'account' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'account' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)',
              whiteSpace: 'nowrap'
            }}
          >
            Account
          </button>
        </div>

        {/* TAB 1: ARTICLES MANAGER */}
        {activeTab === 'articles' && (
          <div style={{ animation: 'modalSlideIn 0.2s ease' }}>
            {/* Controls Bar */}
            <div className="dashboard-controls">
              <div className="search-filters-wrapper">
                <div className="admin-search-input">
                  <svg className="admin-search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                  </svg>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search articles by title, author, or excerpt..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <select
                  className="admin-select-filter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="All">All Categories</option>
                  {categoriesList.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              <button onClick={openAddModal} className="btn-primary" style={{ width: 'auto' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                </svg>
                Create New Article
              </button>
            </div>

            {/* Table Container */}
            <div className="table-responsive">
              {filteredArticles.length > 0 ? (
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Article Details</th>
                      <th>Category</th>
                      <th>Tag</th>
                      <th>Author</th>
                      <th>Published Date</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredArticles.map((art, index) => (
                      <tr
                        key={art.id}
                        draggable
                        onDragStart={() => setDragIndex(index)}
                        onDragOver={(e) => { e.preventDefault(); if (dragOverIndex !== index) setDragOverIndex(index); }}
                        onDrop={() => handleArticleDrop(index)}
                        onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                        style={{
                          cursor: 'grab',
                          opacity: dragIndex === index ? 0.4 : 1,
                          boxShadow: dragOverIndex === index && dragIndex !== null && dragIndex !== index
                            ? 'inset 0 2px 0 var(--accent-gold)' : undefined
                        }}
                        title="Drag to reorder — the new order goes live on the website"
                      >
                        <td>
                          <div className="table-article-title-cell">
                            <img
                              src={art.image}
                              alt={art.title}
                              className="table-article-img"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop';
                              }}
                            />
                            <div>
                              <div className="table-article-headline">{art.title}</div>
                              <span className="text-muted" style={{ fontSize: '0.75rem' }}>{art.readTime}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="admin-badge badge-cat">{art.category}</span>
                        </td>
                        <td>
                          <span className="admin-badge badge-tag">{art.tag}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{art.author}</td>
                        <td style={{ color: 'var(--text-secondary)' }}>{art.date}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                            <button
                              onClick={() => openEditModal(art)}
                              className="btn-action-edit"
                              title="Edit Article"
                            >
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.03l-.179.178c-.087.088-.22.09-.31.003L1.11 8.85a.25.25 0 0 0-.316.03l-.523.522c-.104.104-.11.272-.012.385l2.634 3.012a.5.5 0 0 0 .375.178H5.5a.5.5 0 0 0 .5-.5z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art)}
                              className="btn-action-delete"
                              title="Delete Article"
                            >
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                                <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
                                <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  <svg width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', color: 'var(--text-muted)' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h3>No articles found</h3>
                  <p style={{ marginTop: '0.5rem' }}>No articles matched your search filters. Try checking spelling or resetting search.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORY & SUB-TAG MANAGER */}
        {activeTab === 'categories' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>

            {/* Left Column: Categories List */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5V3h2v-.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5V3h1v1h-1v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13V4H0V3h1v-.5zM2.5 2a.5.5 0 0 0-.5.5V3h4v-.5a.5.5 0 0 0-.5-.5h-3zM14 3v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V3h4zm-11 1v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V4H3z" />
                </svg>
                Categories
              </h3>

              {/* Add Category Form */}
              <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <input
                  type="text"
                  placeholder="New category name..."
                  className="form-input"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  required
                />
                <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Add</button>
              </form>

              {/* Category Lists */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {categoriesList.map((cat, catIdx) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedManagerCat(cat)}
                    draggable={editingCatId !== cat.id}
                    onDragStart={() => setDragCatIndex(catIdx)}
                    onDragOver={(e) => { e.preventDefault(); if (dragOverCatIndex !== catIdx) setDragOverCatIndex(catIdx); }}
                    onDrop={() => handleCategoryDrop(catIdx)}
                    onDragEnd={() => { setDragCatIndex(null); setDragOverCatIndex(null); }}
                    title="Drag to reorder — the website header & sections follow this order"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: dragOverCatIndex === catIdx && dragCatIndex !== null && dragCatIndex !== catIdx
                        ? 'var(--accent-color)'
                        : (selectedManagerCat?.id === cat.id ? 'var(--accent-gold)' : 'var(--border-color)'),
                      backgroundColor: selectedManagerCat?.id === cat.id ? 'rgba(197, 160, 89, 0.05)' : 'transparent',
                      opacity: dragCatIndex === catIdx ? 0.4 : 1,
                      cursor: 'grab',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    {editingCatId === cat.id ? (
                      <form onSubmit={handleEditCategory} style={{ display: 'flex', gap: '0.25rem', width: '100%' }} onClick={(e) => e.stopPropagation()}>
                        <input
                          type="text"
                          className="form-input"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.85rem' }}
                          required
                          autoFocus
                        />
                        <button type="submit" className="btn-action-edit" style={{ padding: '0.25rem' }}>✓</button>
                        <button type="button" className="btn-action-delete" onClick={() => setEditingCatId(null)} style={{ padding: '0.25rem' }}>×</button>
                      </form>
                    ) : (
                      <>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: selectedManagerCat?.id === cat.id ? 700 : 500 }}>
                          <input
                            type="checkbox"
                            checked={!!cat.is_visible}
                            onClick={(e) => e.stopPropagation()}
                            onChange={() => handleToggleCategoryVisibility(cat)}
                            title={cat.is_visible ? 'Visible on website — untick to hide' : 'Hidden from website — tick to show'}
                            style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)', cursor: 'pointer', flexShrink: 0 }}
                          />
                          <span style={{ opacity: cat.is_visible ? 1 : 0.5 }}>
                            {cat.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>({cat.subcategories?.length || 0} tags)</span>
                          </span>
                        </span>
                        <div style={{ display: 'flex', gap: '0.25rem' }} onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => {
                              setEditingCatId(cat.id);
                              setEditingCatName(cat.name);
                            }}
                            className="btn-action-edit"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(cat.id)}
                            className="btn-action-delete"
                            style={{ padding: '0.25rem 0.5rem' }}
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column: Subcategories List */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              {selectedManagerCat ? (
                <>
                  <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
                      <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm0 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm0 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z" />
                      <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-1zM6.5 7a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8zm0 4a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8z" />
                    </svg>
                    Sub-tags for <strong style={{ color: 'var(--accent-gold)' }}>"{selectedManagerCat.name}"</strong>
                  </h3>

                  {/* Add Subcategory Form */}
                  <form onSubmit={handleAddSubcategory} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                    <input
                      type="text"
                      placeholder={`Add sub-tag to ${selectedManagerCat.name}...`}
                      className="form-input"
                      value={newSubcatName}
                      onChange={(e) => setNewSubcatName(e.target.value)}
                      required
                    />
                    <button type="submit" className="btn-primary" style={{ width: 'auto', padding: '0.5rem 1rem' }}>Add</button>
                  </form>

                  {/* Subcategory List */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem' }}>
                    {selectedManagerCat.subcategories && selectedManagerCat.subcategories.length > 0 ? (
                      selectedManagerCat.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '0.5rem 0.75rem',
                            backgroundColor: 'var(--bg-secondary)',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            fontSize: '0.85rem'
                          }}
                        >
                          {editingSubcatId === sub.id ? (
                            <form onSubmit={handleEditSubcategory} style={{ display: 'flex', gap: '0.25rem', width: '100%' }}>
                              <input
                                type="text"
                                className="form-input"
                                value={editingSubcatName}
                                onChange={(e) => setEditingSubcatName(e.target.value)}
                                style={{ padding: '0.15rem 0.35rem', fontSize: '0.8rem' }}
                                required
                                autoFocus
                              />
                              <button type="submit" className="btn-action-edit" style={{ padding: '0.15rem' }}>✓</button>
                              <button type="button" className="btn-action-delete" onClick={() => setEditingSubcatId(null)} style={{ padding: '0.15rem' }}>×</button>
                            </form>
                          ) : (
                            <>
                              <span>{sub.name}</span>
                              <div style={{ display: 'flex', gap: '0.25rem' }}>
                                <button
                                  onClick={() => {
                                    setEditingSubcatId(sub.id);
                                    setEditingSubcatName(sub.name);
                                  }}
                                  className="btn-action-edit"
                                  style={{ padding: '0.15rem 0.35rem', fontSize: '0.75rem' }}
                                >
                                  ✏️
                                </button>
                                <button
                                  onClick={() => handleDeleteSubcategory(sub.id)}
                                  className="btn-action-delete"
                                  style={{ padding: '0.15rem 0.35rem', fontSize: '0.75rem' }}
                                >
                                  🗑️
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      ))
                    ) : (
                      <div style={{ gridColumn: '1 / -1', color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
                        No sub-tags added yet. Add one above.
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem' }}>
                  Please select or create a category from the left column first.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BREAKING NEWS TICKER MANAGER */}
        {activeTab === 'breaking' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>

            {/* Full-width Table: Live Updates Items */}
            <div style={{ backgroundColor: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
                    <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.002-12a1 1 0 0 0 0 2v5h1.5v1h-3v-1h1.5V6a1 1 0 0 0 0-2h.002z" />
                    <path d="M8 1.918A6.002 6.002 0 0 0 2 8v4h12V8a6.002 6.002 0 0 0-6-6.082zM8 0a8 8 0 0 1 8 8v4h1.5v1h-19v-1H0V8a8 8 0 0 1 8-8z" />
                  </svg>
                  Live Updates &amp; Breaking News Ticker
                </h3>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {breakingNews ? breakingNews.length : 0} item{breakingNews && breakingNews.length !== 1 ? 's' : ''} active
                </span>
              </div>

              {breakingNews && breakingNews.length > 0 ? (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ overflowY: breakingNews.length > 4 ? 'auto' : 'visible', maxHeight: breakingNews.length > 4 ? '340px' : 'none' }}>
                    <table className="admin-table" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                      <thead style={{ position: breakingNews.length > 4 ? 'sticky' : 'static', top: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)' }}>
                        <tr>
                          <th style={{ width: '48px', textAlign: 'center' }}>#</th>
                          <th>Headline Text</th>
                          <th style={{ width: '160px' }}>Date Added</th>
                          <th style={{ width: '100px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {breakingNews.map((item, idx) => (
                          <tr key={item.id}>
                            {editingBreakingId === item.id ? (
                              <td colSpan={4} style={{ padding: '0.6rem 1rem' }}>
                                <form onSubmit={handleEditBreaking} style={{ display: 'flex', gap: '0.5rem', width: '100%', alignItems: 'center' }}>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', minWidth: '24px', textAlign: 'center' }}>{idx + 1}</span>
                                  <input
                                    type="text"
                                    className="form-input"
                                    value={editingBreakingTitle}
                                    onChange={(e) => setEditingBreakingTitle(e.target.value)}
                                    required
                                    autoFocus
                                    style={{ margin: 0, padding: '0.35rem 0.6rem', flex: 1 }}
                                  />
                                  <button type="submit" className="btn-primary" style={{ padding: '0.35rem 0.85rem', width: 'auto', fontSize: '0.78rem', whiteSpace: 'nowrap' }}>Save</button>
                                  <button type="button" onClick={() => setEditingBreakingId(null)} className="btn-secondary" style={{ padding: '0.35rem 0.75rem', width: 'auto', fontSize: '0.78rem' }}>Cancel</button>
                                </form>
                              </td>
                            ) : (
                              <>
                                <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{idx + 1}</td>
                                <td>
                                  <span style={{ fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-primary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {item.title}
                                  </span>
                                </td>
                                <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                                  {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                                </td>
                                <td style={{ textAlign: 'right' }}>
                                  <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                    <button
                                      onClick={() => { setEditingBreakingId(item.id); setEditingBreakingTitle(item.title); }}
                                      className="btn-action-edit"
                                      title="Edit"
                                    >
                                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5z"/>
                                        <path d="M5.5 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.03l-.179.178a.5.5 0 0 0-.12.196l-.51 1.87a.5.5 0 0 0 .617.614l1.871-.51a.5.5 0 0 0 .196-.12l6.634-6.634z"/>
                                      </svg>
                                    </button>
                                    <button
                                      onClick={() => handleDeleteBreaking(item.id)}
                                      className="btn-action-delete"
                                      title="Delete"
                                    >
                                      <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                        <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                      </svg>
                                    </button>
                                  </div>
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="empty-state" style={{ padding: '2.5rem' }}>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center' }}>No live update items yet. Add one below.</p>
                </div>
              )}
            </div>

            {/* Add New Headline Form */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Add New Live Update / Ticker Headline
              </h3>
              <form onSubmit={handleAddBreaking}>
                <div className="form-group">
                  <label htmlFor="breaking-title">Headline Text *</label>
                  <textarea
                    id="breaking-title"
                    className="form-input"
                    value={newBreakingTitle}
                    onChange={(e) => setNewBreakingTitle(e.target.value)}
                    placeholder="e.g. BREAKING: Dubai Future District Announces New $100M Fintech Acceleration Program"
                    rows={4}
                    required
                    style={{ resize: 'vertical' }}
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>
                    Tip: Keep ticker headlines concise and informative so that they fit nicely in the header marquee scrolling area.
                  </small>
                </div>
                <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
                  Add to Live Ticker
                </button>
              </form>
            </div>

          </div>
        )}

        {/* TAB 4: PAGES MANAGER */}
        {activeTab === 'pages' && (
          <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: '2rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>

            {/* Left: Page list */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
                  <path d="M5 4a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm-.5 2.5A.5.5 0 0 1 5 6h6a.5.5 0 0 1 0 1H5a.5.5 0 0 1-.5-.5zM5 8a.5.5 0 0 0 0 1h6a.5.5 0 0 0 0-1H5zm0 2a.5.5 0 0 0 0 1h3a.5.5 0 0 0 0-1H5z"/>
                  <path d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2zm10-1H4a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1z"/>
                </svg>
                Static Pages
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                {STATIC_PAGES.map((page) => (
                  <div
                    key={page.slug}
                    onClick={() => handlePageSelect(page.slug)}
                    style={{
                      padding: '0.65rem 0.85rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: selectedPageSlug === page.slug ? 'var(--accent-gold)' : 'var(--border-color)',
                      backgroundColor: selectedPageSlug === page.slug ? 'rgba(197,160,89,0.06)' : 'transparent',
                      cursor: 'pointer',
                      fontWeight: selectedPageSlug === page.slug ? 700 : 500,
                      fontSize: '0.875rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <span>{page.label}</span>
                    <a
                      href={page.hash}
                      target="_blank"
                      rel="noreferrer"
                      style={{ fontSize: '0.7rem', color: 'var(--accent-gold)', textDecoration: 'none' }}
                      onClick={e => e.stopPropagation()}
                      title="View live page"
                    >
                      ↗
                    </a>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Editor */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              {selectedPageSlug ? (
                <>
                  <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                    Editing:&nbsp;<strong style={{ color: 'var(--accent-gold)' }}>{STATIC_PAGES.find(p => p.slug === selectedPageSlug)?.label}</strong>
                    <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                      ✓ Changes go live on the website immediately after saving
                    </span>
                  </h3>
                  {pagesLoading ? (
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Loading current content...</p>
                  ) : (
                    <form onSubmit={handleSavePage}>
                      <div className="form-group">
                        <label>Page Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={editingPageTitle}
                          onChange={e => setEditingPageTitle(e.target.value)}
                          placeholder={`e.g. ${STATIC_PAGES.find(p => p.slug === selectedPageSlug)?.label}`}
                        />
                      </div>
                      <div className="form-group">
                        <label>Page Content</label>
                        <textarea
                          className="form-textarea"
                          value={editingPageContent}
                          onChange={e => setEditingPageContent(e.target.value)}
                          placeholder="Write the full page content here. Use a blank line between paragraphs to separate them."
                          rows={16}
                          style={{ resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.7' }}
                        />
                        <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.4rem' }}>
                          Separate paragraphs with a blank line. Leave both fields empty and save to restore the default static content.
                        </small>
                      </div>
                      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                        <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={pagesSaving}>
                          {pagesSaving ? 'Saving...' : '✓ Save & Publish Live'}
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ width: 'auto' }}
                          disabled={pagesSaving}
                          onClick={handleResetPage}
                        >
                          ↺ Reset to Default
                        </button>
                      </div>
                    </form>
                  )}
                </>
              ) : (
                <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '4rem 2rem' }}>
                  <svg width="40" height="40" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" style={{ marginBottom: '1rem', opacity: 0.4 }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>Select a page from the left to edit its content.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 5: LIVE UPDATES MANAGER */}
        {activeTab === 'jobs' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Foreign Job Openings</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Published jobs appear live on{' '}
                  <a href="#jobs" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)' }}>theonejournal.com/jobs</a>
                  {' '}— drag rows to reorder; the new order goes live immediately.
                </p>
              </div>
              <button
                onClick={openAddJob}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                New Foreign Job
              </button>
            </div>

            {jobFormOpen && (
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--accent-gold)' }}>
                  {editingJobId ? 'Edit Foreign Job' : 'New Foreign Job'}
                </h4>
                <form onSubmit={handleSaveJob}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Job Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={jobTitle}
                        onChange={e => setJobTitle(e.target.value)}
                        placeholder="e.g. Senior News Editor"
                        required
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Job Image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(shown on the job card &amp; detail modal)</span></label>
                      <ImageUploadField value={jobImage} onChange={setJobImage} onToast={addToast} />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Description *</label>
                      <RichTextEditor
                        value={jobDescription}
                        onChange={setJobDescription}
                        height={360}
                        placeholder="Describe the role, responsibilities, requirements, and how to apply. Select text to format it, change colour or highlight."
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Country <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(used to filter jobs on the website)</span></label>
                      <select
                        className="form-input"
                        value={jobCountryId}
                        onChange={e => setJobCountryId(e.target.value)}
                        style={{ margin: 0 }}
                      >
                        <option value="">— No country —</option>
                        {countries.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <input
                        type="checkbox"
                        id="job-pub"
                        checked={jobPublished}
                        onChange={e => setJobPublished(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                      />
                      <label htmlFor="job-pub" style={{ fontWeight: 500, cursor: 'pointer', margin: 0 }}>Publish immediately (visible on website)</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={jobSaving}>
                      {jobSaving ? 'Saving...' : (editingJobId ? 'Save Changes' : 'Publish Job')}
                    </button>
                    <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setJobFormOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  All Foreign Jobs &nbsp;<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({jobs.length})</span>
                </span>
                <button onClick={fetchJobs} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
                  Refresh
                </button>
              </div>

              {jobsLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : jobs.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No foreign jobs yet. Click <strong>New Foreign Job</strong> to publish your first opening.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ maxHeight: jobs.length > 6 ? '480px' : 'none', overflowY: jobs.length > 6 ? 'auto' : 'visible' }}>
                    <table className="admin-table" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                      <thead style={{ position: jobs.length > 6 ? 'sticky' : 'static', top: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)' }}>
                        <tr>
                          <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                          <th style={{ width: '70px' }}>Image</th>
                          <th>Title</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobs.map((item, idx) => (
                          <tr
                            key={item.id}
                            draggable
                            onDragStart={() => setJobDragIndex(idx)}
                            onDragOver={(e) => { e.preventDefault(); if (jobDragOverIndex !== idx) setJobDragOverIndex(idx); }}
                            onDrop={() => handleJobDrop(idx)}
                            onDragEnd={() => { setJobDragIndex(null); setJobDragOverIndex(null); }}
                            style={{
                              cursor: 'grab',
                              opacity: jobDragIndex === idx ? 0.4 : 1,
                              boxShadow: jobDragOverIndex === idx && jobDragIndex !== null && jobDragIndex !== idx
                                ? 'inset 0 2px 0 var(--accent-gold)' : 'none'
                            }}
                            title="Drag to reorder — the new order goes live on the website"
                          >
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>
                              <span style={{ marginRight: '0.25rem', color: 'var(--text-muted)' }}>⋮⋮</span>{idx + 1}
                            </td>
                            <td>
                              {item.image ? (
                                <img src={item.image} alt="" style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '4px' }} />
                              ) : (
                                <div style={{ width: '48px', height: '48px', borderRadius: '4px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>—</div>
                              )}
                            </td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: item.description ? '0.2rem' : 0 }}>{item.title}</div>
                              {item.description && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{stripHtml(item.description)}</div>
                              )}
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleToggleJobPublish(item)}
                                title={item.is_published ? 'Click to unpublish (set to Draft)' : 'Click to publish'}
                                style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '3px', border: 'none', cursor: 'pointer',
                                  backgroundColor: item.is_published ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.12)',
                                  color: item.is_published ? '#16a34a' : '#6b7280'
                                }}
                              >
                                {item.is_published ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                <button onClick={() => openEditJob(item)} className="btn-action-edit" title="Edit">
                                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5z"/>
                                    <path d="M5.5 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.03l-.179.178a.5.5 0 0 0-.12.196l-.51 1.87a.5.5 0 0 0 .617.614l1.871-.51a.5.5 0 0 0 .196-.12l6.634-6.634z"/>
                                  </svg>
                                </button>
                                <button onClick={() => handleDeleteJob(item.id)} className="btn-action-delete" title="Delete">
                                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {activeTab === 'countries' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Countries</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Add countries with a flag image. Each job can be assigned to one country; the website Jobs page shows flags so visitors can filter by country.
                </p>
              </div>
              <button
                onClick={openAddCountry}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                New Country
              </button>
            </div>

            {countryFormOpen && (
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--accent-gold)' }}>
                  {editingCountryId ? 'Edit Country' : 'New Country'}
                </h4>
                <form onSubmit={handleSaveCountry}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Country Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={countryName}
                        onChange={e => setCountryName(e.target.value)}
                        placeholder="e.g. United Arab Emirates"
                        required
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Flag Image</label>
                      <ImageUploadField value={countryFlag} onChange={setCountryFlag} onToast={addToast} />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={countrySaving}>
                      {countrySaving ? 'Saving...' : (editingCountryId ? 'Save Changes' : 'Add Country')}
                    </button>
                    <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setCountryFormOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  All Countries &nbsp;<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({countries.length})</span>
                </span>
                <button onClick={fetchCountries} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Refresh
                </button>
              </div>
              {countriesLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : countries.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No countries yet. Click <strong>New Country</strong> to add the first one.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                    <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <tr>
                        <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                        <th style={{ width: '90px' }}>Flag</th>
                        <th>Name</th>
                        <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {countries.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{idx + 1}</td>
                          <td>
                            {item.flag ? (
                              <img src={item.flag} alt="" style={{ width: '56px', height: '36px', objectFit: 'cover', borderRadius: '3px', border: '1px solid var(--border-color)' }} />
                            ) : (
                              <div style={{ width: '56px', height: '36px', borderRadius: '3px', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.7rem' }}>—</div>
                            )}
                          </td>
                          <td>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                              <button onClick={() => openEditCountry(item)} className="btn-action-edit" title="Edit">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5z"/>
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteCountry(item.id)} className="btn-action-delete" title="Delete">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'languages' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Languages</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage the languages an article can be published in. Visitors can filter the home page by language.
                </p>
              </div>
              <button
                onClick={openAddLanguage}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                New Language
              </button>
            </div>

            {languageFormOpen && (
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--accent-gold)' }}>
                  {editingLanguageId ? 'Edit Language' : 'New Language'}
                </h4>
                <form onSubmit={handleSaveLanguage}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Language Name *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={languageName}
                        onChange={e => setLanguageName(e.target.value)}
                        placeholder="e.g. English"
                        required
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Code</label>
                      <input
                        type="text"
                        className="form-input"
                        value={languageCode}
                        onChange={e => setLanguageCode(e.target.value)}
                        placeholder="e.g. en"
                        style={{ margin: 0 }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={languageSaving}>
                      {languageSaving ? 'Saving...' : (editingLanguageId ? 'Save Changes' : 'Add Language')}
                    </button>
                    <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setLanguageFormOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  All Languages &nbsp;<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({languages.length})</span>
                </span>
                <button onClick={fetchLanguages} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Refresh
                </button>
              </div>
              {languagesLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : languages.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No languages yet. Click <strong>New Language</strong> to add the first one.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                    <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <tr>
                        <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                        <th>Name</th>
                        <th style={{ width: '120px' }}>Code</th>
                        <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {languages.map((item, idx) => (
                        <tr key={item.id}>
                          <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{idx + 1}</td>
                          <td><div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{item.name}</div></td>
                          <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{item.code || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                              <button onClick={() => openEditLanguage(item)} className="btn-action-edit" title="Edit">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5z"/>
                                </svg>
                              </button>
                              <button onClick={() => handleDeleteLanguage(item.id)} className="btn-action-delete" title="Delete">
                                <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                  <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'liveupdates' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>

            {/* Header bar with Add button and view link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Live Updates Feed</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Published entries appear live on{' '}
                  <a href="#live-updates" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-gold)' }}>theonejournal.com/live-updates</a>
                </p>
              </div>
              <button
                onClick={openAddLiveUpdate}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                New Live Update
              </button>
            </div>

            {/* Add / Edit form */}
            {luFormOpen && (
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-gold)' }}>
                  {editingLiveId ? 'Edit Live Update' : 'New Live Update'}
                </h4>
                <form onSubmit={handleSaveLiveUpdate}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Headline / Title *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={luTitle}
                        onChange={e => setLuTitle(e.target.value)}
                        placeholder="e.g. LIVE: Summit concludes with landmark trade agreement"
                        required
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Category</label>
                      <select className="form-input" value={luCategory} onChange={e => setLuCategory(e.target.value)} style={{ margin: 0 }}>
                        {LU_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0, display: 'flex', alignItems: 'center', gap: '0.6rem', paddingTop: '1.5rem' }}>
                      <input
                        type="checkbox"
                        id="lu-pub"
                        checked={luPublished}
                        onChange={e => setLuPublished(e.target.checked)}
                        style={{ width: '16px', height: '16px', accentColor: 'var(--accent-gold)', cursor: 'pointer' }}
                      />
                      <label htmlFor="lu-pub" style={{ fontWeight: 500, cursor: 'pointer', margin: 0 }}>Publish immediately (visible on website)</label>
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Hero Image <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(shown in widget &amp; detail view)</span></label>
                      <ImageUploadField value={luImage} onChange={setLuImage} onToast={addToast} />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Author / Byline</label>
                      <input
                        type="text"
                        className="form-input"
                        value={luAuthor}
                        onChange={e => setLuAuthor(e.target.value)}
                        placeholder="Editorial Team"
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Short Summary <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(shown in the feed preview)</span></label>
                      <textarea
                        className="form-input"
                        value={luSummary}
                        onChange={e => setLuSummary(e.target.value)}
                        placeholder="One or two sentence summary visible without expanding..."
                        rows={2}
                        style={{ margin: 0, resize: 'vertical' }}
                      />
                    </div>
                    <div className="form-group" style={{ gridColumn: '1 / -1', marginBottom: 0 }}>
                      <label>Full Details / Body <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(shown when reader clicks "Read more")</span></label>
                      <RichTextEditor
                        value={luContent}
                        onChange={setLuContent}
                        height={320}
                        placeholder="Paste or write the full update details here. Select text to format it, change colour or highlight."
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={luSaving}>
                      {luSaving ? 'Saving...' : (editingLiveId ? 'Save Changes' : 'Publish Update')}
                    </button>
                    <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setLuFormOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Live updates table */}
            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  All Entries &nbsp;<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({liveUpdates.length})</span>
                </span>
                <button onClick={fetchLiveUpdates} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16"><path d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/><path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/></svg>
                  Refresh
                </button>
              </div>

              {liveLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : liveUpdates.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No live updates yet. Click <strong>New Live Update</strong> to publish your first entry.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <div style={{ maxHeight: liveUpdates.length > 6 ? '420px' : 'none', overflowY: liveUpdates.length > 6 ? 'auto' : 'visible' }}>
                    <table className="admin-table" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                      <thead style={{ position: liveUpdates.length > 6 ? 'sticky' : 'static', top: 0, zIndex: 1, backgroundColor: 'var(--bg-secondary)' }}>
                        <tr>
                          <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                          <th>Headline</th>
                          <th style={{ width: '120px' }}>Category</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                          <th style={{ width: '140px' }}>Date</th>
                          <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveUpdates.map((item, idx) => (
                          <tr key={item.id}>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: item.summary ? '0.2rem' : 0 }}>{item.title}</div>
                              {item.summary && (
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.summary}</div>
                              )}
                            </td>
                            <td>
                              <span style={{ fontSize: '0.72rem', fontWeight: 600, padding: '0.15rem 0.5rem', borderRadius: '3px', backgroundColor: 'rgba(197,160,89,0.12)', color: 'var(--accent-gold)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                {item.category}
                              </span>
                            </td>
                            <td style={{ textAlign: 'center' }}>
                              <button
                                onClick={() => handleToggleLivePublish(item)}
                                title={item.is_published ? 'Click to unpublish (set to Draft)' : 'Click to publish'}
                                style={{
                                  fontSize: '0.7rem', fontWeight: 700, padding: '0.2rem 0.55rem', borderRadius: '3px', border: 'none', cursor: 'pointer',
                                  backgroundColor: item.is_published ? 'rgba(34,197,94,0.12)' : 'rgba(156,163,175,0.12)',
                                  color: item.is_published ? '#16a34a' : '#6b7280'
                                }}
                              >
                                {item.is_published ? 'Live' : 'Draft'}
                              </button>
                            </td>
                            <td style={{ color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                <button onClick={() => openEditLiveUpdate(item)} className="btn-action-edit" title="Edit">
                                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5z"/>
                                    <path d="M5.5 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.03l-.179.178a.5.5 0 0 0-.12.196l-.51 1.87a.5.5 0 0 0 .617.614l1.871-.51a.5.5 0 0 0 .196-.12l6.634-6.634z"/>
                                  </svg>
                                </button>
                                <button onClick={() => handleDeleteLiveUpdate(item.id)} className="btn-action-delete" title="Delete">
                                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                    <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}

        {/* TAB: ACCOUNT / CREDENTIALS */}
        {activeTab === 'users' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1rem' }}>Admin Panel Users</h3>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Manage the accounts that can sign in to this admin panel. Every user listed here has full access.
                </p>
              </div>
              <button
                onClick={openAddUser}
                className="btn-primary"
                style={{ width: 'auto', padding: '0.5rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
              >
                <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16"><path d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2z"/></svg>
                New User
              </button>
            </div>

            {userFormOpen && (
              <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--accent-gold)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
                <h4 style={{ marginTop: 0, marginBottom: '1.25rem', color: 'var(--accent-gold)' }}>
                  {editingUserId ? 'Edit User' : 'New User'}
                </h4>
                <form onSubmit={handleSaveUser} autoComplete="off">
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Username *</label>
                      <input
                        type="text"
                        className="form-input"
                        value={userUsername}
                        onChange={e => setUserUsername(e.target.value)}
                        placeholder="e.g. editor1"
                        required
                        autoComplete="off"
                        style={{ margin: 0 }}
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>
                        Password {editingUserId ? <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span> : '*'}
                      </label>
                      <PasswordInput
                        value={userPassword}
                        onChange={e => setUserPassword(e.target.value)}
                        placeholder={editingUserId ? '••••••••' : 'Min 8 characters'}
                        autoComplete="new-password"
                        required={!editingUserId}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                    <button type="submit" className="btn-primary" style={{ width: 'auto' }} disabled={userSaving}>
                      {userSaving ? 'Saving...' : (editingUserId ? 'Save Changes' : 'Add User')}
                    </button>
                    <button type="button" className="btn-secondary" style={{ width: 'auto' }} onClick={() => setUserFormOpen(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '6px', boxShadow: 'var(--card-shadow)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                  All Users &nbsp;<span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>({users.length})</span>
                </span>
                <button onClick={fetchUsers} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
                  Refresh
                </button>
              </div>
              {usersLoading ? (
                <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
              ) : users.length === 0 ? (
                <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <p>No users yet. Click <strong>New User</strong> to add one.</p>
                </div>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table" style={{ margin: 0, borderRadius: 0, border: 'none' }}>
                    <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <tr>
                        <th style={{ width: '44px', textAlign: 'center' }}>#</th>
                        <th>Username</th>
                        <th>Created</th>
                        <th style={{ width: '110px', textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((item, idx) => {
                        const isYou = item.username === adminUsername;
                        return (
                          <tr key={item.id}>
                            <td style={{ textAlign: 'center', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.8rem' }}>{idx + 1}</td>
                            <td>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                                {item.username}
                                {isYou && (
                                  <span style={{ marginLeft: '0.5rem', fontSize: '0.7rem', color: 'var(--accent-gold)', fontWeight: 500 }}>(you)</span>
                                )}
                              </div>
                            </td>
                            <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                              {item.created_at ? new Date(item.created_at.replace(' ', 'T')).toLocaleString() : '—'}
                            </td>
                            <td style={{ textAlign: 'right' }}>
                              <div className="action-buttons" style={{ justifyContent: 'flex-end' }}>
                                <button onClick={() => openEditUser(item)} className="btn-action-edit" title="Edit">
                                  <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                    <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5z"/>
                                  </svg>
                                </button>
                                {!isYou && (
                                  <button onClick={() => handleDeleteUser(item.id, item.username)} className="btn-action-delete" title="Delete">
                                    <svg width="13" height="13" fill="currentColor" viewBox="0 0 16 16">
                                      <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                                      <path fillRule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                                    </svg>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'account' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem', maxWidth: '560px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1rem' }}>Account Credentials</h3>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Change the username and password used to sign in to this admin panel. Currently signed in as{' '}
                <strong style={{ color: 'var(--accent-gold)' }}>{adminUsername || '—'}</strong>.
              </p>
            </div>

            <div style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '1.5rem', boxShadow: 'var(--card-shadow)' }}>
              <form onSubmit={handleUpdateCredentials} autoComplete="off">
                <div className="form-group">
                  <label>New Username <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank to keep current)</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={accNewUsername}
                    onChange={e => setAccNewUsername(e.target.value)}
                    placeholder={adminUsername || 'admin'}
                    autoComplete="username"
                  />
                </div>
                <div className="form-group">
                  <label>New Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(min 8 characters, leave blank to keep current)</span></label>
                  <PasswordInput
                    value={accNewPassword}
                    onChange={e => setAccNewPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>
                <div className="form-group">
                  <label>Confirm New Password</label>
                  <PasswordInput
                    value={accConfirmPassword}
                    onChange={e => setAccConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="new-password"
                  />
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '1.25rem 0' }} />

                <div className="form-group">
                  <label>
                    Current Password <span style={{ color: 'var(--accent-color)' }}>*</span>
                    <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (required to confirm)</span>
                  </label>
                  <PasswordInput
                    value={accCurrentPassword}
                    onChange={e => setAccCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    autoComplete="current-password"
                    required
                  />
                </div>

                <button type="submit" className="btn-primary" style={{ width: 'auto', marginTop: '0.5rem' }} disabled={accSaving}>
                  {accSaving ? 'Saving...' : 'Update Credentials'}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 6: TOP HEADER SETTINGS (hidden) */}
        {false && (
          <div style={{ animation: 'modalSlideIn 0.2s ease' }}>
            <div className="category-manager-grid">
              <div className="category-list-panel">
                <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>Top Header Rates Editor</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                  Modify the display text and values for the live information scrolling in the top bar. Note that adding or removing elements is not supported in the UI yet; you can only edit existing values.
                </p>

                {headerRatesLoading ? (
                  <p>Loading settings...</p>
                ) : (
                  <form onSubmit={handleSaveHeaderRates}>
                    <div className="rates-editor-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {headerRates.map((rate, index) => (
                        <div key={index} className="form-grid-2" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', alignItems: 'center' }}>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Label</label>
                            <input type="text" className="form-input" value={rate.label || ''} onChange={(e) => handleRateChange(index, 'label', e.target.value)} required />
                          </div>
                          <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Value</label>
                            <input type="text" className="form-input" value={rate.val || ''} onChange={(e) => handleRateChange(index, 'val', e.target.value)} required />
                          </div>

                          {/* Optional Fields depending on the rate structure */}
                          {rate.change !== undefined && (
                            <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                              <label>Change Percentage</label>
                              <input type="text" className="form-input" value={rate.change || ''} onChange={(e) => handleRateChange(index, 'change', e.target.value)} />
                            </div>
                          )}

                          {rate.trend !== undefined && (
                            <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                              <label>Trend Color</label>
                              <select className="form-input" value={rate.trend || 'neutral'} onChange={(e) => handleRateChange(index, 'trend', e.target.value)}>
                                <option value="up">Green (Up)</option>
                                <option value="down">Red (Down)</option>
                                <option value="neutral">Gray (Neutral)</option>
                              </select>
                            </div>
                          )}

                          {rate.extra !== undefined && (
                            <div className="form-group" style={{ marginBottom: 0, marginTop: '1rem' }}>
                              <label>Extra Info (e.g. Sunny)</label>
                              <input type="text" className="form-input" value={rate.extra || ''} onChange={(e) => handleRateChange(index, 'extra', e.target.value)} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    <button type="submit" className="btn-primary" style={{ marginTop: '1.5rem' }}>
                      Save Top Header Settings
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* CREATE & EDIT FORM MODAL */}
      {isFormOpen && (
        <div className="modal-backdrop">
          <div className="modal-content-card">
            <div className="modal-header">
              <h3>{formMode === 'edit' ? 'Edit Article Details' : 'Publish New Article'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="modal-close-btn">&times;</button>
            </div>
            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, overflow: 'hidden' }}>
              <div className="modal-form-body">

                {/* SEO metadata (optional — used for search engines / sharing) */}
                <div className="form-group">
                  <label htmlFor="form-seo-title">SEO Title</label>
                  <input
                    id="form-seo-title"
                    type="text"
                    className="form-input"
                    value={seoTitle || title}
                    onChange={(e) => setSeoTitle(e.target.value)}
                    placeholder={title || 'Custom title for search engines (defaults to the article title if left blank)...'}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-meta-description">Meta Description</label>
                  <textarea
                    id="form-meta-description"
                    className="form-textarea"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    placeholder="Short summary shown in search results (recommended ~150-160 characters)..."
                    style={{ minHeight: 90 }}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="form-seo-tags">SEO Tags</label>
                  <input
                    id="form-seo-tags"
                    type="text"
                    className="form-input"
                    value={seoTags}
                    onChange={(e) => setSeoTags(e.target.value)}
                    placeholder="Comma-separated keywords, e.g. aviation, sustainability, net-zero..."
                  />
                </div>

                {/* Title */}
                <div className="form-group">
                  <label htmlFor="form-title">Article Title *</label>
                  <AutoGrowTextarea
                    id="form-title"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article headline..."
                    singleLine
                    required
                  />
                </div>

                {/* Excerpt */}
                <div className="form-group">
                  <label htmlFor="form-excerpt">Short Excerpt (Intro text) *</label>
                  <AutoGrowTextarea
                    id="form-excerpt"
                    className="form-input"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Summarize the article in a single sentence..."
                    singleLine
                    required
                  />
                </div>

                {/* Content */}
                <div className="form-group">
                  <label htmlFor="form-content">Full Body Content *</label>
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    height={400}
                    placeholder="Paste or write the full story here, then select words to make them Bold, Italic, Underline, change the text colour or highlight them."
                  />
                </div>

                {/* Grid 2 Fields (Dynamic Parent Category & Dynamic Dependent Tag Select) */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="form-category">Category *</label>
                    <select
                      id="form-category"
                      className="form-input"
                      value={categoryId}
                      onChange={(e) => {
                        const catIdVal = parseInt(e.target.value);
                        setCategoryId(catIdVal);
                        const selectedCat = categoriesList.find(c => c.id === catIdVal);
                        if (selectedCat) {
                          setCategory(selectedCat.name);
                          if (selectedCat.name.toLowerCase() !== 'videos & podcasts') {
                            setMediaType('');
                            setDuration('');
                          } else {
                            setMediaType('video');
                          }
                          // Set subcategory to the first one in the list
                          if (selectedCat.subcategories && selectedCat.subcategories.length > 0) {
                            setSubcategoryId(selectedCat.subcategories[0].id);
                            setTag(selectedCat.subcategories[0].name);
                          } else {
                            setSubcategoryId(0);
                            setTag('');
                          }
                        }
                      }}
                      required
                    >
                      <option value="0" disabled>Select Category</option>
                      {categoriesList
                        .filter(c => c.slug !== 'you-may-like')
                        .map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="form-tag">Sub-tag / Label *</label>
                    <select
                      id="form-tag"
                      className="form-input"
                      value={subcategoryId}
                      onChange={(e) => {
                        const subIdVal = parseInt(e.target.value);
                        setSubcategoryId(subIdVal);
                        const selectedCat = categoriesList.find(c => c.id === categoryId);
                        if (selectedCat && selectedCat.subcategories) {
                          const selectedSub = selectedCat.subcategories.find(s => s.id === subIdVal);
                          if (selectedSub) {
                            setTag(selectedSub.name);
                          }
                        }
                      }}
                      required
                      disabled={!categoryId}
                    >
                      <option value="0" disabled>Select Sub-tag</option>
                      {(() => {
                        const selectedCat = categoriesList.find(c => c.id === categoryId);
                        return selectedCat?.subcategories?.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        )) || [];
                      })()}
                    </select>
                    {(!categoryId || !categoriesList.find(c => c.id === categoryId)?.subcategories?.length) && (
                      <small style={{ color: 'var(--accent-color)', display: 'block', marginTop: '0.25rem' }}>
                        No sub-tags found. Please create one in the Category Manager tab first.
                      </small>
                    )}
                  </div>
                </div>

                {/* Language */}
                <div className="form-group">
                  <label htmlFor="form-language">Language</label>
                  <select
                    id="form-language"
                    className="form-input"
                    value={languageId}
                    onChange={(e) => setLanguageId(e.target.value)}
                  >
                    <option value="">— None —</option>
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}{l.code ? ` (${l.code})` : ''}</option>
                    ))}
                  </select>
                  {languages.length === 0 && (
                    <small style={{ color: 'var(--accent-color)', display: 'block', marginTop: '0.25rem' }}>
                      No languages yet. Add some in the Languages tab.
                    </small>
                  )}
                </div>

                {/* Grid 2 Fields */}
                <div className="form-grid-2">
                  <div className="form-group">
                    <label htmlFor="form-author">Author / Source *</label>
                    <input
                      id="form-author"
                      type="text"
                      className="form-input"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      placeholder="e.g. Staff Reporter, Al-Dar Living"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="form-readtime">Reading / Play Duration *</label>
                    <input
                      id="form-readtime"
                      type="text"
                      className="form-input"
                      value={readTime}
                      onChange={(e) => setReadTime(e.target.value)}
                      placeholder="e.g. 4 min read, 12:45 mins"
                    />
                  </div>
                </div>

                {/* Article image — hidden for Videos & Podcasts (uses the YouTube thumbnail) */}
                {category.toLowerCase() !== 'videos & podcasts' && (
                  <div className="form-group">
                    <label>Article Image *</label>
                    <ImageUploadField value={image} onChange={setImage} onToast={addToast} required />
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                      Upload a JPG, PNG, GIF or WEBP (max 5 MB), or paste an image URL.
                    </small>
                    <input
                      id="form-image-credit"
                      type="text"
                      className="form-input"
                      value={imageCredit}
                      onChange={(e) => setImageCredit(e.target.value)}
                      placeholder="Photo credit (e.g. Reuters, AP, John Doe)"
                      style={{ marginTop: '0.6rem' }}
                    />
                  </div>
                )}

                {/* Conditional fields for Videos & Podcasts */}
                {category.toLowerCase() === 'videos & podcasts' && (
                  <div style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
                    <div className="form-grid-2" style={{ marginBottom: '1rem' }}>
                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="form-mediatype">Media Type *</label>
                        <select
                          id="form-mediatype"
                          className="form-input"
                          value={mediaType}
                          onChange={(e) => setMediaType(e.target.value)}
                          required
                        >
                          <option value="video">Video</option>
                          <option value="podcast">Podcast</option>
                        </select>
                      </div>

                      <div className="form-group" style={{ marginBottom: 0 }}>
                        <label htmlFor="form-duration">Exact Length (e.g. MM:SS) *</label>
                        <input
                          id="form-duration"
                          type="text"
                          className="form-input"
                          value={duration}
                          onChange={(e) => setDuration(e.target.value)}
                          placeholder="e.g. 15:40"
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label htmlFor="form-mediaurl">YouTube Link / Video URL</label>
                      <input
                        id="form-mediaurl"
                        type="url"
                        className="form-input"
                        value={mediaUrl}
                        onChange={(e) => handleMediaUrlChange(e.target.value)}
                        placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                      />
                      <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                        Paste a YouTube link — the thumbnail becomes the image and the exact length (MM:SS) is filled automatically.
                      </small>
                    </div>
                  </div>
                )}

                {/* Sponsored Checkbox */}
                <div className="form-group" style={{ marginTop: '0.5rem' }}>
                  <label className="checkbox-group">
                    <input
                      type="checkbox"
                      checked={isSponsored}
                      onChange={(e) => setIsSponsored(e.target.checked)}
                    />
                    <span>Mark as Sponsored Content (Partner advertisement)</span>
                  </label>
                </div>

              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setIsFormOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary" style={{ width: 'auto' }}>
                  {formMode === 'edit' ? 'Save Changes' : 'Publish Article'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
