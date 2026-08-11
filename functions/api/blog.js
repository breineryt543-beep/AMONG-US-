function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ env }) {
  try {
    const list = await env.COMIC_KV.list({ prefix: "blog:" });
    const posts = await Promise.all(
      list.keys.map(async (k) => {
        const raw = await env.COMIC_KV.get(k.name);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const clean = posts.filter(Boolean).sort((a, b) => b.createdAt - a.createdAt);
    return json({ posts: clean });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, text } = await request.json();
    if (!username || !text || !text.trim()) {
      return json({ error: "Faltan datos para publicar." }, 400);
    }

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
      text: text.trim().slice(0, 500),
      createdAt: Date.now(),
    };

    await env.COMIC_KV.put(`blog:${id}`, JSON.stringify(post));
    return json({ post });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}
