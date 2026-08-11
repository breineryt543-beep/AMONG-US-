function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function onRequestGet({ env }) {
  try {
    const list = await env.COMIC_KV.list({ prefix: "user:" });
    const users = await Promise.all(
      list.keys.map(async (k) => {
        const raw = await env.COMIC_KV.get(k.name);
        return raw ? JSON.parse(raw) : null;
      })
    );
    const clean = users.filter(Boolean).sort((a, b) => a.name.localeCompare(b.name));
    return json({ users: clean });
  } catch (e) {
    return json({ error: "Error del servidor." }, 500);
  }
}
