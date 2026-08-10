const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = 'tu-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const btnLogin = document.getElementById('btn-login');
const btnRegister = document.getElementById('btn-register');

// Foto por defecto si el usuario no selecciona ninguna
const AVATAR_DEFECTO = 'https://upload.wikimedia.org/wikipedia/commons/0/0b/Netflix-avatar.png';

// Función para procesar el ingreso del usuario
async function procesarUsuario(esRegistro) {
  const nombre = document.getElementById('nombre').value.trim();
  const password = document.getElementById('password').value.trim();
  const fotoArchivo = document.getElementById('foto-input').files[0];

  if (!nombre || !password) {
    alert('Por favor ingresa un nombre y una contraseña.');
    return;
  }

  let fotoUrl = AVATAR_DEFECTO;

  // Si el usuario subió una imagen, la guardamos
  if (fotoArchivo) {
    const fileName = `${Date.now()}_${fotoArchivo.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`public/${fileName}`, fotoArchivo);

    if (data) {
      fotoUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
    }
  }

  // --- MODO ADMIN ---
  // Cambia 'admin' y '1234' por tu usuario y clave secreta
  if (nombre === 'admin' && password === '1234') {
    document.getElementById('admin-panel').style.display = 'block';
  } else {
    document.getElementById('admin-panel').style.display = 'none';
  }

  // Ocultar Auth y mostrar Interfaz Principal
  document.getElementById('auth-container').style.display = 'none';
  document.getElementById('comic-section').style.display = 'block';

  // Cargar Perfil
  document.getElementById('user-name').innerText = nombre;
  document.getElementById('avatar-img').src = fotoUrl;
  document.getElementById('user-profile').style.display = 'flex';
}

// Eventos para los dos botones
btnLogin.addEventListener('click', () => procesarUsuario(false));
btnRegister.addEventListener('click', () => procesarUsuario(true));
