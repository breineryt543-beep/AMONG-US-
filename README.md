# Misión Lunar

Plataforma tipo Netflix para tu cómic. Login/registro con usuario y
contraseña, página principal con foto de perfil y menú hamburguesa (Home,
Perfil, Blog, Amigos globales).

- **Todo es un solo Cloudflare Worker:** sirve las páginas (carpeta `public/`)
  y también la API (dentro del mismo `worker.js`), por eso funciona con la
  URL `tuproyecto.workers.dev` que ya tienes.
- **Base de datos:** Cloudflare KV (usuarios, posts del blog, amigos).
- **Código:** GitHub. Cada `git push` vuelve a desplegar solo.

## Estructura

```
mision-lunar/
├── worker.js           (backend: rutas /api/... + sirve los archivos estáticos)
├── wrangler.toml        (config: aquí se declara el KV, se enlaza solo)
└── public/
    ├── index.html        (login)
    ├── register.html      (registro)
    ├── home.html            (portada estilo Netflix)
    ├── perfil.html
    ├── blog.html
    ├── amigos.html
    ├── css/style.css
    └── js/app.js
```

## 1. Sube el proyecto a GitHub

```bash
git init
git add .
git commit -m "Misión Lunar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mithur_2.0.git
git push -u origin main
```

## 2. Confirma tu proyecto en Cloudflare

Como tu proyecto actual quedó creado como **Worker** (por eso la URL termina
en `.workers.dev`), no hace falta recrearlo: con esta nueva estructura
(`worker.js` + `wrangler.toml` con `[assets]`) el mismo proyecto va a
desplegar bien, porque ahora sí tiene un punto de entrada.

Solo confirma en el dashboard, en tu proyecto → **Settings** → **Build**,
que el comando de build esté vacío y que el "root directory" sea la raíz del
repo (donde está `wrangler.toml`).

## 3. Crea el KV una sola vez y pégalo en el código (esto lo hace automático)

Este es el único paso manual, y solo se hace **una vez**:

1. Dashboard → **Workers & Pages** → **KV** → **Create a namespace** → nómbralo
   `mision-lunar-db`.
2. Copia el **ID** que te da.
3. Abre `wrangler.toml` en tu repo y reemplaza `PON_AQUI_TU_KV_ID` por ese ID:
   ```toml
   [[kv_namespaces]]
   binding = "COMIC_KV"
   id = "aqui-va-tu-id-real"
   ```
4. `git add . && git commit -m "Enlazar KV" && git push`.

A partir de ahí, **cada vez que despliegues (cada `git push`), el KV se
enlaza solo** porque queda declarado en el código — no vuelves a tocar el
dashboard para esto.

## 4. Listo

Abre tu URL `https://mithur-2-0.breineryt543.workers.dev/`, regístrate con
nombre, usuario y contraseña, e inicia sesión. Ya deberías caer en la
página principal.

## Notas

- Las contraseñas se guardan cifradas (hash SHA-256), nunca en texto plano,
  y ningún endpoint de la API las devuelve al navegador.
- Las fotos de perfil por defecto se generan con DiceBear a partir del
  usuario; en Perfil puedes pegar la URL de otra imagen.
- Los capítulos en `home.html` son tarjetas de ejemplo — ahí conectas tu
  lector de cómic real más adelante.
- Si ya te habías registrado con la versión vieja (sin contraseña, con
  `functions/api/`), esas cuentas no van a funcionar con este nuevo
  `worker.js` — bórralas del KV (dashboard → KV → tu namespace → busca
  `user:tu_usuario` y elimínala) y regístrate de nuevo.
