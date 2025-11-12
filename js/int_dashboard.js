// js/int_dashboard.js (ACTUALIZADO con Drag & Drop)
import { inicializarDatos, listarVoluntariados, getActiveUser, getCategorias, leerSeleccionados, guardarSeleccionados, listarSeleccionadosDB, eliminarSeleccionDB, guardarSeleccionDB } from "./almacenaje.js";


// Estado del dashboard
const STATE = {
 categoria: "Todas",
 query: "",
 page: 1,
 perPage: 6,
 voluntariados: [],
 seleccionados: [] // Array de IDs de tarjetas seleccionadas
};

document.addEventListener('voluntariadoChanged', async () => {
    console.log("[dashboard] DB cambió, recargando voluntariados...");
    STATE.voluntariados = await listarVoluntariados();
    draw();
    renderSeleccionados();
});

// Atajos simples
const $ = (sel, ctx = document) => ctx.querySelector(sel);

function setNavbarUser(name) {
 let badge = $("#userBadge") || document.querySelector(".navbar-text");
 if (!badge) {
  const container = $("#nav") || document.querySelector(".navbar .container, .navbar");
  badge = document.createElement("span");
  badge.className = "navbar-text small text-muted";
  badge.id = "userBadge";
  container?.appendChild(badge);
 }
 badge.textContent = name || "-no login-";
}

// Formatea "YYYY-MM-DD" a "dd/mm/yyyy"
function fmtFecha(iso) {
 if (!iso) return "";
 const d = new Date(iso);
 const dd = String(d.getDate()).padStart(2, "0");
 const mm = String(d.getMonth() + 1).padStart(2, "0");
 const yy = d.getFullYear();
 return `${dd}/${mm}/${yy}`;
}

// Paginación simple
function paginate(arr, page = 1, perPage = 6) {
 const pages = Math.max(1, Math.ceil(arr.length / perPage));
 const p = Math.min(Math.max(page, 1), pages);
 const start = (p - 1) * perPage;
 return { page: p, pages, items: arr.slice(start, start + perPage) };
}

// Clase CSS según categoría (colorea la card)
function categoryClass(cat) {
 return (
  {
   Idiomas: "cat-Idiomas",
   Deportes: "cat-Deportes",
   Profesiones: "cat-Profesiones",
  }[cat] || ""
 );
}

// Dibuja la estructura base
function renderLayout(container) {
 const categorias = getCategorias();
 container.innerHTML = `
  <section class="mb-3">
   <input id="q" class="form-control form-control-lg" placeholder="Buscar por título, texto..." />
  </section>

  <section class="mb-3">
   <div id="tabs" class="d-flex flex-wrap gap-2">
    ${(categorias || ["Todas", "Idiomas", "Deportes", "Profesiones"])
     .map(
      (c) => `
       <button
        class="tab-pill tab-${c} ${c === STATE.categoria ? "active" : ""}"
        data-cat="${c}"
        type="button"
       >
        ${c}
       </button>
      `
     )
     .join("")}
   </div>
  </section>

  <section>
   <div id="grid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3"></div>
   <nav class="mt-4 d-flex justify-content-center">
    <ul id="pager" class="pagination"></ul>
   </nav>
  </section>

    <section class="mt-5">
        <h2 class="h4 mb-3">Mi Selección</h2>
        <div id="drop-zone" class="vstack gap-3">
            <p id="drop-zone-placeholder" class="text-center text-muted m-0">Arrastra aquí tus voluntariados seleccionados</p>
        </div>
    </section>
 `;
}

