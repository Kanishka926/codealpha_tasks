// search.js - Search users page

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  insertNavbar();

  // Handle search form
  const searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.addEventListener('submit', handleSearch);
  }
});

// Handle search submission
async function handleSearch(e) {
  e.preventDefault();

  const query = document.getElementById('searchInput').value.trim();

  if (!query) return;

  const resultsEl = document.getElementById('searchResults');
  resultsEl.innerHTML = '<div class="loading">Searching...</div>';

  const result = await apiRequest(`/users/search?q=${encodeURIComponent(query)}`);

  if (result && result.ok) {
    const users = result.data.data;

    if (users.length === 0) {
      resultsEl.innerHTML =
        '<div class="empty-state"><p>No users found.</p></div>';
      return;
    }

    resultsEl.innerHTML = users.map((user) => userCardHTML(user)).join('');
  } else {
    resultsEl.innerHTML =
      '<div class="empty-state"><p>Search failed. Try again.</p></div>';
  }
}

// Generate HTML for a user card in search results
function userCardHTML(user) {
  const avatar = user.profilePicture
    ? `<img src="${user.profilePicture}" alt="${user.username}" style="width:48px;height:48px;border-radius:50%;object-fit:cover;" />`
    : `<div class="avatar-placeholder" style="width:48px;height:48px;border-radius:50%;background:#e4e6eb;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#65676b;">${getInitials(user.fullName)}</div>`;

  return `
    <div class="user-card">
      ${avatar}
      <div class="user-card-info">
        <div class="name"><a href="/user/${user._id}">${escapeHTML(user.fullName)}</a></div>
        <div class="username">@${escapeHTML(user.username)}</div>
      </div>
      <a href="/user/${user._id}" class="btn btn-secondary btn-sm">View Profile</a>
    </div>
  `;
}
