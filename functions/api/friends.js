import { json } from "../_utils.js";

export async function onRequestGet({ request, env }) {
  try {
    const url = new URL(request.url);
    const username = (url.searchParams.get("username") || "").trim().toLowerCase();
    if (!username) return json({ error: "Falta el usuario." }, 400);

    const raw = await env.COMIC_KV.get(`friends:${username}`);
    const usernames = raw ? JSON.parse(raw) : [];

    const friends = await Promise.all(
      usernames.map(async (f) => {
        const u = await env.COMIC_KV.get(`user:${f}`);
        if (!u) return null;
        const { passwordHash, ...publicUser } = JSON.parse(u);
        return publicUser;
      })
    );

    return json({ friends: friends.filter(Boolean) });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const { username, friend } = await request.json();
    const clean = (username || "").trim().toLowerCase();
    const friendClean = (friend || "").trim().toLowerCase();

    if (!clean || !friendClean || clean === friendClean) {
      return json({ error: "Datos inválidos." }, 400);
    }

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
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}
