// profile.js - Current user's own profile page

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  insertNavbar();
  loadMyProfile();
});

// Load current user's profile
async function loadMyProfile() {
  const container = document.getElementById('profileContainer');
  container.innerHTML = '<div class="loading">Loading profile...</div>';

  // Get user info from /auth/me
  const meResult = await apiRequest('/auth/me');

  if (!meResult || !meResult.ok) {
    container.innerHTML =
      '<div class="empty-state"><p>Failed to load profile.</p></div>';
    return;
  }

  const user = meResult.data.data;
  // Store userId for post ownership checks
  localStorage.setItem('userId', user.id);

  // Get user's posts
  const postsResult = await apiRequest(`/posts/user/${user.id}`);
  const posts = postsResult && postsResult.ok ? postsResult.data.data : [];

  container.innerHTML = profileHTML(user, posts);
}

// Generate profile page HTML
function profileHTML(user, posts) {
  const avatar = user.profilePicture
    ? `<img src="${user.profilePicture}" alt="${user.username}" class="profile-avatar" />`
    : `<div class="profile-avatar-placeholder">${getInitials(user.fullName)}</div>`;

  const postsHTML =
    posts.length === 0
      ? '<div class="empty-state"><p>No posts yet.</p></div>'
      : posts.map((post) => postCardHTMLProfile(post)).join('');

  return `
    <div class="profile-header">
      ${avatar}
      <div class="profile-info">
        <h2>${escapeHTML(user.fullName)}</h2>
        <div class="username">@${escapeHTML(user.username)}</div>
        <div class="bio">${user.bio ? escapeHTML(user.bio) : 'No bio yet.'}</div>
        <div class="profile-stats">
          <div class="stat"><strong>${posts.length}</strong> posts</div>
          <div class="stat"><strong>${user.followers}</strong> followers</div>
          <div class="stat"><strong>${user.following}</strong> following</div>
        </div>
        <div class="profile-actions">
          <a href="/edit-profile" class="btn btn-secondary btn-sm">Edit Profile</a>
        </div>
      </div>
    </div>
    <h3 style="margin-bottom:12px;font-size:1rem;">Your Posts</h3>
    ${postsHTML}
  `;
}

// Post card HTML for profile page (with edit/delete buttons)
function postCardHTMLProfile(post) {
  const user = post.user;
  const avatar = avatarHTML(user, 40);

  let imageHTML = '';
  if (post.image) {
    imageHTML = `<img src="${post.image}" alt="Post image" class="post-image" />`;
  }

  const likeBtnClass = post.isLiked ? 'liked' : '';
  const likeIcon = post.isLiked ? '&#9829;' : '&#9825;';

  return `
    <div class="post-card">
      <div class="post-header">
        ${avatar}
        <div class="post-author">
          <div class="name"><a href="/user/${user._id}">${escapeHTML(user.fullName || user.username)}</a></div>
          <div class="time">${timeAgo(post.createdAt)}</div>
        </div>
        <button class="post-menu-btn" onclick="openEditModal('${post._id}', \`${escapeHTML(post.content).replace(/`/g, '\\`')}\`)">&#9998;</button>
      </div>
      <div class="post-content">${escapeHTML(post.content)}</div>
      ${imageHTML}
      <div class="post-actions">
        <button id="like-btn-${post._id}" class="${likeBtnClass}" onclick="toggleLike('${post._id}')">
          <span>${likeIcon}</span> Like <span class="count" id="like-count-${post._id}">${post.likeCount}</span>
        </button>
        <button onclick="toggleComments('${post._id}')">
          <span>&#128172;</span> Comment <span class="count" id="comment-count-${post._id}">${post.commentCount}</span>
        </button>
        <button onclick="deletePost('${post._id}')" style="color:#fa383e;">
          &#128465; Delete
        </button>
      </div>
      <div class="comments-section" id="comments-${post._id}">
        <div class="comment-input-row">
          <input type="text" id="comment-input-${post._id}" placeholder="Write a comment..." onkeydown="handleCommentKey(event, '${post._id}')" />
          <button class="btn btn-primary btn-sm" onclick="addComment('${post._id}')">Post</button>
        </div>
        <div id="comment-list-${post._id}"></div>
      </div>
    </div>
  `;
}

