// js/dashboard.js

import { inicializarDatos, listarVoluntariados, getActiveUser, getCategorias, obtenerVoluntariado, borrarVoluntariado, anadirSeleccionado, listarSeleccionados } from "./almacenaje.js";

// Estado del dashboard
const STATE = {
  categoria: "Todas",
  query: "",
  page: 1,
  perPage: 6,
  voluntariados: [],
};

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
    <div class="row align-items-stretch">
      <!-- Columna principal: buscador, tabs, filtros, tarjetas, paginación -->
      <div class="col-md-8 col-lg-9 d-flex flex-column">
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
      </div>
      <!-- Columna seleccionados (dropzone) -->
      <div class="col-md-4 col-lg-3 d-flex flex-column">
        <h6 class="border-bottom pb-2 mb-3 text-uppercase text-muted">Seleccionados</h6>
        <div id="zona-seleccionados" class="dropzone border rounded flex-grow-1  p-3 bg-white"></div>
      </div>
    </div>
  `;
}

// HTML de una tarjeta
function cardHTML(v) {
  const catCls = categoryClass(v.categoria);
  const typeBadge = v.type === "oferta" ? `<span class="badge badge-oferta">Oferta</span>` : `<span class="badge badge-peticion">Petición</span>`;

  return `
    <div class="col">
      <div class="card card-ld ${catCls} h-100" id="card-${v.id}" draggable="true" data-id="${v.id}"">
        <div class="card-body d-flex flex-column">
          <div class="d-flex justify-content-between small mb-1">
            <div>${typeBadge}</div>
            <div class="small small-muted fw-semibold">${v.categoria}</div>
          </div>
          <h5 class="mb-1">${v.titulo}</h5>
          <div class="small small-muted mb-2">por <strong>${v.autor}</strong> · ${v.modalidad}</div>
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
    out = out.filter((v) => v.titulo.toLowerCase().includes(q) || (v.resumen || "").toLowerCase().includes(q) || (v.autor || "").toLowerCase().includes(q));
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

  //const filtered = applyFilters(datos.voluntariados || []);
  const filtered = applyFilters(STATE.voluntariados || []);
  const { items, page, pages } = paginate(filtered, STATE.page, STATE.perPage);

  grid.innerHTML =
    items.map(cardHTML).join("") ||
    `
    <div class="col">
      <div class="text-center text-secondary p-5 border rounded">No hay resultados.</div>
    </div>
  `;
  // Asignación de los eventos dragstart
  document.querySelectorAll('.card[draggable="true"]').forEach((card) => {
    card.addEventListener("dragstart", handleDragStart);
  });

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

async function pintarSeleccionados() {
  const zonaSeleccionados = document.getElementById("zona-seleccionados");
  zonaSeleccionados.innerHTML = ""; // Limpia primero
  const seleccionados = await listarSeleccionados();
  for (const v of seleccionados) {
    // Usa tu misma función cardHTML, o una adaptada si quieres otra visual
    const card = document.createElement("div");
    card.innerHTML = cardHTML(v); // O seleccionadosCardHTML(v) si tienes una diferente
    // Elimina el div.col para evitar layout raro
    const innerCard = card.querySelector(".card");
    if (innerCard) {
      innerCard.classList.remove("h-100");
      innerCard.classList.add("border-primary", "mb-3");
      zonaSeleccionados.appendChild(innerCard);
    }
  }
}

function setupDropzone() {
  const dropzone = document.getElementById("zona-seleccionados");
  if (!dropzone) return;
  dropzone.addEventListener("dragover", (e) => e.preventDefault());
  dropzone.addEventListener("drop", handleDrop);
}

function handleDragStart(e) {
  const card = e.target.closest(".card");
  if (!card) return;
  const id = card.dataset.id;
  e.dataTransfer.setData("text/plain", id);
}

async function handleDrop(e) {
  e.preventDefault();
  const id = e.dataTransfer.getData("text/plain");
  console.log("DROP! id: ", id);
  moverATarjetaSeleccionada(id);
  await pintarSeleccionados();
}

async function moverATarjetaSeleccionada(id) {
  console.log("Mover tarjeta: ", id);
  const card = document.getElementById(`card-${id}`);
  const zonaSeleccionados = document.getElementById("zona-seleccionados");
  if (!card || !zonaSeleccionados) return;

  // Elimina del grid visual
  const col = card.closest(".col, .col-6, .col-md-6");
  if (col) col.remove();
  card.classList.remove("h-100");
  zonaSeleccionados.appendChild(card);
  card.classList.add("border-primary", "mb-3");

  // Actualizar IndexedDB
  try {
    // Obtener el voluntariado
    const voluntariado = await obtenerVoluntariado(id);
    if (!voluntariado) {
      console.warn("Voluntariado no encontrado en la DB:", id);
      return;
    }

    // Eliminar de voluntariados
    await borrarVoluntariado(id);

    // Añadir al store seleccionados
    await anadirSeleccionado(voluntariado);
    STATE.voluntariados = await listarVoluntariados();
    draw();
    await pintarSeleccionados();
    console.log(`Voluntariado ${id} movido a 'seleccionados'`);
  } catch (error) {
    console.error("Error al mover voluntariado:", error);
  }
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

  pintarSeleccionados();

  setupDropzone();

  // Carga los voluntariados desde IndexedDB/localStorage (CRUD)
  STATE.voluntariados = await listarVoluntariados();

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

  // Primer pintado
  draw();
}
