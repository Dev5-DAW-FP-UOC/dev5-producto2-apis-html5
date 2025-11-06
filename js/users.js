// js/users.js
import * as almacenaje from "./almacenaje.js";
import { datos } from "./datos.js";

const $ = (s, ctx = document) => ctx.querySelector(s);
const genId = () => "u" + Math.random().toString(36).slice(2) + Date.now().toString(36);

function showMsg(text, type="info"){
  const box = $("#msg");
  if (!box) return;
  box.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

// --- Cargar usuarios desde LocalStorage ---
function cargarUsuarios() {
  let usuarios = almacenaje.obtenerDeLocalStorage("usuarios") || [];

  // asegurar que cada usuario tenga id como string
  usuarios.forEach(u => { u.id = String(u.id ?? genId()); });

  return usuarios;
}

function guardarUsuarios(arr){
  almacenaje.guardarEnLocalStorage("usuarios", arr);
}

// --- Dibujar tabla ---
function drawTable(){
  const tbody = $("#tablaUsers tbody");
  const usuarios = cargarUsuarios();

  if (!usuarios.length){
    tbody.innerHTML = `<tr><td colspan="3" class="text-muted">No hay usuarios.</td></tr>`;
    return;
  }

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

  tbody.innerHTML = usuarios.map(u => `
    <tr data-id="${u.id}">
      <td>${u.nombre || "-"}</td>
      <td>${u.email}</td>
      <td class="text-end">${trashBtn}</td>
    </tr>
  `).join("");
}

// --- Crear nuevo usuario ---
function handleSubmit(e){
  e.preventDefault();
  const f = e.currentTarget;
  const usuarios = cargarUsuarios();

  const nuevo = {
    id: genId(),
    nombre:   f.nombre.value.trim(),
    email:    f.email.value.trim(),
    password: f.password.value,
    rol: "user",
  };

  if (!nuevo.nombre || !nuevo.email || !nuevo.password || nuevo.password.length < 6){
    showMsg("Completa nombre, email y contraseña (mín. 6).", "danger");
    return;
  }

  if (usuarios.some(u => u.email === nuevo.email)){
    showMsg("Ese email ya existe.", "warning");
    return;
  }

  usuarios.push(nuevo);
  guardarUsuarios(usuarios);
  drawTable();
  f.reset();
  showMsg("Usuario añadido correctamente.", "success");
}

// --- Eliminar usuario ---
function handleTableClick(e){
  const btn = e.target.closest("[data-action='del']");
  if (!btn) return;

  const tr = btn.closest("tr");
  const id = tr?.dataset.id;
  if (!id) return;

  let usuarios = cargarUsuarios();
  usuarios = usuarios.filter(u => String(u.id) !== id);
  guardarUsuarios(usuarios);
  drawTable();
  showMsg("Usuario eliminado.", "warning");
}

// --- Init ---
document.addEventListener("DOMContentLoaded", () => {
  drawTable();
  $("#formUser")?.addEventListener("submit", handleSubmit);
  $("#tablaUsers")?.addEventListener("click", handleTableClick);
});
