import { json } from "../_utils.js";

export async function onRequestGet({ env }) {
  try {
    const list = await env.COMIC_KV.list({ prefix: "user:" });
    const users = await Promise.all(
      list.keys.map(async (k) => {
        const raw = await env.COMIC_KV.get(k.name);
        if (!raw) return null;
        const { passwordHash, ...publicUser } = JSON.parse(raw);
        return publicUser;
      })
    );
    const clean = users.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
    return json({ users: clean });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}
