// ============ Utilidades ============

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return {};
  }
}

async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(`${salt}::${password}::mision-lunar`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function stripPassword(user) {
  const { passwordHash, ...publicUser } = user;
  return publicUser;
}

// ============ Handlers de la API ============

async function handleRegister(request, env) {
  const { name, username, password } = await readJson(request);

  if (!name || !username || !password) {
    return json({ error: "Nombre, usuario y contraseña son obligatorios." }, 400);
  }

  const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
  if (!clean) return json({ error: "El usuario solo puede tener letras, números y guiones bajos." }, 400);
  if (clean.length < 3) return json({ error: "El usuario debe tener al menos 3 caracteres." }, 400);
  if (password.length < 4) return json({ error: "La contraseña debe tener al menos 4 caracteres." }, 400);

  const key = `user:${clean}`;
  const existing = await env.COMIC_KV.get(key);
  if (existing) return json({ error: "Ese usuario ya existe. Elige otro o inicia sesión." }, 409);

  const passwordHash = await hashPassword(password, clean);
  const user = {
    username: clean,
    name: name.trim().slice(0, 60),
    avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${clean}`,
    bio: "",
    frame: "none",
    badge: "",
    passwordHash,
    createdAt: Date.now(),
  };

  await env.COMIC_KV.put(key, JSON.stringify(user));
  return json({ user: stripPassword(user) });
}

async function handleLogin(request, env) {
  const { username, password } = await readJson(request);
  if (!username || !password) return json({ error: "Escribe tu usuario y contraseña." }, 400);

  const clean = username.trim().toLowerCase();
  const raw = await env.COMIC_KV.get(`user:${clean}`);
  if (!raw) return json({ error: "Ese usuario no existe. Regístrate primero." }, 404);

  const user = JSON.parse(raw);
  const passwordHash = await hashPassword(password, clean);
  if (passwordHash !== user.passwordHash) return json({ error: "Contraseña incorrecta." }, 401);

  return json({ user: stripPassword(user) });
}

async function handleUsersList(env) {
  const list = await env.COMIC_KV.list({ prefix: "user:" });
  const users = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.COMIC_KV.get(k.name);
      return raw ? stripPassword(JSON.parse(raw)) : null;
    })
  );
  const clean = users.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
  return json({ users: clean });
}

async function handleProfileGet(url, env) {
  const username = (url.searchParams.get("username") || "").trim().toLowerCase();
  if (!username) return json({ error: "Falta el usuario." }, 400);
  const raw = await env.COMIC_KV.get(`user:${username}`);
  if (!raw) return json({ error: "Usuario no encontrado." }, 404);
  return json({ user: stripPassword(JSON.parse(raw)) });
}

async function handleProfilePost(request, env) {
  const { username, name, avatar, bio, frame, badge } = await readJson(request);
  const clean = (username || "").trim().toLowerCase();
  if (!clean) return json({ error: "Falta el usuario." }, 400);

  const key = `user:${clean}`;
  const raw = await env.COMIC_KV.get(key);
  if (!raw) return json({ error: "Usuario no encontrado." }, 404);

  const user = JSON.parse(raw);
  if (name && name.trim()) user.name = name.trim().slice(0, 60);
  // La foto viene comprimida como data URL (base64) desde el navegador.
  if (avatar && avatar.trim()) user.avatar = avatar.trim().slice(0, 250000);
  if (bio !== undefined) user.bio = bio.trim().slice(0, 280);
  if (frame !== undefined) user.frame = String(frame).slice(0, 30);
  if (badge !== undefined) user.badge = String(badge).slice(0, 20);

  await env.COMIC_KV.put(key, JSON.stringify(user));
  return json({ user: stripPassword(user) });
}

async function handleBlogGet(env) {
  const list = await env.COMIC_KV.list({ prefix: "blog:" });
  const posts = await Promise.all(
    list.keys.map(async (k) => {
      const raw = await env.COMIC_KV.get(k.name);
      return raw ? JSON.parse(raw) : null;
    })
  );
  const clean = posts.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
  return json({ posts: clean });
}

async function handleBlogPost(request, env) {
  const { username, text } = await readJson(request);
  if (!username || !text || !text.trim()) return json({ error: "Faltan datos para publicar." }, 400);

  const clean = username.trim().toLowerCase();
  const rawUser = await env.COMIC_KV.get(`user:${clean}`);
  if (!rawUser) return json({ error: "Usuario no encontrado." }, 404);
  const user = JSON.parse(rawUser);

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const post = {
    id,
    username: user.username,
    name: user.name,
    avatar: user.avatar,
    frame: user.frame || "none",
    badge: user.badge || "",
    text: text.trim().slice(0, 500),
    createdAt: Date.now(),
  };

  await env.COMIC_KV.put(`blog:${id}`, JSON.stringify(post));
  return json({ post });
}

async function handleFriendsGet(url, env) {
  const username = (url.searchParams.get("username") || "").trim().toLowerCase();
  if (!username) return json({ error: "Falta el usuario." }, 400);

  const raw = await env.COMIC_KV.get(`friends:${username}`);
  const usernames = raw ? JSON.parse(raw) : [];

  const friends = await Promise.all(
    usernames.map(async (f) => {
      const u = await env.COMIC_KV.get(`user:${f}`);
      return u ? stripPassword(JSON.parse(u)) : null;
    })
  );

  return json({ friends: friends.filter(Boolean) });
}

async function handleFriendsPost(request, env) {
  const { username, friend } = await readJson(request);
  const clean = (username || "").trim().toLowerCase();
  const friendClean = (friend || "").trim().toLowerCase();
  if (!clean || !friendClean || clean === friendClean) return json({ error: "Datos inválidos." }, 400);

  const key = `friends:${clean}`;
  const raw = await env.COMIC_KV.get(key);
  let list = raw ? JSON.parse(raw) : [];

  if (list.includes(friendClean)) {
    list = list.filter((f) => f !== friendClean);
  } else {
    list.push(friendClean);
  }

  await env.COMIC_KV.put(key, JSON.stringify(list));
  return json({ friends: list });
}

// ============ Router ============

async function handleApi(request, env, url) {
  const path = url.pathname.replace(/^\/api\//, "");
  const method = request.method;

  if (!env.COMIC_KV) {
    return json({ error: "El KV (COMIC_KV) todavía no está enlazado. Revisa wrangler.toml." }, 500);
  }

  try {
    if (path === "register" && method === "POST") return await handleRegister(request, env);
    if (path === "login" && method === "POST") return await handleLogin(request, env);
    if (path === "users" && method === "GET") return await handleUsersList(env);
    if (path === "profile" && method === "GET") return await handleProfileGet(url, env);
    if (path === "profile" && method === "POST") return await handleProfilePost(request, env);
    if (path === "blog" && method === "GET") return await handleBlogGet(env);
    if (path === "blog" && method === "POST") return await handleBlogPost(request, env);
    if (path === "friends" && method === "GET") return await handleFriendsGet(url, env);
    if (path === "friends" && method === "POST") return await handleFriendsPost(request, env);
    return json({ error: "Ruta no encontrada." }, 404);
  } catch (e) {
    return json({ error: "Error del servidor. Intenta de nuevo." }, 500);
  }
}

// ============ Entry point ============

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env, url);
    }

    // Todo lo demás son archivos estáticos (public/)
    return env.ASSETS.fetch(request);
  },
};
