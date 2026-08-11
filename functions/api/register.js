function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const { name, username } = await request.json();

    if (!name || !username) {
      return json({ error: "Nombre y usuario son obligatorios." }, 400);
    }

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!clean) {
      return json({ error: "El usuario solo puede tener letras, números y guiones bajos." }, 400);
    }
    if (clean.length < 3) {
      return json({ error: "El usuario debe tener al menos 3 caracteres." }, 400);
    }

    const key = `user:${clean}`;
    const existing = await env.COMIC_KV.get(key);
    if (existing) {
      return json({ error: "Ese usuario ya existe. Elige otro o inicia sesión." }, 409);
    }

    const user = {
      username: clean,
      name: name.trim().slice(0, 60),
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${clean}`,
      bio: "",
      createdAt: Date.now(),
    };

    await env.COMIC_KV.put(key, JSON.stringify(user));
    return json({ user });
  } catch (e) {
    return json({ error: "Error del servidor. Intenta de nuevo." }, 500);
  }
}
