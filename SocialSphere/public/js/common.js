  // common.js - Shared utilities used across all pages

  const API_BASE = '/api';

  // Get stored JWT token
  function getToken() {
    return localStorage.getItem('token');
  }

  // Set JWT token
  function setToken(token) {
    localStorage.setItem('token', token);
  }

  // Remove JWT token (logout)
  function removeToken() {
    localStorage.removeItem('token');
  }

  // Check if user is logged in
  function isLoggedIn() {
    return !!getToken();
  }

  // Redirect to login if not authenticated
  function requireAuth() {
    if (!isLoggedIn()) {
      window.location.href = '/';
      return false;
    }
    return true;
  }

  // Redirect to feed if already logged in
  function redirectIfLoggedIn() {
    if (isLoggedIn()) {
      window.location.href = '/feed';
      return true;
    }
    return false;
  }

  // Make authenticated API request
  async function apiRequest(endpoint, options = {}) {
    const token = getToken();
    const headers = {
      ...options.headers,
    };

    // Only set Content-Type for non-FormData requests
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      // If unauthorized, redirect to login
      if (response.status === 401) {
        removeToken();
        window.location.href = '/';
        return null;
      }

      return { ok: response.ok, status: response.status, data };
    } catch (error) {
      console.error('API Error:', error);
      return { ok: false, data: { message: 'Network error' } };
    }
  }

  // Show message (error or success)
  function showMessage(elementId, text, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.textContent = text;
    el.className = `message ${type}`;
  }

  // Hide message
  function hideMessage(elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.className = 'message';
    el.textContent = '';
  }

  // Format date to relative time
  function timeAgo(dateString) {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  // Get user's initials for avatar placeholder
  function getInitials(name) {
    if (!name) return '?';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  // Create avatar HTML (image or placeholder)
  function avatarHTML(user, size) {
    const px = size || 40;
    if (user.profilePicture) {
      return `<img src="${user.profilePicture}" alt="${user.username}" style="width:${px}px;height:${px}px;border-radius:50%;object-fit:cover;" />`;
    }
    return `<div class="avatar-placeholder" style="width:${px}px;height:${px}px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;font-size:${px / 2.5}px;color:#65676b;flex-shrink:0;">${getInitials(user.fullName || user.username)}</div>`;
  }

  // Build navbar HTML
  function buildNavbar() {
    const loggedIn = isLoggedIn();
    return `
      <header class="navbar">
        <div class="nav-container">
          <a href="/feed" class="logo">SocialSphere</a>
          <nav>
            ${
  loggedIn
    ? `
<a href="/feed">🏠 Feed</a>
<a href="/search">🔍 Search</a>

<a href="#" class="notification-icon" title="Notifications">
    🔔
</a>

<a href="/profile" class="profile-icon" title="Profile">
    👤
</a>

<a href="#" onclick="logout(); return false;">🚪 Logout</a>
`
    : `
<a href="/">Login</a>
<a href="/register">Register</a>
`
}   </nav>
        </div>
      </header>
    `;
  }

  // Insert navbar into page
  function insertNavbar() {
    const navEl = document.getElementById('navbar');
    if (navEl) {
      navEl.innerHTML = buildNavbar();
    }
  }

  // Logout function
  function logout() {
    removeToken();
    window.location.href = '/';
  }

  // Escape HTML to prevent XSS
  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
