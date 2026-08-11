# Misión Lunar

Plataforma tipo Netflix para tu cómic. Login/registro simple (solo nombre y
usuario, sin contraseña), página principal con foto de perfil y menú
hamburguesa (Home, Perfil, Blog, Amigos globales).

- **Frontend:** HTML + CSS + JS puro (sin frameworks, sin paso de build).
- **Backend:** Cloudflare Pages Functions (carpeta `functions/api`).
- **Base de datos:** Cloudflare KV (guarda usuarios, posts del blog y amigos).
- **Hosting:** Cloudflare Pages.
- **Código:** GitHub.

## Estructura

```
mision-lunar/
├── index.html        (login)
├── register.html      (registro)
├── home.html           (portada estilo Netflix)
├── perfil.html
├── blog.html
├── amigos.html
├── css/style.css
├── js/app.js
└── functions/api/      (backend: register, login, users, profile, blog, friends)
```

> **Importante:** este proyecto NO lleva `wrangler.toml`. Si Cloudflare detecta
> ese archivo, a veces intenta desplegarlo como un Worker (`wrangler deploy`)
> en lugar de como Pages, y falla con "Missing entry-point to Worker script".
> El binding de KV se configura desde el dashboard (paso 4 de abajo), no por
> archivo.

## 1. Sube el proyecto a GitHub

Desde la carpeta del proyecto:

```bash
git init
git add .
git commit -m "Primera versión de Misión Lunar"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/mision-lunar.git
git push -u origin main
```

(Antes crea el repo vacío en https://github.com/new, sin README, y copia esa
URL en el paso `git remote add`.)

## 2. Crea el proyecto en Cloudflare Pages

1. Entra a https://dash.cloudflare.com → **Workers & Pages** → **Create** → **Pages** → **Connect to Git**.
2. Elige tu repositorio `mision-lunar`.
3. En la configuración de build:
   - **Framework preset:** None
   - **Build command:** (déjalo vacío)
   - **Build output directory:** `/`
4. Dale a **Save and Deploy**.

Cloudflare detecta sola la carpeta `functions/` y la convierte en tu backend.

## 3. Crea la base de datos (KV)

1. En el dashboard: **Workers & Pages** → **KV** → **Create a namespace**.
2. Nómbralo, por ejemplo, `mision-lunar-db`.
3. Copia el **ID** que te da.

## 4. Conecta el KV con tu proyecto de Pages

1. Entra a tu proyecto de Pages → **Settings** → **Functions** → **KV namespace bindings**.
2. Agrega un binding:
   - **Variable name:** `COMIC_KV`
   - **KV namespace:** el que creaste en el paso 3.
3. Guarda y vuelve a desplegar (**Deployments** → **Retry deployment**, o simplemente haz un nuevo `git push`).

## 5. Listo

Cuando el deploy termine, Cloudflare te da una URL tipo
`https://mision-lunar.pages.dev`. Ábrela, regístrate con tu nombre y usuario,
y ya puedes navegar Home / Perfil / Blog / Amigos.

## Notas

- El login es intencionalmente simple (sin contraseña), tal como se pidió:
  solo nombre y usuario. Si más adelante quieres agregar contraseñas o
  verificación, se puede sumar sobre esta misma base.
- Las fotos de perfil por defecto se generan automáticamente con DiceBear a
  partir del usuario; en la página de Perfil puedes pegar la URL de otra
  imagen si prefieres.
- Los capítulos del cómic en `home.html` son tarjetas de ejemplo — ahí
  conectarás tu lector de cómic real más adelante.
- Cada vez que hagas `git push` a `main`, Cloudflare Pages vuelve a
  desplegar automáticamente.
