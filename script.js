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

// --- CONTROL DEL MENÚ LATERAL ---
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

// NAVEGACIÓN ENTRE PESTAÑAS
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
  });
});

// --- BASE DE DATOS LOCAL Y FOTOS ---
function leerImagenComoBase64(file) {
  return new Promise((resolve) => {
    if (!file) resolve(AVATAR_DEFECTO);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// REGISTRO
btnRegister.addEventListener('click', async () => {
  msgError.innerText = '';
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();
  const fotoArchivo = document.getElementById('foto-input').files[0];

  if (!nombre || !password) {
    msgError.innerText = 'Por favor completa todos los campos.';
    return;
  }

  let usuarios = JSON.parse(localStorage.getItem('ml_usuarios') || '{}');

  if (usuarios[nombre]) {
    msgError.innerText = 'El nombre de usuario ya existe.';
    return;
  }

  const fotoUrl = await leerImagenComoBase64(fotoArchivo);
  const esOwner = (nombre === 'breinerYT');

  usuarios[nombre] = { password, fotoUrl, esOwner };
  localStorage.setItem('ml_usuarios', JSON.stringify(usuarios));

  alert('¡Registro exitoso! Ya puedes iniciar sesión.');
});

// LOGIN
btnLogin.addEventListener('click', () => {
  msgError.innerText = '';
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();

  let usuarios = JSON.parse(localStorage.getItem('ml_usuarios') || '{}');
  const user = usuarios[nombre];

  if (!user || user.password !== password) {
    msgError.innerText = 'Usuario o contraseña incorrectos.';
    return;
  }

  usuarioActual = { nombre, ...user };

  // Detección automática de OWNER para la cuenta breinerYT
  if (nombre === 'breinerYT') {
    usuarioActual.esOwner = true;
  }

  iniciarSesion();
});

function iniciarSesion() {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('app-content').style.display = 'block';

  document.getElementById('user-name').innerText = usuarioActual.nombre;
  document.getElementById('avatar-img').src = usuarioActual.fotoUrl;
  document.getElementById('user-profile').style.display = 'flex';

  const badge = document.getElementById('user-badge');
  if (usuarioActual.esOwner) {
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

btnLogout.addEventListener('click', () => location.reload());

// --- 2. BLOG LIVE CHAT ---
const btnSendChat = document.getElementById('btn-send-chat');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');

function cargarChatLive() {
  const mensajes = JSON.parse(localStorage.getItem('ml_chat_live') || '[]');
  chatMessages.innerHTML = '';
  mensajes.forEach(m => {
    const div = document.createElement('div');
    div.className = 'chat-msg';
    div.innerHTML = `<div class="author">${m.autor}</div><div>${m.texto}</div>`;
    chatMessages.appendChild(div);
  });
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

btnSendChat.addEventListener('click', () => {
  const texto = chatInput.value.trim();
  if (!texto) return;

  const mensajes = JSON.parse(localStorage.getItem('ml_chat_live') || '[]');
  mensajes.push({ autor: usuarioActual.nombre, texto });
  localStorage.setItem('ml_chat_live', JSON.stringify(mensajes));

  chatInput.value = '';
  cargarChatLive();
});

// --- 4. SECCIÓN GLOBAL (PERFILES) ---
function cargarPerfilesGlobales() {
  const grid = document.getElementById('global-profiles-list');
  const usuarios = JSON.parse(localStorage.getItem('ml_usuarios') || '{}');
  grid.innerHTML = '';

  Object.keys(usuarios).forEach(usrName => {
    const u = usuarios[usrName];
    const card = document.createElement('div');
    card.className = 'profile-card';
    card.innerHTML = `
      <img src="${u.fotoUrl}" alt="Avatar">
      <h3>${usrName}</h3>
      <span class="badge ${usrName === 'breinerYT' ? 'badge-owner' : ''}">
        ${usrName === 'breinerYT' ? 'OWNER' : 'LECTOR'}
      </span>
    `;
    grid.appendChild(card);
  });
}

// OWNER - Limpiar Chat
const btnClearChat = document.getElementById('btn-owner-clear-chat');
if (btnClearChat) {
  btnClearChat.addEventListener('click', () => {
    localStorage.removeItem('ml_chat_live');
    cargarChatLive();
    alert('El chat en vivo ha sido limpiado.');
  });
}
btnLogout.addEventListener('click', () => {
  location.reload();
});
