function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestPost({ request, env }) {
  try {
    const { username } = await request.json();
    if (!username) return json({ error: "Escribe tu usuario." }, 400);

    const clean = username.trim().toLowerCase();
    const raw = await env.COMIC_KV.get(`user:${clean}`);
    if (!raw) {
      return json({ error: "Ese usuario no existe. Regístrate primero." }, 404);
    }

    return json({ user: JSON.parse(raw) });
  } catch (e) {
    return json({ error: "Error del servidor. Intenta de nuevo." }, 500);
  }
}
