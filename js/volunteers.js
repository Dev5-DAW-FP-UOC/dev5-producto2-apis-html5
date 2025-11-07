// js/volunteers.js
// Persistencia con IndexedDB + gráfico Canvas + UI

import { datos } from "./datos.js"; // deja este import si usas datos iniciales
import { getActiveUser } from "./storage.js";

const $ = (s, ctx = document) => ctx.querySelector(s);
const todayISO = () => new Date().toISOString().slice(0, 10);

// ---------------- IndexedDB helpers ----------------
const DB_NAME = "volunet_db";
const STORE = "volunteers";
let dbRef = null;

function openDB() {
  return new Promise((resolve, reject) => {
    // Subimos a v2 para crear el store con autoIncrement
    const req = indexedDB.open(DB_NAME, 2);

    req.onupgradeneeded = () => {
      const db = req.result;
      // Si existía el store de versiones previas, lo recreamos
      if (db.objectStoreNames.contains(STORE)) db.deleteObjectStore(STORE);
      const os = db.createObjectStore(STORE, {
        keyPath: "id",
        autoIncrement: true,
      });
      os.createIndex("type", "type", { unique: false });
      os.createIndex("fecha", "fecha", { unique: false });
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function withStore(mode, fn) {
  return new Promise(async (res, rej) => {
    try {
      if (!dbRef) dbRef = await openDB();
      const tx = dbRef.transaction(STORE, mode);
      const store = tx.objectStore(STORE);
      const out = await fn(store);
      tx.oncomplete = () => res(out);
      tx.onerror = () => rej(tx.error);
    } catch (err) {
      rej(err);
    }
  });
}

function dbGetAll() {
  return withStore(
    "readonly",
    (store) =>
      new Promise((resolve, reject) => {
        const items = [];
        const req = store.openCursor();
        req.onsuccess = (e) => {
          const cur = e.target.result;
          if (cur) {
            items.push(cur.value);
            cur.continue();
          } else resolve(items);
        };
        req.onerror = () => reject(req.error);
      })
  );
}
function dbPut(item) {
  return withStore("readwrite", (s) => s.put(item));
}
function dbDelete(id) {
  return withStore("readwrite", (s) => s.delete(id));
}
function dbBulkPut(arr) {
  return withStore("readwrite", (s) => Promise.all(arr.map((v) => s.put(v))));
}

// ---------------- UI helpers ----------------
function shortLabel(str, max = 18) {
  const s = String(str || "");
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}

function setNavbarUser(name) {
  let badge = $("#userBadge") || document.querySelector(".navbar-text");
  if (!badge) {
    const container =
      $("#nav") || document.querySelector(".navbar .container, .navbar");
    badge = document.createElement("span");
    badge.className = "navbar-text small text-muted";
    badge.id = "userBadge";
    container?.appendChild(badge);
  }
  badge.textContent = name || "-no login-";
}
function fmtFecha(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return (
    String(d.getDate()).padStart(2, "0") +
    "/" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "/" +
    d.getFullYear()
  );
}
function normCat(c) {
  const v = String(c || "").toLowerCase();
  if (v.startsWith("idio")) return "Idiomas";
  if (v.startsWith("depo")) return "Deportes";
  if (v.startsWith("prof")) return "Profesiones";
  return "Idiomas";
}

function itemHTML(v) {
  const cat = normCat(v.categoria);
  const typeBadge = String(v.type).toLowerCase().includes("pet")
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
          <div class="text-muted small mb-2">
  ${cat}${v.creadoPor ? " · Creado por: " + v.creadoPor : ""}
</div>

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

// ---------- Estado en memoria (refleja IndexedDB) ----------
const state = { vols: [] };

// ---------- Render listado + contador + gráfico ----------
function drawList() {
  const list = $("#list");
  if (!list) return;

  if (!state.vols.length) {
    list.innerHTML = `<div class="text-muted">No hay registros.</div>`;
    document
      .getElementById("countVol")
      ?.replaceChildren(document.createTextNode("0 ítem(s)"));
    drawCanvasChart();
    return;
  }

  list.innerHTML = state.vols.map(itemHTML).join("");
  document
    .getElementById("countVol")
    ?.replaceChildren(document.createTextNode(`${state.vols.length} ítem(s)`));

  drawCanvasChart(); // actualizar gráfico siempre
}

async function handleSubmit(e) {
  e.preventDefault();
  const f = e.currentTarget;

  const nuevo = {
    // id: (NO poner, lo genera IndexedDB)
    titulo: (f.titulo?.value || "").trim(),
    categoria: normCat(f.categoria?.value),
    type: (f.tipo?.value || "oferta").toLowerCase(),
    email: (f.email?.value || "").trim(),
    descripcion: (f.descripcion?.value || "").trim(),
    resumen: (f.descripcion?.value || "").trim(),
    fecha: f.fecha?.value || todayISO(),
    creadoPor: active?.nombre || "Anónimo",
  };

  if (!nuevo.titulo || !nuevo.descripcion) {
    alert("Rellena título y descripción.");
    return;
  }

  await dbPut(nuevo);
  await loadFromDB(); // refresca state.vols
  drawList();

  f.reset();
  const ff = $("#fecha");
  if (ff) ff.value = todayISO();
}

async function handleListClick(e) {
  const btn = e.target.closest("[data-action='del']");
  if (!btn) return;
  const card = btn.closest("[data-id]");
  const idStr = card?.dataset.id;
  if (!idStr) return;

  const id = Number(idStr); // id numérico (autoIncrement)
  await dbDelete(id);
  await loadFromDB();
  drawList();
}

// ---------- Carga inicial + seed opcional desde datos.js ----------
async function loadFromDB() {
  state.vols = await dbGetAll();
  // Seed una sola vez si BD vacía y hay datos en datos.js
  if (
    !state.vols.length &&
    datos &&
    Array.isArray(datos.voluntariados) &&
    datos.voluntariados.length
  ) {
    const seed = datos.voluntariados.map((v) => ({
      // id: (NO poner)
      titulo: (v.titulo || "").trim(),
      categoria: normCat(v.categoria),
      type: String(v.type || v.tipo || "oferta").toLowerCase(),
      email: (v.email || "").trim(),
      descripcion: (v.descripcion || v.resumen || "").trim(),
      resumen: (v.descripcion || v.resumen || "").trim(),
      fecha: v.fecha || todayISO(),
    }));
    await dbBulkPut(seed);
    state.vols = await dbGetAll();
  }
}

// ---------- Canvas ----------
function countByType(arr) {
  // cuenta TODO (existentes + nuevos), sin filtrar por usuario
  const c = { oferta: 0, peticion: 0 };
  (arr || []).forEach((v) => {
    const t = String(v.type || v.tipo || "oferta").toLowerCase();
    if (t.includes("pet")) c.peticion++;
    else c.oferta++;
  });
  return c;
}

function drawCanvasChart() {
  const canvas = document.getElementById('chartVol');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Escalado HiDPI
  const dpr = window.devicePixelRatio || 1;
  const cssW = canvas.clientWidth || canvas.width;
  const cssH = canvas.clientHeight || canvas.height;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Datos
  const c = countByType(state.vols || []);
  const values = [c.oferta, c.peticion];

  // Usuario activo (solo nombre)
  const active = getActiveUser?.();
  const userName = active?.nombre ? active.nombre : "Usuario";

  // Layout compacto
  const padX = 20, padTop = 18, padBottom = 28;
  const W = cssW, H = cssH;
  ctx.clearRect(0, 0, W, H);
  ctx.font = '11px system-ui, -apple-system, Segoe UI, Roboto, Arial';
  ctx.textBaseline = 'middle';

  const max = Math.max(1, ...values);
  const baseY = H - padBottom;
  const scale = (H - padTop - padBottom) / max;

  const gap = 16; // separación entre barras
  const barW = Math.min(56, (W - padX * 2 - gap) / 2);
  const totalBarsWidth = barW * 2 + gap;
  const startX = padX + (W - padX * 2 - totalBarsWidth) / 2;

  // Eje X
  ctx.strokeStyle = '#aaa';
  ctx.beginPath();
  ctx.moveTo(padX, baseY + 0.5);
  ctx.lineTo(W - padX, baseY + 0.5);
  ctx.stroke();

  // Dibujar barras (mismo usuario en ambas)
  const labels = [userName, userName];
  labels.forEach((label, i) => {
    const x = startX + i * (barW + gap);
    const val = values[i];
    const h = Math.max(0, val * scale);
    const y = baseY - h;

    ctx.fillStyle = i === 0 ? '#0d6efd' : '#ffc107';
    ctx.fillRect(x, y, barW, h);

    // Valor arriba
    const labelY = Math.max(padTop + 6, y - 8);
    ctx.fillStyle = '#111';
    ctx.textAlign = 'center';
    ctx.fillText(String(val), x + barW / 2, labelY);

    // Nombre debajo
    ctx.fillStyle = '#555';
    ctx.fillText(label, x + barW / 2, baseY + 12);
  });
}


// ---------- Boot ----------
document.addEventListener("DOMContentLoaded", async () => {
  // usuario activo en navbar
  const active = getActiveUser();
  setNavbarUser(active?.nombre);

  // Prefill email y fecha por defecto
  const form = document.getElementById("formVol");
  if (form && active?.email) {
    const emailInput = form.querySelector('input[name="email"], #email');
    if (emailInput && !emailInput.value) emailInput.value = active.email;
  }
  const fch = $("#fecha");
  if (fch && !fch.value) fch.value = todayISO();

  await loadFromDB();
  drawList();

  $("#formVol")?.addEventListener("submit", (e) => {
    handleSubmit(e);
  });
  $("#list")?.addEventListener("click", (e) => {
    handleListClick(e);
  });

  // Redibuja el canvas al redimensionar
  window.addEventListener("resize", () => drawCanvasChart());
});
