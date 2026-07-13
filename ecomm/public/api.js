const API_URL = "/api";

function getToken() {
  return localStorage.getItem("token");
}

function setToken(token) {
  localStorage.setItem("token", token);
}

function clearToken() {
  localStorage.removeItem("token");
}

function isLoggedIn() {
  return !!getToken();
}

async function apiRequest(url, method = "GET", body = null) {
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  const token = getToken();

  if (token) {
    options.headers.Authorization = "Bearer " + token;
  }

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(API_URL + url, options);

  if (response.status === 204) {
    return null;
  }

  const data = await response.json();

  if (response.status === 401) {
    clearToken();
    throw new Error(data.message || "Session expired. Please login again.");
  }

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
}
