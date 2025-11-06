// js/volunteers.js
import { datos } from "./datos.js";
import { mostrarUsuarioActivo, verificarSesion } from "./auth.js";

const $ = (s, ctx = document) => ctx.querySelector(s);
const genId = () => "v" + Math.random().toString(36).slice(2) + Date.now().toString(36);
const todayISO = () => new Date().toISOString().slice(0, 10);

let db = null;

// --- Inicializa IndexedDB ---
function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("VolunetDB", 1);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("voluntariados")) {
        db.createObjectStore("voluntariados", { keyPath: "id" });
      }
    };
    req.onsuccess = (e) => {
      db = e.target.result;
      resolve(db);
    };
    req.onerror = (e) => reject(e);
  });
}

// --- CRUD IndexedDB ---
function saveVoluntariado(v) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("voluntariados", "readwrite");
    const store = tx.objectStore("voluntariados");
    store.put(v);
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e);
  });
}

function deleteVoluntariado(id) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("voluntariados", "readwrite");
    const store = tx.objectStore("voluntariados");
    store.delete(String(id));
    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e);
  });
}

function getAllVoluntariados() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction("voluntariados", "readonly");
    const store = tx.objectStore("voluntariados");
    const req = store.getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = (e) => reject(e);
  });
}

// --- Precarga inicial sin duplicados ---
async function precargarDatosIniciales() {
  const existentes = await getAllVoluntariados();
  if (existentes.length > 0) return; // ya hay datos, no hacer nada

  console.log("Precargando datos desde datos.js...");
  for (const v of datos.voluntariados || []) {
    v.id = String(v.id ?? genId()); // forzar string
    if (!v.autor && v.nombre) v.autor = v.nombre;

    await new Promise((resolve) => {
      const tx = db.transaction("voluntariados", "readwrite");
      const store = tx.objectStore("voluntariados");
      const req = store.add(v); // add() evita sobrescribir duplicados
      req.onsuccess = () => resolve();
      req.onerror = () => resolve(); // ignorar error si ya existe
    });
  }
}

// --- Utilidades ---
function fmtFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`;
}

function normCat(c) {
  const v = String(c||"").toLowerCase();
  if (v.startsWith("idio")) return "Idiomas";
  if (v.startsWith("depo")) return "Deportes";
  if (v.startsWith("prof")) return "Profesiones";
  return "Idiomas";
}

function itemHTML(v) {
  const cat = normCat(v.categoria);
  const typeBadge = v.type === "peticion"
    ? '<span class="badge bg-primary me-2">Petición</span>'
    : '<span class="badge bg-warning text-dark me-2">Oferta</span>';

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
          <div class="text-muted small mb-2">${cat}${v.email ? " · Contacto: "+v.email : ""}</div>
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

// --- Dibujar lista ---
async function drawList() {
  const list = $("#list");
  if (!list) return;

  const voluntariados = await getAllVoluntariados();
  if (!voluntariados.length) {
    list.innerHTML = `<div class="text-muted">No hay registros.</div>`;
    return;
  }

  voluntariados.forEach(v => {
    if (!v.email && v.autor) {
      const slug = v.autor.toLowerCase().replace(/\s+/g,".");
      v.email = `${slug}@volunet.com`;
    }
  });

  list.innerHTML = voluntariados.map(itemHTML).join("");
}

// --- CRUD ---
async function handleSubmit(e) {
  e.preventDefault();
  const f = e.currentTarget;
  const usuario = verificarSesion();
  if (!usuario) return;

  const nuevo = {
    id: genId(),
    titulo: (f.titulo?.value||"").trim(),
    categoria: normCat(f.categoria?.value),
    type: f.tipo?.value || "oferta",
    email: (f.email?.value||"").trim(),
    descripcion: (f.descripcion?.value||"").trim(),
    resumen: (f.descripcion?.value||"").trim(),
    fecha: f.fecha?.value || todayISO(),
    autor: usuario.nombre
  };

  if (!nuevo.titulo || !nuevo.descripcion) {
    alert("Rellena título y descripción.");
    return;
  }

  await saveVoluntariado(nuevo);
  await drawList();
  f.reset();
}

async function handleListClick(e) {
  const btn = e.target.closest("[data-action='del']");
  if (!btn) return;

  const card = btn.closest("[data-id]");
  if (!card) return;

  const id = String(card.dataset.id); // ✅ asegurar string
  await deleteVoluntariado(id);
  await drawList();
}

// --- Init ---
document.addEventListener("DOMContentLoaded", async () => {
  const usuario = verificarSesion();
  if (!usuario) return;

  mostrarUsuarioActivo();
  await openDB();
  await precargarDatosIniciales(); // precarga solo si DB vacía
  await drawList();

  $("#formVol")?.addEventListener("submit", handleSubmit);
  $("#list")?.addEventListener("click", handleListClick);

  const fch = $("#fecha");
  if (fch && !fch.value) fch.value = todayISO();
});