// HTML de una tarjeta
// HTML de una tarjeta adaptada a tus datos actuales
function cardHTML(v) {
  const catCls = categoryClass(v.categoria);
  const typeBadge = v.type === "oferta" 
    ? `<span class="badge badge-oferta">Oferta</span>` 
    : `<span class="badge badge-peticion">Petición</span>`;

  // Atributo draggable
  return `
    <div class="col" draggable="true" data-id="${v.id}">
      <div class="card card-ld ${catCls} h-100">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between small mb-1">
            <div>${typeBadge}</div>
            <div class="small small-muted fw-semibold">${v.categoria}</div>
          </div>
          <h5 class="mb-1">${v.titulo}</h5>
          <div class="small small-muted mb-2">
            por <strong>${v.autor || ""}</strong> · ${v.fecha ? fmtFecha(v.fecha) : ''}
          </div>
          <p class="flex-grow-1 mb-2">${v.resumen || ""}</p>
          <div class="d-flex justify-content-between align-items-center">
            <button class="btn btn-sm btn-outline-secondary" type="button">Ver detalle</button>
            <span class="small small-muted">${fmtFecha(v.fecha)}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}


// Aplica filtros (categoría + texto) y orden por fecha desc.
function applyFilters(list) {
 let out = list;

 if (STATE.categoria !== "Todas") {
  out = out.filter((v) => v.categoria === STATE.categoria);
 }
 if (STATE.query) {
  const q = STATE.query;
  out = out.filter((v) => v.titulo.toLowerCase().includes(q) || (v.descripcion || "").toLowerCase().includes(q) || (v.email || "").toLowerCase().includes(q));
 }

 return [...out].sort((a, b) => (b.fecha || "").localeCompare(a.fecha || ""));
}

// Construye la paginación
function buildPager(page, pages) {
 if (pages <= 1) return "";
 const item = (p, label = p, disabled = false, active = false) => `
  <li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
   <a class="page-link" href="#" data-page="${p}">${label}</a>
  </li>
 `;
 let html = "";
 html += item(page - 1, "«", page === 1);
 const win = 5;
 let s = Math.max(1, page - Math.floor(win / 2));
 let e = Math.min(pages, s + win - 1);
 if (e - s + 1 < win) s = Math.max(1, e - win + 1);
 for (let p = s; p <= e; p++) html += item(p, String(p), false, p === page);
 html += item(page + 1, "»", page === pages);
 return html;
}

// Marca pestaña activa (solo clase, sin estilos inline para que sea más sencillo)
function paintActiveTab() {
 document.querySelectorAll("#tabs .tab-pill").forEach((btn) => {
  btn.classList.toggle("active", btn.dataset.cat === STATE.categoria);
 });
}

// Dibujo principal
function draw() {
 const grid = $("#grid");
 const pager = $("#pager");

 const voluntariadosDisponibles = STATE.voluntariados.filter(
  (v) => !STATE.seleccionados.includes(v.id)
 );
 const filtered = applyFilters(voluntariadosDisponibles || []);
 const { items, page, pages } = paginate(filtered, STATE.page, STATE.perPage);

 grid.innerHTML =
  items.map(cardHTML).join("") ||
  `
  <div class="col">
   <div class="text-center text-secondary p-5 border rounded">No hay resultados.</div>
  </div>
 `;

 pager.innerHTML = buildPager(page, pages);
 pager.onclick = (e) => {
  const a = e.target.closest("a[data-page]");
  if (!a) return;
  e.preventDefault();
  STATE.page = Number(a.dataset.page);
  draw();
 };

 paintActiveTab();
}

// Función para pintar las tarjetas en la zona de soltar
 function renderSeleccionados() {
  const dropZone = $("#drop-zone");
  const placeholder = $("#drop-zone-placeholder");
 
  // Limpia solo las tarjetas seleccionadas anteriores, no el placeholder
  dropZone.querySelectorAll('.card-selected-item').forEach(card => card.remove());

  if (STATE.seleccionados.length === 0) {
    placeholder.style.display = 'block';
    return;
  }

  placeholder.style.display = 'none';
  // Mapear los seleccionados
  const seleccionadosHTML = STATE.seleccionados.map(id => {
    const voluntariado = STATE.voluntariados.find(v => v.id === id);
    if (!voluntariado) return '';
    const catCls = categoryClass(voluntariado.categoria);

    // Usamos una versión "simplificada" de la tarjeta para la zona de selección
    return `
      <div class="card card-selected-item card-ld ${catCls} p-3 shadow-sm" 
           data-id-seleccionado="${id}" draggable="true" data-id="${id}">
        <div class="d-flex justify-content-between align-items-start mb-2">
          <span class="fw-bold small">${voluntariado.titulo}</span>
          <button type="button" class="btn-close btn-sm" data-id-quitar="${id}" aria-label="Quitar"></button>
        </div>
        <p class="mb-2 small text-muted">${voluntariado.descripcion || ""}</p>
        <div class="d-flex justify-content-between small text-muted">
          <span>${voluntariado.email}</span>
          <span>${fmtFecha(voluntariado.fecha)}</span>
        </div>
      </div>
    `;
  }).join('');
  dropZone.insertAdjacentHTML('beforeend', seleccionadosHTML);
}


// Init
document.addEventListener("DOMContentLoaded", () => {
 initDashboard();
});

async function initDashboard() {
  // Inicializa datos base (usuarios, etc.)
  await inicializarDatos();
  // Usuario activo → navbar
  const active = getActiveUser();
  setNavbarUser(active?.nombre);
  // Dibuja la estructura del dashboard
  const app = $("#app");
  renderLayout(app);
  // Carga los voluntariados desde IndexedDB/localStorage (CRUD)
  STATE.voluntariados = await listarVoluntariados();
  // Carga los seleccionados desde localStorage
  STATE.seleccionados = leerSeleccionados();
  // Agrega listeners de Drag & Drop
  addDragAndDropListeners();
  
  try {
  const seleccionDB = await listarSeleccionadosDB();
  if (Array.isArray(seleccionDB) && seleccionDB.length > 0) {
    const idsIndexed = seleccionDB.map(v => v.id);
    // Combina ambas fuentes sin duplicados
    STATE.seleccionados = Array.from(new Set([...STATE.seleccionados, ...idsIndexed]));
  }
  } catch (err) {
  console.error("Error al listar selección desde IndexedDB", err);
}

 // Listeners de búsqueda y pestañas
 $("#q").addEventListener("input", (e) => {
  STATE.query = e.target.value.trim().toLowerCase();
  STATE.page = 1;
  draw();
 });

 $("#tabs").addEventListener("click", (e) => {
  const btn = e.target.closest("button[data-cat]");
  if (!btn) return;
  STATE.categoria = btn.dataset.cat;
  STATE.page = 1;
  draw();
 });

 // Listeners de Drag & Drop
 addDragAndDropListeners();

 // Primer pintado
 draw();
 // Segundo pintado
 renderSeleccionados();
}

// --- Lógica completa de Drag & Drop ---
function addDragAndDropListeners() {
    const dropZone = $("#drop-zone");
    const grid = $("#grid");

    // Click para quitar tarjetas
    dropZone.addEventListener("click", async (e) => {
        const quitartBtn = e.target.closest('[data-id-quitar]');
        if (!quitartBtn) return;

        const id = Number(quitartBtn.dataset.idQuitar);
        STATE.seleccionados = STATE.seleccionados.filter(selId => selId !== id);
        draw();
        renderSeleccionados();
        guardarSeleccionados(STATE.seleccionados);

        try {
            await eliminarSeleccionDB(id);
            console.log("[dashboard] eliminación en IndexedDB OK", id);
        } catch (err) {
            console.error("[dashboard] error eliminando en IndexedDB", err);
            alert("No se pudo eliminar la selección en IndexedDB. Revisa la consola.");
        }
    });

    // Drag & Drop: zona de soltar
    dropZone.addEventListener("dragover", handleDragOver);
    dropZone.addEventListener("dragleave", handleDragLeave);
    dropZone.addEventListener("drop", handleDrop);

    // Drag & Drop: tarjetas → event delegation
    grid.addEventListener("dragstart", (e) => {
        const card = e.target.closest('[data-id]');
        if (!card) return;
        handleDragStart(e);
    });
}

function handleDragStart(e) {
    // Guarda el ID de la tarjeta que estás arrastrando
    const card = e.target.closest('[data-id]');
    if (card) {
        e.dataTransfer.setData("text/plain", card.dataset.id);
        e.dataTransfer.effectAllowed = "move";
    }
}

function handleDragOver(e) {
    e.preventDefault(); // ¡Obligatorio! Permite que se pueda "soltar"
    const dropZone = $("#drop-zone");
    dropZone.classList.add("drag-over"); // Enciende la "bombilla" (el CSS)
    e.dataTransfer.dropEffect = "move";
}

function handleDragLeave(e) {
    const dropZone = $("#drop-zone");
    dropZone.classList.remove("drag-over"); // Apaga la "bombilla" (el CSS)
}

async function handleDrop(e) {
    e.preventDefault();
    const dropZone = $("#drop-zone");
    dropZone.classList.remove("drag-over"); // Apaga la "bombilla"

    // Obtiene el ID que guardamos en handleDragStart
    const id = Number(e.dataTransfer.getData("text/plain"));
    if (!id) return;
    
    // Añade el ID al array de seleccionados (si no estaba ya)
    if (!STATE.seleccionados.includes(id)) {

        STATE.seleccionados.push(id);
        // Vuelve a pintar las dos zonas para que se actualicen
        draw(); // Vuelve a pintar la rejilla (la tarjeta arrastrada desaparecerá)
        renderSeleccionados(); // Pinta la zona de selección (la tarjeta aparecerá aquí)

        // Luego guarda en IndexedDB (async) y localStorage
        guardarSeleccionados(STATE.seleccionados);
        const voluntariado = STATE.voluntariados.find(v => v.id === id);
        if (voluntariado) {
            try {
                await guardarSeleccionDB({...voluntariado, id: Number(voluntariado.id)});
                console.log("[dashboard] handleDrop: guardado en IndexedDB OK", id);
            } catch (err) {
                console.error("[dashboard] handleDrop: error guardando en IndexedDB", err);
                // revertir en memoria/localStorage para mantener consistencia
                STATE.seleccionados = STATE.seleccionados.filter(sid => sid !== id);
                guardarSeleccionados(STATE.seleccionados);
                draw();
                renderSeleccionados();
                alert("No se pudo guardar la selección en IndexedDB. Reintentad o revisad consola.");
            }
        }
    }
}    