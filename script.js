const btnMenu = document.getElementById('btn-menu');
const sidebar = document.getElementById('sidebar');
const sidebarOverlay = document.getElementById('sidebar-overlay');
const btnCloseSidebar = document.getElementById('btn-close-sidebar');

const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnLogout = document.getElementById('btn-logout');
const msgError = document.getElementById('msg-error');

const AVATAR_DEFECTO = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';
let usuarioActual = null;

// --- PERSISTENCIA DE SESIÓN AL RECARGAR LA PÁGINA (F5) ---
window.addEventListener('DOMContentLoaded', () => {
  const sesionGuardada = localStorage.getItem('ml_sesion_activa');
  if (sesionGuardada) {
    usuarioActual = JSON.parse(sesionGuardada);
    iniciarSesionUI();
  }
});

// CONTROL MENÚ LATERAL
btnMenu.addEventListener('click', () => {
  sidebar.classList.add('open');
  sidebarOverlay.classList.add('active');
});

function cerrarSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.classList.remove('active');
}

btnCloseSidebar.addEventListener('click', cerrarSidebar);
sidebarOverlay.addEventListener('click', cerrarSidebar);

// NAVEGACIÓN
const secciones = {
  'nav-inicio': 'sec-inicio',
  'nav-blog': 'sec-blog',
  'nav-amigos': 'sec-amigos',
  'nav-global': 'sec-global',
  'nav-owner': 'sec-owner'
};

Object.keys(secciones).forEach(navId => {
  document.getElementById(navId).addEventListener('click', () => {
    document.querySelectorAll('.sidebar-links li').forEach(li => li.classList.remove('active'));
    document.getElementById(navId).classList.add('active');

    Object.values(secciones).forEach(secId => {
      document.getElementById(secId).style.display = 'none';
    });

    document.getElementById(secciones[navId]).style.display = 'block';
    cerrarSidebar();

    if (navId === 'nav-global') cargarPerfilesGlobales();
    if (navId === 'nav-blog') cargarChatLive();
  });
});

function leerImagenComoBase64(file) {
  return new Promise((resolve) => {
    if (!file) resolve(AVATAR_DEFECTO);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// 1. REGISTRO EN LA BASE DE DATOS D1
btnRegister.addEventListener('click', async () => {
  msgError.innerText = '';
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();
  const fotoArchivo = document.getElementById('foto-input').files[0];

  if (!nombre || !password) {
    msgError.innerText = 'Por favor ingresa usuario y contraseña.';
    return;
  }

  const fotoUrl = await leerImagenComoBase64(fotoArchivo);

  try {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, password, fotoUrl })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    alert('¡Registro exitoso en la base de datos! Ahora inicia sesión.');
  } catch (err) {
    msgError.innerText = err.message;
  }
});

// 2. INICIO DE SESIÓN CON D1
btnLogin.addEventListener('click', async () => {
  msgError.innerText = '';
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nombre, password })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error);

    usuarioActual = data.user;
    localStorage.setItem('ml_sesion_activa', JSON.stringify(usuarioActual));
    iniciarSesionUI();
  } catch (err) {
    msgError.innerText = err.message;
  }
});

function iniciarSesionUI() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';

  document.getElementById('user-name').innerText = usuarioActual.nombre;
  document.getElementById('avatar-img').src = usuarioActual.fotoUrl;
  document.getElementById('user-profile').style.display = 'flex';

  const badge = document.getElementById('user-badge');
  if (usuarioActual.esOwner || usuarioActual.nombre === 'breinerYT') {
    badge.innerText = 'OWNER';
    badge.className = 'badge badge-owner';
    document.getElementById('nav-owner').style.display = 'block';
  } else {
    badge.innerText = 'LECTOR';
    badge.className = 'badge';
    document.getElementById('nav-owner').style.display = 'none';
  }

  cargarChatLive();
}

btnLogout.addEventListener('click', () => {
  localStorage.removeItem('ml_sesion_activa');
  location.reload();
});

// 3. BLOG CHAT LIVE
const btnSendChat = document.getElementById('btn-send-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

async function cargarChatLive() {
  try {
    const res = await fetch('/api/chat');
    const mensajes = await res.json();
    
    chatMessages.innerHTML = '';
    mensajes.forEach(m => {
      const div = document.createElement('div');
      div.className = 'chat-msg';
      div.innerHTML = `<div class="author">${m.autor}</div><div>${m.texto}</div>`;
      chatMessages.appendChild(div);
    });
    chatMessages.scrollTop = chatMessages.scrollHeight;
  } catch (e) {
    console.error("Error al cargar chat", e);
  }
}

btnSendChat.addEventListener('click', async () => {
  const texto = chatInput.value.trim();
  if (!texto) return;

  await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ autor: usuarioActual.nombre, texto })
  });

  chatInput.value = '';
  cargarChatLive();
});

// 4. GLOBAL (PERFILES DESDE BASE DE DATOS D1)
async function cargarPerfilesGlobales() {
  const grid = document.getElementById('global-profiles-list');
  grid.innerHTML = 'Cargando usuarios...';

  try {
    const res = await fetch('/api/usuarios');
    const usuarios = await res.json();
    
    grid.innerHTML = '';
    usuarios.forEach(u => {
      const card = document.createElement('div');
      card.className = 'profile-card';
      card.innerHTML = `
        <img src="${u.fotoUrl}" alt="Avatar">
        <h3>${u.nombre}</h3>
        <span class="badge ${u.nombre === 'breinerYT' ? 'badge-owner' : ''}">
          ${u.nombre === 'breinerYT' ? 'OWNER' : 'LECTOR'}
        </span>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    grid.innerHTML = 'Error al cargar los perfiles.';
  }
}

// OWNER - LIMPIAR CHAT
const btnClearChat = document.getElementById('btn-owner-clear-chat');
if (btnClearChat) {
  btnClearChat.addEventListener('click', async () => {
    if (!usuarioActual || usuarioActual.nombre !== 'breinerYT') return;
    
    await fetch('/api/chat/clear', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ autor: usuarioActual.nombre })
    });
    
    cargarChatLive();
    alert('Chat limpiado de la Base de Datos.');
  });
}
