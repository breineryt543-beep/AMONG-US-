import { hashPassword, json } from "../_utils.js";

export async function onRequestPost({ request, env }) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return json({ error: "Escribe tu usuario y contraseña." }, 400);
    }

    const clean = username.trim().toLowerCase();
    const raw = await env.COMIC_KV.get(`user:${clean}`);
    if (!raw) {
      return json({ error: "Ese usuario no existe. Regístrate primero." }, 404);
    }

    const user = JSON.parse(raw);
    const passwordHash = await hashPassword(password, clean);
    if (passwordHash !== user.passwordHash) {
      return json({ error: "Contraseña incorrecta." }, 401);
    }

    const { passwordHash: _omit, ...publicUser } = user;
    return json({ user: publicUser });
  } catch (e) {
    return json({ error: "Error del servidor. Intenta de nuevo." }, 500);
  }
}
