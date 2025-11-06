// js/dashboard.js
import { datos } from "./datos.js";
import { verificarSesion, mostrarUsuarioActivo, configurarCierreSesion } from "./auth.js";

// Estado del dashboard
const STATE = {
  categoria: "Todas",
  query: "",
  page: 1,
  perPage: 6,
};

// Atajos simples
const $ = (sel, ctx = document) => ctx.querySelector(sel);

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
  return {
    Idiomas: "cat-Idiomas",
    Deportes: "cat-Deportes",
    Profesiones: "cat-Profesiones",
  }[cat] || "";
}

// Dibuja la estructura base
function renderLayout(container) {
  container.innerHTML = `
    <section class="mb-3">
      <input id="q" class="form-control form-control-lg" placeholder="Buscar por título, texto..." />
    </section>

    <section class="mb-3">
      <div id="tabs" class="d-flex flex-wrap gap-2">
        ${
          (datos.categorias || ["Todas","Idiomas","Deportes","Profesiones"])
            .map(c => `
              <button
                class="tab-pill tab-${c} ${c === STATE.categoria ? "active" : ""}"
                data-cat="${c}"
                type="button"
              >
                ${c}
              </button>
            `)
            .join("")
        }
      </div>
    </section>

    <section>
      <div id="grid" class="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3"></div>
      <nav class="mt-4 d-flex justify-content-center">
        <ul id="pager" class="pagination"></ul>
      </nav>
    </section>
  `;
}


// HTML de una tarjeta
function cardHTML(v) {
  const catCls = categoryClass(v.categoria);
  const typeBadge = v.type === "oferta"
    ? `<span class="badge badge-oferta">Oferta</span>`
    : `<span class="badge badge-peticion">Petición</span>`;

  return `
    <div class="col">
      <div class="card card-ld ${catCls} h-100">
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
    out = out.filter(v => v.categoria === STATE.categoria);
  }
  if (STATE.query) {
    const q = STATE.query;
    out = out.filter(v =>
      v.titulo.toLowerCase().includes(q) ||
      (v.resumen || "").toLowerCase().includes(q) ||
      (v.autor || "").toLowerCase().includes(q)
    );
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
  document.querySelectorAll("#tabs .tab-pill").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.cat === STATE.categoria);
  });
}

// Dibujo principal
function draw() {
  const grid = $("#grid");
  const pager = $("#pager");

  const filtered = applyFilters(datos.voluntariados || []);
  const { items, page, pages } = paginate(filtered, STATE.page, STATE.perPage);

  grid.innerHTML = items.map(cardHTML).join("") || `
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

// Init
document.addEventListener("DOMContentLoaded", () => {
  const usuario = verificarSesion(); // 🔒 redirige si no hay sesión
  if (!usuario) return; // si no hay usuario, no continúa

  mostrarUsuarioActivo(); // muestra el nombre/email
  configurarCierreSesion(); // permite cerrar sesión

  // ❌ elimina o comenta esta línea:
  // initDashboard(); // ejecuta tu dashboard normal
  
  const app = $("#app");
  renderLayout(app);

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

  draw();
});