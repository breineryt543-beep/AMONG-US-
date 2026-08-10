const API_URL = "https://misionlunar-api.breineryt543.workers.dev"; // Tu URL de Worker

// Ejemplo para Iniciar Sesión
async function iniciarSesion(username, password) {
  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    
    const data = await res.json();
    
    if (res.ok) {
      alert("¡Login correcto!");
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error("Error al conectar:", err);
  }
}
