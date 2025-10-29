# dev5-producto1-frontend (Volunet)

Frontend del **Producto 1**: app de voluntariado con **HTML5 + CSS + JavaScript** y **Bootstrap (CDN)**.  
No hay base de datos: todo vive **en memoria** dentro de `js/datos.js`.

---

## Cómo ejecutar (rápido)

**Opción recomendada (VS Code + Live Server):**
1. Abre la carpeta del proyecto en VS Code.
2. Instala la extensión **Live Server** (si no la tienes).
3. Clic derecho sobre `dashboard.html` o `index.html` → **Open with Live Server**.

**Opción simple:** abre `dashboard.html` con doble clic en tu navegador (también funciona).

> Si no ves cambios de estilos, sube el numerito de versión en los HTML, por ejemplo:  
> `<link rel="stylesheet" href="./css/styles.css?v=16" />` → `v=17`.

---

## Estructura

```
dev5-producto1-frontend/
├─ assets/
│  └─ img/
│     └─ logo_volunet.png
├─ css/
│  └─ styles.css           # estilos globales + colores por categoría
├─ js/
│  ├─ datos.js             # única “fuente de datos”: usuarios, voluntariados y sesión (memoria)
│  ├─ dashboard.js         # filtros, tarjetas y paginación del dashboard
│  ├─ volunteers.js        # alta/listado/eliminar voluntariados (memoria)
│  ├─ users.js             # alta/listado/eliminar usuarios (memoria)
│  └─ login.js             # login contra datos.js y actualización del navbar
├─ dashboard.html          # pantalla principal (tarjetas)
├─ volunteers.html         # gestión de voluntariados
├─ users.html              # gestión de usuarios
├─ login.html              # login sencillo (sin registro persistente)
└─ README.md
```

---

## Páginas (qué hace cada una)

### `dashboard.html`
- Muestra tarjetas de **voluntariados** (`js/datos.js`).
- **Filtros** por categoría: *Todas, Idiomas, Deportes, Profesiones*.
- **Búsqueda** por título, resumen o autor.
- **Paginación** (6 por página).
- Colores suaves por categoría desde `styles.css`.

### `volunteers.html` (Gestión de voluntarios)
- Formulario: **Título, Categoría, Tipo (oferta/petición), Fecha, Email, Descripción**.
- Al crear, se añade al **listado** de abajo (en memoria).
- **Eliminar** con icono de papelera (SVG inline).
- Las tarjetas del listado también se tiñen por categoría.

### `users.html` (Gestión de usuarios)
- Formulario: **Nombre, Email, Password (mín. 6)**.
- Añade usuarios al **listado** (en memoria).
- **Eliminar** con icono de papelera.
- Si recargas, vuelven los usuarios por defecto de `datos.js`.

### `login.html`
- Login contra los usuarios definidos en `js/datos.js`.
- Si las credenciales son correctas:
  - Ventana nativa **“Inicio de sesión exitoso”**.
  - Pinta el **nombre** en el navbar (`#userBadge`).
- *No hay registro real ni persistencia.*

---

## Datos en memoria (`js/datos.js`)

```js
export const datos = {
  session: { currentUser: null },      // sesión actual (solo en memoria)

  usuarios: [                          // usuarios por defecto:
    { id: 1, nombre: "Admin Demo", email: "admin@volunet.com", password: "123456", rol: "admin" },
    { id: 2, nombre: "Ana Pérez",  email: "ana@volunet.com",   password: "123456", rol: "user"  },
  ],

  categorias: ["Todas", "Idiomas", "Deportes", "Profesiones"],

  voluntariados: [ /* …ofertas y peticiones de ejemplo… */ ]
};
```

**Credenciales de prueba:**
- `admin@volunet.com / 123456`
- `ana@volunet.com / 123456`

> **Nota:** al recargar se pierde lo creado en la sesión. Vuelven los datos por defecto de `datos.js`.

---

## Estilos y colores
- **`styles.css`** define variables y tintes por categoría:
  - Idiomas → azul `--cat-idiomas`
  - Deportes → naranja `--cat-deportes`
  - Profesiones → verde `--cat-prof`
- Hay **fallbacks** si el navegador no soporta `color-mix()`.
- El **navbar** usa la imagen `assets/img/logo_volunet.png`.
- Iconos de **papelera** en `users` y `volunteers` están como **SVG inline**.

---

## Tecnologías
- **HTML5** (páginas separadas).
- **CSS** (archivo único `styles.css`).
- **JavaScript** (módulos simples ES6).
- **Bootstrap 5 (CDN)** para grillas, tarjetas, formularios y utilidades.

---


