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

// ============ Marcos animados (51) e insignias ============

const FRAME_COLORS = [
  { key: "naranja", f1: "#d9622b", f2: "#f6b98a" },
  { key: "azul", f1: "#3f6ea5", f2: "#a9cdf0" },
  { key: "dorado", f1: "#caa23a", f2: "#f6dfa0" },
  { key: "rosa", f1: "#c8577a", f2: "#f7c3d6" },
  { key: "verde azulado", f1: "#2f8f7d", f2: "#9fe6d6" },
  { key: "violeta", f1: "#7a5cc9", f2: "#d3c4f7" },
  { key: "verde", f1: "#4c9a4c", f2: "#bdeab0" },
  { key: "rojo", f1: "#c23b3b", f2: "#f3a8a8" },
  { key: "plata", f1: "#8b8b8b", f2: "#e4e4e4" },
  { key: "café", f1: "#8a5a30", f2: "#dbb583" },
  { key: "fucsia", f1: "#d94f92", f2: "#f9bcdb" },
  { key: "celeste", f1: "#4fb3d9", f2: "#c1ecf7" },
];

function buildFrames() {
  const list = [{ id: "none", name: "Sin marco", cls: "frame-none" }];

  FRAME_COLORS.forEach((c, i) => {
    list.push({ id: `rotate-${i}`, name: `Anillo girante ${c.key}`, cls: "frame-rotate", f1: c.f1, f2: c.f2 });
  });
  FRAME_COLORS.forEach((c, i) => {
    list.push({ id: `glow-${i}`, name: `Aura ${c.key}`, cls: "frame-glow", f1: c.f1, f2: c.f2 });
  });
  FRAME_COLORS.slice(0, 9).forEach((c, i) => {
    list.push({ id: `march-${i}`, name: `Hormigas en marcha ${c.key}`, cls: "frame-marching", f1: c.f1, f2: c.f2 });
  });
  FRAME_COLORS.slice(3, 12).forEach((c, i) => {
    list.push({ id: `sparkle-${i}`, name: `Destellos ${c.key}`, cls: "frame-sparkle", f1: c.f1, f2: c.f2 });
  });
  [0, 1, 2, 4, 7, 10].forEach((idx, i) => {
    const c = FRAME_COLORS[idx];
    list.push({ id: `neon-${i}`, name: `Neón ${c.key}`, cls: "frame-neon", f1: c.f1, f2: c.f2 });
  });
  [0, 1].forEach((idx, i) => {
    const c = FRAME_COLORS[idx];
    list.push({ id: `bounce-${i}`, name: `Rebote ${c.key}`, cls: "frame-bounce", f1: c.f1, f2: c.f2 });
  });
  list.push({ id: "rainbow-0", name: "Arcoíris cósmico", cls: "frame-rainbow" });

  return list;
}

const FRAMES = buildFrames(); // 1 "sin marco" + 51 animados = 52

const BADGES = [
  { id: "", emoji: "", name: "Sin insignia" },
  { id: "rocket", emoji: "🚀", name: "Cohete" },
  { id: "moon", emoji: "🌙", name: "Luna" },
  { id: "star", emoji: "⭐", name: "Estrella" },
  { id: "comet", emoji: "☄️", name: "Cometa" },
  { id: "alien", emoji: "👽", name: "Alien" },
  { id: "astro", emoji: "🧑‍🚀", name: "Astronauta" },
  { id: "ufo", emoji: "🛸", name: "OVNI" },
  { id: "planet", emoji: "🪐", name: "Planeta" },
  { id: "sparkles", emoji: "✨", name: "Destellos" },
  { id: "fire", emoji: "🔥", name: "Fuego" },
  { id: "heart", emoji: "❤️", name: "Corazón" },
  { id: "boom", emoji: "💥", name: "Impacto" },
  { id: "pencil", emoji: "✏️", name: "Lápiz" },
  { id: "camera", emoji: "📸", name: "Cámara" },
  { id: "headphones", emoji: "🎧", name: "Audífonos" },
  { id: "game", emoji: "🎮", name: "Control" },
  { id: "book", emoji: "📖", name: "Libro" },
  { id: "trophy", emoji: "🏆", name: "Trofeo" },
  { id: "crown", emoji: "👑", name: "Corona" },
  { id: "gem", emoji: "💎", name: "Gema" },
  { id: "paw", emoji: "🐾", name: "Huella" },
  { id: "robot", emoji: "🤖", name: "Robot" },
  { id: "ghost", emoji: "👻", name: "Fantasma" },
  { id: "rainbow", emoji: "🌈", name: "Arcoíris" },
];

function getFrame(id) {
  return FRAMES.find((f) => f.id === id) || FRAMES[0];
}
function getBadge(id) {
  return BADGES.find((b) => b.id === id) || BADGES[0];
}

function defaultAvatarFor(user) {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.username || "misionlunar")}`;
}

// tamaño: "sm" (topbar/sidebar/blog), "person" (tarjetas de amigos), "lg" (perfil)
function renderAvatarHTML(user, size) {
  const frame = getFrame(user.frame);
  const badge = getBadge(user.badge);
  const wrapCls = size === "lg" ? "avatar-frame-lg" : size === "person" ? "avatar-frame-person" : "avatar-frame";
  const imgCls = size === "lg" ? "avatar-lg" : size === "person" ? "avatar-person" : "avatar";
  const style = frame.f1 ? `--f1:${frame.f1};--f2:${frame.f2 || frame.f1};` : "";
  const src = user.avatar || defaultAvatarFor(user);
  const badgeHtml = badge.id ? `<span class="badge-dot">${badge.emoji}</span>` : "";
  return `<span class="${wrapCls} ${frame.cls}" style="${style}"><img class="${imgCls}" src="${src}" alt="avatar" />${badgeHtml}</span>`;
}

// ============ Comprimir foto subida por el usuario ============

function compressImageFile(file, maxSize = 320, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) {
          height = Math.round((height * maxSize) / width);
          width = maxSize;
        } else if (height >= width && height > maxSize) {
          width = Math.round((width * maxSize) / height);
          height = maxSize;
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen."));
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo."));
    reader.readAsDataURL(file);
  });
}

// ============ Shell (topbar + sidebar) ============

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

  refreshSessionUI(user);

  return user;
}

function refreshSessionUI(user) {
  document.querySelectorAll(".session-name").forEach((el) => (el.textContent = user.name));
  document.querySelectorAll(".session-user").forEach((el) => (el.textContent = "@" + user.username));
  document.querySelectorAll(".session-bio").forEach((el) => (el.textContent = user.bio || "Explorador/a de Misión Lunar."));
  document.querySelectorAll(".session-avatar-slot").forEach((el) => (el.innerHTML = renderAvatarHTML(user, "sm")));
  document.querySelectorAll(".session-avatar-slot-lg").forEach((el) => (el.innerHTML = renderAvatarHTML(user, "lg")));
}
