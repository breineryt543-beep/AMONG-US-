export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  // Manejo de CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  const responseHeaders = {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
  };

  try {
    // 1. REGISTRO
    if (path === "/api/register" && request.method === "POST") {
      const { nombre, password, fotoUrl } = await request.json();
      const esOwner = nombre === "breinerYT" ? 1 : 0;

      // Comprobar si existe
      const existente = await env.DB.prepare("SELECT * FROM usuarios WHERE nombre = ?").bind(nombre).first();
      if (existente) {
        return new Response(JSON.stringify({ error: "El nombre de usuario ya existe" }), { status: 400, headers: responseHeaders });
      }

      await env.DB.prepare("INSERT INTO usuarios (nombre, password, fotoUrl, esOwner) VALUES (?, ?, ?, ?)")
        .bind(nombre, password, fotoUrl, esOwner)
        .run();

      return new Response(JSON.stringify({ success: true, message: "Usuario creado" }), { headers: responseHeaders });
    }

    // 2. LOGIN
    if (path === "/api/login" && request.method === "POST") {
      const { nombre, password } = await request.json();
      const user = await env.DB.prepare("SELECT nombre, fotoUrl, esOwner FROM usuarios WHERE nombre = ? AND password = ?")
        .bind(nombre, password)
        .first();

      if (!user) {
        return new Response(JSON.stringify({ error: "Usuario o contraseña incorrectos" }), { status: 401, headers: responseHeaders });
      }

      // Corrección/Asegurar Owner si se llama breinerYT
      if (user.nombre === "breinerYT") user.esOwner = 1;

      return new Response(JSON.stringify({ success: true, user }), { headers: responseHeaders });
    }

    // 3. OBTENER PERFILES GLOBAL
    if (path === "/api/usuarios" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT nombre, fotoUrl, esOwner FROM usuarios").all();
      return new Response(JSON.stringify(results), { headers: responseHeaders });
    }

    // 4. CHAT LIVE (OBTENER MENSAJES)
    if (path === "/api/chat" && request.method === "GET") {
      const { results } = await env.DB.prepare("SELECT autor, texto, fecha FROM mensajes_chat ORDER BY id ASC LIMIT 100").all();
      return new Response(JSON.stringify(results), { headers: responseHeaders });
    }

    // 5. CHAT LIVE (ENVIAR MENSAJE)
    if (path === "/api/chat" && request.method === "POST") {
      const { autor, texto } = await request.json();
      await env.DB.prepare("INSERT INTO mensajes_chat (autor, texto) VALUES (?, ?)").bind(autor, texto).run();
      return new Response(JSON.stringify({ success: true }), { headers: responseHeaders });
    }

    // 6. OWNER: LIMPIAR CHAT
    if (path === "/api/chat/clear" && request.method === "POST") {
      const { autor } = await request.json();
      if (autor !== "breinerYT") {
        return new Response(JSON.stringify({ error: "Sin autorización" }), { status: 403, headers: responseHeaders });
      }
      await env.DB.prepare("DELETE FROM mensajes_chat").run();
      return new Response(JSON.stringify({ success: true }), { headers: responseHeaders });
    }

    return new Response(JSON.stringify({ error: "Ruta no encontrada" }), { status: 404, headers: responseHeaders });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: responseHeaders });
  }
}
