// auth.js - Login and Register page logic

document.addEventListener('DOMContentLoaded', () => {
  // Redirect to feed if already logged in
  if (redirectIfLoggedIn()) return;

  // Handle login form
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }

  // Handle register form
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', handleRegister);
  }
});

// Handle login submission
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!email || !password) {
    showMessage('message', 'Please fill in all fields', 'error');
    return;
  }

  const btn = document.getElementById('loginBtn');
  btn.disabled = true;
  btn.textContent = 'Logging in...';

  const result = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  btn.disabled = false;
  btn.textContent = 'Login';

  if (result && result.ok) {
    setToken(result.data.data.token);
    window.location.href = '/feed';
  } else {
    showMessage(
      'message',
      result?.data?.message || 'Login failed',
      'error'
    );
  }
}

// Handle register submission
async function handleRegister(e) {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const username = document.getElementById('username').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!fullName || !username || !email || !password) {
    showMessage('message', 'Please fill in all fields', 'error');
    return;
  }

  if (password.length < 6) {
    showMessage('message', 'Password must be at least 6 characters', 'error');
    return;
  }

  const btn = document.getElementById('registerBtn');
  btn.disabled = true;
  btn.textContent = 'Creating account...';

  const result = await apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, username, email, password }),
  });

  btn.disabled = false;
  btn.textContent = 'Register';

  if (result && result.ok) {
    setToken(result.data.data.token);
    window.location.href = '/feed';
  } else {
    showMessage(
      'message',
      result?.data?.message || 'Registration failed',
      'error'
    );
  }
}
const password = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");

if (password && togglePassword) {

    togglePassword.addEventListener("click", () => {

        if (password.type === "password") {
            password.type = "text";
            togglePassword.textContent = "🙈";
        } else {
            password.type = "password";
            togglePassword.textContent = "👁";
        }

    });

}
