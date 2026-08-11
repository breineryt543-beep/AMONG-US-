import { hashPassword, json } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  try {
    const { name, username, password } = await request.json();

    if (!name || !username || !password) {
      return json({ error: "Nombre, usuario y contraseña son obligatorios." }, 400);
    }

    const clean = username.trim().toLowerCase().replace(/[^a-z0-9_]/g, "");
    if (!clean) {
      return json({ error: "El usuario solo puede tener letras, números y guiones bajos." }, 400);
    }
    if (clean.length < 3) {
      return json({ error: "El usuario debe tener al menos 3 caracteres." }, 400);
    }
    if (password.length < 4) {
      return json({ error: "La contraseña debe tener al menos 4 caracteres." }, 400);
    }

    const key = `user:${clean}`;
    const existing = await env.COMIC_KV.get(key);
    if (existing) {
      return json({ error: "Ese usuario ya existe. Elige otro o inicia sesión." }, 409);
    }

    const passwordHash = await hashPassword(password, clean);

    const user = {
      username: clean,
      name: name.trim().slice(0, 60),
      avatar: `https://api.dicebear.com/7.x/adventurer/svg?seed=${clean}`,
      bio: "",
      passwordHash,
      createdAt: Date.now(),
    };

    await env.COMIC_KV.put(key, JSON.stringify(user));

    const { passwordHash: _omit, ...publicUser } = user;
    return json({ user: publicUser });
  } catch (e) {
    return json({ error: "Error del servidor. Intenta de nuevo." }, 500);
  }
}
