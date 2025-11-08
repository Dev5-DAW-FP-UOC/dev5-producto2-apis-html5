// js/users.js
import { addUser, getUsers, removeUser, getActiveUser } from './storage.js';

const $ = (s, ctx = document) => ctx.querySelector(s);

function showMsg(text, type = 'info') {
  const box = $('#msg');
  if (!box) return;
  box.innerHTML = `
    <div class="alert alert-${type} alert-dismissible fade show" role="alert">
      ${text}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>`;
}

function setNavbarUser(name) {
  let badge = $('#userBadge') || document.querySelector('.navbar-text');
  if (!badge) {
    const container = $('#nav') || document.querySelector('.navbar .container, .navbar');
    badge = document.createElement('span');
    badge.className = 'navbar-text small text-muted';
    badge.id = 'userBadge';
    container?.appendChild(badge);
  }
  badge.textContent = name || '-no login-';
}

function drawTable() {
  const tbody = $('#tablaUsers tbody');
  const arr = getUsers();

  if (!arr.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="text-muted">No hay usuarios.</td></tr>`;
    return;
  }

  tbody.innerHTML = arr.map(u => `
    <tr>
      <td>${u.nombre || ''}</td>
      <td>${u.email}</td>
      <td class="text-end">
        <button class="btn btn-outline-danger btn-sm" data-action="del" data-id="${u.id}">Borrar</button>
      </td>
    </tr>`).join('');
}

function wireTableActions() {
  const tbody = $('#tablaUsers tbody');
  tbody.addEventListener('click', (ev) => {
    const btn = ev.target.closest('button[data-action="del"]');
    if (!btn) return;
    const id = btn.getAttribute('data-id');
    const ok = confirm('¿Seguro que quieres borrar este usuario?');
    if (!ok) return;
    removeUser(id);
    drawTable();
    showMsg('Usuario eliminado', 'success');
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Badge de usuario activo
  const active = getActiveUser();
  setNavbarUser(active?.nombre);

  // Tabla + acciones
  drawTable();
  wireTableActions();

  // Form alta
  const form = $('#formUser');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const nombre = form.nombre.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value;

      try {
        addUser({ nombre, email, password });
        showMsg('Usuario creado correctamente', 'success');
        form.reset();
        document.getElementById('nombre')?.focus();
        drawTable();
      } catch (err) {
        showMsg(err.message || 'Error al crear el usuario', 'danger');
      }
    });
  }
});
