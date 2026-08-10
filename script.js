// Configuración opcional de Supabase
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = 'tu-anon-key';

const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');
const btnLogout = document.getElementById('btn-logout');
const msgError = document.getElementById('msg-error');

const AVATAR_DEFECTO = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';

// Función para convertir la foto subida a un formato que el navegador guarde fácil
function leerImagenComoBase64(file) {
  return new Promise((resolve) => {
    if (!file) resolve(AVATAR_DEFECTO);
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

// 1. REGISTRARSE
btnRegister.addEventListener('click', async () => {
  msgError.innerText = '';
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();
  const fotoArchivo = document.getElementById('foto-input').files[0];

  if (!nombre || !password) {
    msgError.innerText = 'Por favor ingresa un usuario y contraseña.';
    return;
  }

  // Obtener usuarios almacenados
  let usuarios = JSON.parse(localStorage.getItem('ml_usuarios') || '{}');

  if (usuarios[nombre]) {
    msgError.innerText = 'Este nombre de usuario ya existe. Intenta iniciar sesión.';
    return;
  }

  // Procesar foto de perfil
  const fotoUrl = await leerImagenComoBase64(fotoArchivo);

  // Guardar usuario
  usuarios[nombre] = { password, fotoUrl };
  localStorage.setItem('ml_usuarios', JSON.stringify(usuarios));

  alert('¡Cuenta creada con éxito! Ahora puedes iniciar sesión.');
});

// 2. INICIAR SESIÓN
btnLogin.addEventListener('click', () => {
  msgError.innerText = '';
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();

  if (!nombre || !password) {
    msgError.innerText = 'Ingresa usuario y contraseña.';
    return;
  }

  // --- TU CUENTA DE ADMIN ---
  // Cambia 'admin' y '1234' por los datos que tú quieras
  if (nombre === 'admin' && password === '1234') {
    iniciarSesionExitosa('Creador (Admin)', AVATAR_DEFECTO, true);
    return;
  }

  // Verificar usuario registrado
  let usuarios = JSON.parse(localStorage.getItem('ml_usuarios') || '{}');
  const user = usuarios[nombre];

  if (!user || user.password !== password) {
    msgError.innerText = 'Usuario o contraseña incorrectos.';
    return;
  }

  iniciarSesionExitosa(nombre, user.fotoUrl, false);
});

function iniciarSesionExitosa(nombre, fotoUrl, esAdmin) {
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('comic-section').style.display = 'block';

  document.getElementById('user-name').innerText = nombre;
  document.getElementById('avatar-img').src = fotoUrl;
  document.getElementById('user-profile').style.display = 'flex';

  if (esAdmin) {
    document.getElementById('admin-panel').style.display = 'block';
  } else {
    document.getElementById('admin-panel').style.display = 'none';
  }
}

// 3. CERRAR SESIÓN
btnLogout.addEventListener('click', () => {
  location.reload();
});
