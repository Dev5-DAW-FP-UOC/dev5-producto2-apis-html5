// js/volunteers.js
import { datos } from "./datos.js";

const $  = (s, ctx=document) => ctx.querySelector(s);
const genId = () => "v" + Math.random().toString(36).slice(2) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0,10);

function fmtFecha(iso){
  if(!iso) return "";
  const d = new Date(iso);
  return String(d.getDate()).padStart(2,"0") + "/" +
         String(d.getMonth()+1).padStart(2,"0") + "/" +
         d.getFullYear();
}

function normCat(c){
  const v = String(c || "").toLowerCase();
  if (v.startsWith("idio")) return "Idiomas";
  if (v.startsWith("depo")) return "Deportes";
  if (v.startsWith("prof")) return "Profesiones";
  return "Idiomas";
}

function itemHTML(v){
  const cat = normCat(v.categoria);
  const typeBadge = v.type === "peticion"
    ? '<span class="badge bg-primary me-2">Petición</span>'
    : '<span class="badge bg-warning text-dark me-2">Oferta</span>';

  // Botón de papelera (SVG inline) en lugar de texto "Eliminar"
  const trashBtn = `
    <button class="btn-icon" data-action="del" title="Eliminar" aria-label="Eliminar">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 6h18" stroke="#666" stroke-width="2" stroke-linecap="round"/>
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke="#666" stroke-width="2"/>
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="#666" stroke-width="2"/>
        <path d="M10 11v6M14 11v6" stroke="#666" stroke-width="2" stroke-linecap="round"/>
      </svg>
    </button>
  `;

  return `
    <div class="item p-3 p-md-4 border rounded-3 cat-${cat}" data-id="${v.id}">
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div class="flex-grow-1">
          <div class="fw-bold mb-1">${typeBadge}${v.titulo}</div>
          <div class="text-muted small mb-2">${cat}${v.email ? " · Contacto: " + v.email : ""}</div>
          <div>${v.descripcion || v.resumen || ""}</div>
        </div>
        <div class="text-end d-flex flex-column align-items-end gap-2">
          <small class="text-muted">${fmtFecha(v.fecha)}</small>
          ${trashBtn}
        </div>
      </div>
    </div>
  `;
}

function drawList(){
  const list = $("#list");
  if (!list) return;

  if (!Array.isArray(datos.voluntariados)) datos.voluntariados = [];

  datos.voluntariados.forEach(v => {
    if (v.id == null) v.id = genId();
    v.id = String(v.id);
    v.categoria = normCat(v.categoria);
    if (!v.fecha) v.fecha = todayISO();
  });

  if (!datos.voluntariados.length){
    list.innerHTML = `<div class="text-muted">No hay registros.</div>`;
    return;
  }

  list.innerHTML = datos.voluntariados.map(itemHTML).join("");
}

function handleSubmit(e){
  e.preventDefault();
  const f = e.currentTarget;

  const nuevo = {
    id: genId(),
    titulo: (f.titulo?.value || "").trim(),
    categoria: normCat(f.categoria?.value),
    type: f.tipo?.value || "oferta",
    email: (f.email?.value || "").trim(),
    descripcion: (f.descripcion?.value || "").trim(),
    resumen: (f.descripcion?.value || "").trim(),
    fecha: f.fecha?.value || todayISO(),
  };

  if (!nuevo.titulo || !nuevo.descripcion){
    alert("Rellena título y descripción.");
    return;
  }

  datos.voluntariados.push(nuevo);
  drawList();
  f.reset();
  const ff = $("#fecha");
  if (ff) ff.value = todayISO();
}

function handleListClick(e){
  const btn = e.target.closest("[data-action='del']");
  if (!btn) return;
  const card = btn.closest("[data-id]");
  const id = card?.dataset.id;
  if (!id) return;

  const idx = datos.voluntariados.findIndex(v => String(v.id) === id);
  if (idx !== -1){
    datos.voluntariados.splice(idx, 1);
    drawList();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const fch = $("#fecha");
  if (fch && !fch.value) fch.value = todayISO();

  drawList();
  $("#formVol")?.addEventListener("submit", handleSubmit);
  $("#list")?.addEventListener("click", handleListClick);
});
