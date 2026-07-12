// feed.js - Main feed page logic

let editingPostId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (!requireAuth()) return;

  insertNavbar();
  loadFeed();

  // Post composer form
  const postForm = document.getElementById('postForm');
  if (postForm) {
    postForm.addEventListener('submit', handleCreatePost);
  }

  // Image preview
  const imageInput = document.getElementById('postImage');
  if (imageInput) {
    imageInput.addEventListener('change', handleImagePreview);
  }

  // Edit modal close
  const modalOverlay = document.getElementById('editModal');
  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeEditModal();
    });
  }
});

// Load feed posts
async function loadFeed() {
  const feedEl = document.getElementById('feed');
  feedEl.innerHTML = '<div class="loading">Loading posts...</div>';

  const result = await apiRequest('/posts/feed');

  if (result && result.ok) {
    const posts = result.data.data;
    if (posts.length === 0) {
      feedEl.innerHTML =
        '<div class="empty-state"><p>No posts yet.</p><p>Follow some users or create your first post!</p></div>';
      return;
    }
    feedEl.innerHTML = posts.map((post) => postCardHTML(post)).join('');
  } else {
    feedEl.innerHTML =
      '<div class="empty-state"><p>Failed to load feed.</p></div>';
  }
}

// Create new post
async function handleCreatePost(e) {
  e.preventDefault();

  const content = document.getElementById('postContent').value.trim();
  const imageInput = document.getElementById('postImage');
  const file = imageInput.files[0];

  if (!content && !file) {
    showMessage('composerMessage', 'Write something or add an image', 'error');
    return;
  }

  const btn = document.getElementById('postBtn');
  btn.disabled = true;

  const formData = new FormData();
  if (content) formData.append('content', content);
  if (file) formData.append('image', file);

  const result = await apiRequest('/posts', {
    method: 'POST',
    body: formData,
    headers: {},
  });

  btn.disabled = false;

  if (result && result.ok) {
    document.getElementById('postContent').value = '';
    imageInput.value = '';
    document.getElementById('imagePreview').style.display = 'none';
    hideMessage('composerMessage');
    loadFeed();
  } else {
    showMessage(
      'composerMessage',
      result?.data?.message || 'Failed to create post',
      'error'
    );
  }
}

// Image preview handler
function handleImagePreview(e) {
  const preview = document.getElementById('imagePreview');
  const file = e.target.files[0];

  if (file) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      preview.src = ev.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = 'none';
  }
}

// Toggle like on a post
async function toggleLike(postId) {
  const result = await apiRequest(`/posts/${postId}/like`, {
    method: 'PUT',
  });

  if (result && result.ok) {
    const { isLiked, likeCount } = result.data.data;
    const btn = document.getElementById(`like-btn-${postId}`);
    const countEl = document.getElementById(`like-count-${postId}`);

    if (isLiked) {
      btn.classList.add('liked');
      btn.innerHTML = `<span>&#9829;</span> Like <span class="count">${likeCount}</span>`;
    } else {
      btn.classList.remove('liked');
      btn.innerHTML = `<span>&#9825;</span> Like <span class="count">${likeCount}</span>`;
    }
  }
}

// Toggle comments section
function toggleComments(postId) {
  const section = document.getElementById(`comments-${postId}`);
  if (section.classList.contains('open')) {
    section.classList.remove('open');
  } else {
    section.classList.add('open');
    loadComments(postId);
  }
}

// Load comments for a post
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
    listEl.innerHTML = comments.map((c) => commentHTML(c)).join('');
  }
}

// Add a comment
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
    // Update comment count in the post card
    const countEl = document.getElementById(`comment-count-${postId}`);
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = current + 1;
    }
  }
}

// Handle comment input enter key
function handleCommentKey(e, postId) {
  if (e.key === 'Enter') {
    e.preventDefault();
    addComment(postId);
  }
}

// Delete a comment
async function deleteComment(commentId, postId) {
  const result = await apiRequest(`/comments/${commentId}`, {
    method: 'DELETE',
  });

  if (result && result.ok) {
    loadComments(postId);
    // Update comment count
    const countEl = document.getElementById(`comment-count-${postId}`);
    if (countEl) {
      const current = parseInt(countEl.textContent) || 0;
      countEl.textContent = Math.max(0, current - 1);
    }
  }
}

// Open edit post modal
function openEditModal(postId, currentContent) {
  editingPostId = postId;
  document.getElementById('editPostContent').value = currentContent;
  document.getElementById('editModal').classList.add('active');
}

// Close edit post modal
function closeEditModal() {
  editingPostId = null;
  document.getElementById('editModal').classList.remove('active');
}

// Save edited post
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
    loadFeed();
  } else {
    alert(result?.data?.message || 'Failed to update post');
  }
}

// Delete a post
async function deletePost(postId) {
  if (!confirm('Are you sure you want to delete this post?')) return;

  const result = await apiRequest(`/posts/${postId}`, {
    method: 'DELETE',
  });

  if (result && result.ok) {
    loadFeed();
  }
}

// Generate HTML for a single post card
function postCardHTML(post) {
  const user = post.user;
  const isOwn = user._id === localStorage.getItem('userId');
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

// Generate HTML for a single comment
function commentHTML(comment) {
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
