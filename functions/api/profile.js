import { json } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = (url.searchParams.get("username") || "").trim().toLowerCase();
    if (!username) return json({ error: "Falta el usuario." }, 400);

    const raw = await env.COMIC_KV.get(`user:${username}`);
    if (!raw) return json({ error: "Usuario no encontrado." }, 404);

    const { passwordHash, ...publicUser } = JSON.parse(raw);
    return json({ user: publicUser });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, name, avatar, bio } = await request.json();
    const clean = (username || "").trim().toLowerCase();
    if (!clean) return json({ error: "Falta el usuario." }, 400);

    const key = `user:${clean}`;
    const raw = await env.COMIC_KV.get(key);
    if (!raw) return json({ error: "Usuario no encontrado." }, 404);

    const user = JSON.parse(raw);
    if (name && name.trim()) user.name = name.trim().slice(0, 60);
    if (avatar && avatar.trim()) user.avatar = avatar.trim().slice(0, 500);
    if (bio !== undefined) user.bio = bio.trim().slice(0, 280);

    await env.COMIC_KV.put(key, JSON.stringify(user));

    const { passwordHash, ...publicUser } = user;
    return json({ user: publicUser });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}
