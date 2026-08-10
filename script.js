// Configuración de Supabase (te dan estos datos al crear tu proyecto gratis en supabase.com)
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_KEY = 'tu-anon-key';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const btnLogin = document.getElementById('btn-login');

btnLogin.addEventListener('click', async () => {
  const nombre = document.getElementById('nombre').value;
  const password = document.getElementById('password').value;
  const fotoArchivo = document.getElementById('foto-input').files[0];

  // 1. Subir la foto de perfil si seleccionó una
  let fotoUrl = 'avatar-por-defecto.png';
  if (fotoArchivo) {
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(`public/${Date.now()}_${fotoArchivo.name}`, fotoArchivo);
    
    if (data) {
      fotoUrl = `${SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`;
    }
  }

  // 2. Comprobar si ERES TÚ (El Admin)
  if (nombre === 'tu_usuario_admin' && password === 'tu_contraseña_secreta') {
    document.getElementById('admin-panel').style.display = 'block';
    alert('¡Bienvenido Creador!');
  } else {
    document.getElementById('admin-panel').style.display = 'none';
  }

  // 3. Mostrar el perfil en pantalla
  document.getElementById('user-name').innerText = nombre;
  document.getElementById('avatar-img').src = fotoUrl;
  document.getElementById('user-profile').style.display = 'flex';
  document.getElementById('auth-section').style.display = 'none';
});
