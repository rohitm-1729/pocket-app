const API_URL = 'http://localhost:8000';

// DOM elements
const urlDisplay = document.getElementById('url-display');
const status = document.getElementById('status');
const saveBtn = document.getElementById('save-btn');
const openAppBtn = document.getElementById('open-app');
const loginForm = document.getElementById('login-form');
const saveSection = document.getElementById('save-section');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginBtn = document.getElementById('login-btn');

let currentUrl = '';

// Initialize popup
async function init() {
  // Get current tab URL
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  currentUrl = tab.url;
  urlDisplay.textContent = currentUrl;

  // Check if logged in
  const token = await getToken();
  if (token) {
    showSaveSection();
  } else {
    showLoginForm();
  }
}

// Storage helpers
async function getToken() {
  const result = await chrome.storage.local.get(['token']);
  return result.token;
}

async function setToken(token) {
  await chrome.storage.local.set({ token });
}

async function removeToken() {
  await chrome.storage.local.remove(['token']);
}

// UI helpers
function showStatus(message, type) {
  status.textContent = message;
  status.className = `status ${type}`;
  status.style.display = 'block';
}

function hideStatus() {
  status.style.display = 'none';
}

function showLoginForm() {
  loginForm.classList.add('show');
  saveSection.style.display = 'none';
}

function showSaveSection() {
  loginForm.classList.remove('show');
  saveSection.style.display = 'block';
}

// API calls
async function login(email, password) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid credentials');
  }

  const data = await response.json();
  return data.access_token;
}

async function saveArticle(url, token) {
  const response = await fetch(`${API_URL}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ url }),
  });

  if (response.status === 401) {
    await removeToken();
    throw new Error('Session expired. Please log in again.');
  }

  if (response.status === 400) {
    throw new Error('Article already saved');
  }

  if (!response.ok) {
    throw new Error('Failed to save article');
  }

  return await response.json();
}

// Event handlers
loginBtn.addEventListener('click', async () => {
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showStatus('Please enter email and password', 'error');
    return;
  }

  loginBtn.disabled = true;
  showStatus('Logging in...', 'loading');

  try {
    const token = await login(email, password);
    await setToken(token);
    hideStatus();
    showSaveSection();
  } catch (error) {
    showStatus(error.message, 'error');
  } finally {
    loginBtn.disabled = false;
  }
});

saveBtn.addEventListener('click', async () => {
  const token = await getToken();
  if (!token) {
    showLoginForm();
    return;
  }

  saveBtn.disabled = true;
  showStatus('Saving article...', 'loading');

  try {
    await saveArticle(currentUrl, token);
    showStatus('Article saved!', 'success');
    saveBtn.textContent = 'Saved!';
  } catch (error) {
    if (error.message.includes('Session expired')) {
      showLoginForm();
    }
    showStatus(error.message, 'error');
    saveBtn.disabled = false;
  }
});

openAppBtn.addEventListener('click', () => {
  chrome.tabs.create({ url: 'http://localhost:5173' });
});

// Initialize
init();
