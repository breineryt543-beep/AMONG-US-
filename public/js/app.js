const API = "/api";

function getSession() {
  const raw = localStorage.getItem("ml_user");
  return raw ? JSON.parse(raw) : null;
}

function setSession(user) {
  localStorage.setItem("ml_user", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("ml_user");
  window.location.href = "index.html";
}

function requireSession() {
  const u = getSession();
  if (!u) {
    window.location.href = "index.html";
    return null;
  }
  return u;
}

async function api(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Error de red");
  return data;
}

function showError(el, msg) {
  el.textContent = msg;
  el.classList.add("show");
}

function hideError(el) {
  el.classList.remove("show");
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60) return "hace un momento";
  if (diff < 3600) return `hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `hace ${Math.floor(diff / 3600)} h`;
  return `hace ${Math.floor(diff / 86400)} d`;
}

function initShell(activePage) {
  const user = requireSession();
  if (!user) return null;

  const toggle = document.getElementById("navToggle");
  const sidebar = document.getElementById("sidebar");
  const overlay = document.getElementById("navOverlay");

  const openNav = () => {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  };
  const closeNav = () => {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  };

  toggle?.addEventListener("click", openNav);
  overlay?.addEventListener("click", closeNav);

  document.querySelectorAll(".nav-link").forEach((l) => {
    if (l.dataset.page === activePage) l.classList.add("active");
  });

  document.getElementById("logoutBtn")?.addEventListener("click", logout);

  document.querySelectorAll(".session-name").forEach((el) => (el.textContent = user.name));
  document.querySelectorAll(".session-user").forEach((el) => (el.textContent = "@" + user.username));
  document.querySelectorAll(".session-avatar").forEach((el) => (el.src = user.avatar));
  document.querySelectorAll(".session-bio").forEach((el) => (el.textContent = user.bio || "Explorador/a de Misión Lunar."));

  return user;
}