// Toggle like
async function toggleLike(postId) {
  const result = await apiRequest(`/posts/${postId}/like`, { method: 'PUT' });

  if (result && result.ok) {
    const { isLiked, likeCount } = result.data.data;
    const btn = document.getElementById(`like-btn-${postId}`);
    if (isLiked) {
      btn.classList.add('liked');
      btn.innerHTML = `<span>&#9829;</span> Like <span class="count">${likeCount}</span>`;
    } else {
      btn.classList.remove('liked');
      btn.innerHTML = `<span>&#9825;</span> Like <span class="count">${likeCount}</span>`;
    }
  }
}

// Toggle comments
function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  if (section.classList.contains('open')) {
    section.classList.remove('open');
  } else {
    section.classList.add('open');
    loadComments(postId);
  }
}

// Load comments
async function loadComments(postId) {
  const listEl = document.getElementById(`comment-list-${postId}`);
  listEl.innerHTML = '<div class="loading">Loading...</div>';

  const result = await apiRequest(`/comments/${postId}`);

  if (result && result.ok) {
    const comments = result.data.data;
    if (comments.length === 0) {
      listEl.innerHTML =
        '<p style="font-size:0.85rem;color:#65676b;text-align:center;">No comments yet</p>';
      return;
    }
    listEl.innerHTML = comments.map((c) => commentHTMLProfile(c)).join('');
  }
}

// Add comment
async function addComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  const text = input.value.trim();
  if (!text) return;

  const result = await apiRequest(`/comments/${postId}`, {
    method: 'POST',
    body: JSON.stringify({ text }),
  });

  if (result && result.ok) {
    input.value = '';
    loadComments(postId);
    const countEl = document.getElementById(`comment-count-${postId}`);
    if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
  }
}

// Handle comment enter key
function handleCommentKey(e, postId) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addComment(postId);
  }
}

// Delete comment
async function deleteComment(commentId, postId) {
  const result = await apiRequest(`/comments/${commentId}`, {
    method: 'DELETE',
  });

  if (result && result.ok) {
    loadComments(postId);
    const countEl = document.getElementById(`comment-count-${postId}`);
    if (countEl) countEl.textContent = Math.max(0, parseInt(countEl.textContent) - 1);
  }
}

// Comment HTML
function commentHTMLProfile(comment) {
  const user = comment.user;
  const avatar = avatarHTML(user, 28);
  const currentUserId = localStorage.getItem('userId');
  const deleteBtn =
    user._id === currentUserId
      ? `<button class="delete-comment" onclick="deleteComment('${comment._id}', '${comment.post}')">&#10005;</button>`
      : '';

  return `
    <div class="comment-item">
      ${avatar}
      <div class="comment-body">
        <div class="comment-author"><a href="/user/${user._id}">${escapeHTML(user.fullName || user.username)}</a></div>
        <div class="comment-text">${escapeHTML(comment.text)}</div>
        <div class="comment-time">${timeAgo(comment.createdAt)}</div>
      </div>
      ${deleteBtn}
    </div>
  `;
}

// Edit post modal
let editingPostId = null;

function openEditModal(postId, currentContent) {
  editingPostId = postId;
  document.getElementById('editPostContent').value = currentContent;
  document.getElementById('editModal').classList.add('active');
}

function closeEditModal() {
  editingPostId = null;
  document.getElementById('editModal').classList.remove('active');
}

async function saveEditPost() {
  const content = document.getElementById('editPostContent').value.trim();
  if (!content) {
    alert('Post content cannot be empty');
    return;
  }

  const result = await apiRequest(`/posts/${editingPostId}`, {
    method: 'PUT',
    body: JSON.stringify({ content }),
  });

  if (result && result.ok) {
    closeEditModal();
    loadMyProfile();
  } else {
    alert(result?.data?.message || 'Failed to update post');
  }
}

// Delete post
async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  const result = await apiRequest(`/posts/${postId}`, { method: 'DELETE' });

  if (result && result.ok) {
    loadMyProfile();
  }
}
