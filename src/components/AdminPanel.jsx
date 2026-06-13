import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import '../styles/admin.css';

export default function AdminPanel({ articles, onRefreshArticles, breakingNews, onRefreshBreaking, darkMode, toggleDarkMode }) {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdminLoading, setIsAdminLoading] = useState(true);
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
  const [categoryId, setCategoryId] = useState(0);
  const [tag, setTag] = useState('');
  const [subcategoryId, setSubcategoryId] = useState(0);
  const [author, setAuthor] = useState('');
  const [readTime, setReadTime] = useState('');
  const [isSponsored, setIsSponsored] = useState(false);
  const [mediaType, setMediaType] = useState(''); // 'video' | 'podcast' | ''
  const [duration, setDuration] = useState('');

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

  // Top Header Settings state
  const [headerRates, setHeaderRates] = useState([]);
  const [headerRatesLoading, setHeaderRatesLoading] = useState(false);

  // Check auth status and fetch categories
  useEffect(() => {
    checkAuth();
  }, []);

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

  const checkAuth = async () => {
    try {
      const res = await fetch('/api/check_auth.php');
      const data = await res.json();
      if (data.authenticated) {
        setIsAuthenticated(true);
        setAdminUsername(data.username);
        onRefreshArticles();
        await fetchCategories();
        await fetchHeaderRates();
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error('Failed to check auth:', err);
    } finally {
      setIsAdminLoading(false);
    }
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

  // Compile flat list of articles
  const allArticlesList = articles ? Object.values(articles).flat() : [];

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
    
    // Select first category on load
    if (categoriesList.length > 0) {
      const firstCat = categoriesList[0];
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
    setCategoryId(art.categoryId || 0);
    setCategory(art.category);
    setSubcategoryId(art.subcategoryId || 0);
    setTag(art.tag);
    setAuthor(art.author);
    setReadTime(art.readTime);
    setIsSponsored(art.isSponsored || false);
    setMediaType(art.mediaType || '');
    setDuration(art.duration || '');
    setIsFormOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!title || !excerpt || !content || !image || !categoryId || !subcategoryId || !author) {
      addToast('Please fill out all required fields.', 'error');
      return;
    }

    const payload = {
      title,
      excerpt,
      content,
      image,
      categoryId,
      subcategoryId,
      author,
      readTime,
      isSponsored: isSponsored ? 1 : 0,
      mediaType: category.toLowerCase() === 'videos & podcasts' ? mediaType : null,
      duration: category.toLowerCase() === 'videos & podcasts' ? duration : null
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

  const handleDeleteCategory = (catId) => {
    Swal.fire({
      title: 'Delete Category?',
      text: 'WARNING: Deleting this category will delete all its subcategories. Articles linked to this category may not render correctly. Proceed?',
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
      text: 'Are you sure you want to permanently delete this sub-tag?',
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
              <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2A.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
            </svg>
          ) : (
            /* Moon icon */
            <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.868 0 1.71-.15 2.507-.444a.768.768 0 0 1 1.022.824 8.022 8.022 0 0 1-15.662-2.008zm11.471 4.704a3.208 3.208 0 0 1-3.664-3.664.768.768 0 0 1 .843-.815 5.012 5.012 0 0 0 5.644 5.644.768.768 0 0 1-.823.835z"/>
            </svg>
          )}
        </button>
        <div className="admin-login-card">
          <div className="login-header">
            <div className="login-logo">
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
              </svg>
            </div>
            <h2>Admin Console</h2>
            <p>Sign in to modify news portal details</p>
          </div>

          {loginError && (
            <div className="login-error-alert">
              <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.553.553 0 0 1-1.1 0L7.1 4.995z"/>
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
          <a href="#admin" className="admin-brand">
            <svg width="22" height="22" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
              <path d="M8 1a2 2 0 0 1 2 2v4H6V3a2 2 0 0 1 2-2zm3 6V3a3 3 0 0 0-6 0v4a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
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
                  <path d="M8 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM8 0a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 0zm0 13a.5.5 0 0 1 .5.5v2a.5.5 0 0 1-1 0v-2A.5.5 0 0 1 8 13zm8-5a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 .5.5zM3 8a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1 0-1h2a.5.5 0 0 1 3 8zm10.657-5.657a.5.5 0 0 1 0 .707l-1.414 1.415a.5.5 0 1 1-.707-.708l1.414-1.414a.5.5 0 0 1 .707 0zm-9.193 9.193a.5.5 0 0 1 0 .707L3.05 13.657a.5.5 0 0 1-.707-.707l1.414-1.414a.5.5 0 0 1 .707 0zm9.193 2.121a.5.5 0 0 1-.707 0l-1.414-1.414a.5.5 0 0 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .707zM4.464 4.465a.5.5 0 0 1-.707 0L2.343 3.05a.5.5 0 1 1 .707-.707l1.414 1.414a.5.5 0 0 1 0 .708z"/>
                </svg>
              ) : (
                /* Moon icon */
                <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
                  <path d="M6 .278a.768.768 0 0 1 .08.858 7.208 7.208 0 0 0-.878 3.46c0 4.021 3.278 7.277 7.318 7.277.868 0 1.71-.15 2.507-.444a.768.768 0 0 1 1.022.824 8.022 8.022 0 0 1-15.662-2.008zm11.471 4.704a3.208 3.208 0 0 1-3.664-3.664.768.768 0 0 1 .843-.815 5.012 5.012 0 0 0 5.644 5.644.768.768 0 0 1-.823.835z"/>
                </svg>
              )}
            </button>
            <a href="#" className="btn-secondary">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
              </svg>
              View Website
            </a>
            <button onClick={handleLogout} className="btn-danger">
              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M10 12.5a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-9a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v2a.5.5 0 0 0 1 0v-2A1.5 1.5 0 0 0 9.5 2h-8A1.5 1.5 0 0 0 0 3.5v9A1.5 1.5 0 0 0 1.5 14h8a1.5 1.5 0 0 0 1.5-1.5v-2a.5.5 0 0 0-1 0v2z"/>
                <path fillRule="evenodd" d="M15.854 8.354a.5.5 0 0 0 0-.708l-3-3a.5.5 0 0 0-.708.708L14.293 7.5H5.5a.5.5 0 0 0 0 1h8.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3z"/>
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
        <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', margin: '2rem 0 1.5rem 0', paddingBottom: '0.1rem' }}>
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
            onClick={() => setActiveTab('header_settings')}
            className={`semibold`}
            style={{
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'header_settings' ? '3px solid var(--accent-gold)' : '3px solid transparent',
              color: activeTab === 'header_settings' ? 'var(--text-primary)' : 'var(--text-muted)',
              padding: '0.75rem 1.5rem',
              cursor: 'pointer',
              fontSize: '0.95rem',
              outline: 'none',
              transition: 'all var(--transition-fast)'
            }}
          >
            Top Header Settings
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
                    <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
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
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
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
                    {filteredArticles.map((art) => (
                      <tr key={art.id}>
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
                                <path d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708l-3-3zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207l6.5-6.5zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.499.499 0 0 1-.175-.03l-.179.178c-.087.088-.22.09-.31.003L1.11 8.85a.25.25 0 0 0-.316.03l-.523.522c-.104.104-.11.272-.012.385l2.634 3.012a.5.5 0 0 0 .375.178H5.5a.5.5 0 0 0 .5-.5z"/>
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteArticle(art)}
                              className="btn-action-delete"
                              title="Delete Article"
                            >
                              <svg width="14" height="14" fill="currentColor" viewBox="0 0 16 16">
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
                  <path d="M1 2.5A1.5 1.5 0 0 1 2.5 1h3A1.5 1.5 0 0 1 7 2.5V3h2v-.5A1.5 1.5 0 0 1 10.5 1h3A1.5 1.5 0 0 1 15 2.5V3h1v1h-1v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 13V4H0V3h1v-.5zM2.5 2a.5.5 0 0 0-.5.5V3h4v-.5a.5.5 0 0 0-.5-.5h-3zM14 3v-.5a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5V3h4zm-11 1v9a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 .5-.5V4H3z"/>
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
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedManagerCat(cat)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderRadius: '4px',
                      border: '1px solid',
                      borderColor: selectedManagerCat?.id === cat.id ? 'var(--accent-gold)' : 'var(--border-color)',
                      backgroundColor: selectedManagerCat?.id === cat.id ? 'rgba(197, 160, 89, 0.05)' : 'transparent',
                      cursor: 'pointer',
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
                        <span style={{ fontWeight: selectedManagerCat?.id === cat.id ? 700 : 500 }}>
                          {cat.name} <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 400 }}>({cat.subcategories?.length || 0} tags)</span>
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
                      <path d="M2.5 8a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm0 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1zm0 1a.5.5 0 1 0 0-1 .5.5 0 0 0 0 1z"/>
                      <path fillRule="evenodd" d="M6 3.5a.5.5 0 0 1 .5-.5h8a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-8a.5.5 0 0 1-.5-.5v-1zM6.5 7a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8zm0 4a.5.5 0 0 0 0 1h8a.5.5 0 0 0 0-1h-8z"/>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem', animation: 'modalSlideIn 0.2s ease', marginTop: '1rem' }}>
            
            {/* Left Column: Active Ticker Lines */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style={{ color: 'var(--accent-gold)' }}>
                  <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2zm.002-12a1 1 0 0 0 0 2v5h1.5v1h-3v-1h1.5V6a1 1 0 0 0 0-2h.002z"/>
                  <path d="M8 1.918A6.002 6.002 0 0 0 2 8v4h12V8a6.002 6.002 0 0 0-6-6.082zM8 0a8 8 0 0 1 8 8v4h1.5v1h-19v-1H0V8a8 8 0 0 1 8-8z"/>
                </svg>
                Active Ticker Items
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {breakingNews && breakingNews.length > 0 ? (
                  breakingNews.map((item) => (
                    <div 
                      key={item.id} 
                      className={`category-item-row ${editingBreakingId === item.id ? 'active' : ''}`}
                      style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '4px' }}
                    >
                      {editingBreakingId === item.id ? (
                        <form onSubmit={handleEditBreaking} style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                          <input
                            type="text"
                            className="form-input"
                            value={editingBreakingTitle}
                            onChange={(e) => setEditingBreakingTitle(e.target.value)}
                            required
                            style={{ margin: 0, padding: '0.25rem 0.5rem' }}
                          />
                          <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.75rem', width: 'auto', fontSize: '0.75rem' }}>Save</button>
                          <button type="button" onClick={() => setEditingBreakingId(null)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', width: 'auto', fontSize: '0.75rem' }}>Cancel</button>
                        </form>
                      ) : (
                        <>
                          <span className="semibold" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '75%' }}>
                            {item.title}
                          </span>
                          <div style={{ display: 'flex', gap: '0.25rem' }}>
                            <button
                              onClick={() => {
                                setEditingBreakingId(item.id);
                                setEditingBreakingTitle(item.title);
                              }}
                              className="btn-action-edit"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Edit Ticker Line"
                            >
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteBreaking(item.id)}
                              className="btn-action-delete"
                              style={{ width: '28px', height: '28px', padding: 0 }}
                              title="Delete Ticker Line"
                            >
                              🗑️
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted" style={{ fontSize: '0.85rem' }}>No breaking news ticker items available. Add one below.</p>
                )}
              </div>
            </div>

            {/* Right Column: Add Headline Form */}
            <div style={{ backgroundColor: 'var(--bg-primary)', padding: '1.5rem', borderRadius: '6px', border: '1px solid var(--border-color)', boxShadow: 'var(--card-shadow)' }}>
              <h3 style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                Add New Ticker Headline
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

        {/* TAB 4: TOP HEADER SETTINGS */}
        {activeTab === 'header_settings' && (
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
                
                {/* Title */}
                <div className="form-group">
                  <label htmlFor="form-title">Article Title *</label>
                  <input
                    id="form-title"
                    type="text"
                    className="form-input"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter article headline..."
                    required
                  />
                </div>

                {/* Excerpt */}
                <div className="form-group">
                  <label htmlFor="form-excerpt">Short Excerpt (Intro text) *</label>
                  <input
                    id="form-excerpt"
                    type="text"
                    className="form-input"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    placeholder="Summarize the article in a single sentence..."
                    required
                  />
                </div>

                {/* Content */}
                <div className="form-group">
                  <label htmlFor="form-content">Full Body Content *</label>
                  <textarea
                    id="form-content"
                    className="form-textarea"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Write the full story here... Use double newlines for paragraph breaks."
                    required
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
                      {categoriesList.map((c) => (
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

                {/* Image URL */}
                <div className="form-group">
                  <label htmlFor="form-image">Image URL / Path *</label>
                  <input
                    id="form-image"
                    type="text"
                    className="form-input"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    placeholder="https://images.unsplash.com/... or /src/assets/..."
                    required
                  />
                  <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.25rem' }}>
                    Tip: Use absolute Unsplash image links for external photos, or local asset paths.
                  </small>
                </div>

                {/* Conditional fields for Videos & Podcasts */}
                {category.toLowerCase() === 'videos & podcasts' && (
                  <div className="form-grid-2" style={{ backgroundColor: 'var(--bg-secondary)', padding: '1rem', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '1.25rem' }}>
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
