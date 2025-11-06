// js/login.js
import * as almacenaje from "./almacenaje.js";

const $ = (s, ctx = document) => ctx.querySelector(s);

function setNavbarUser(name) {
  let badge = $("#userBadge") || document.querySelector(".navbar-text");
  if (!badge) {
    const container = $("#nav") || document.querySelector(".navbar .container, .navbar");
    badge = document.createElement("span");
    badge.className = "navbar-text small text-muted";
    badge.id = "userBadge";
    badge.textContent = name || "-no login-";
    container?.appendChild(badge);
    return;
  }
  badge.textContent = name || "-no login-";
}

// ✅ Mostrar usuario activo al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  const form = $("#loginForm");
  const msg  = $("#msg");
  const usuarioActivo = almacenaje.obtenerUsuarioActivo();

  // Mostrar usuario activo o "-no login-"
  setNavbarUser(usuarioActivo?.nombre);

  if (!form) return;
  $("#email")?.focus();

  // ✅ Evento de login
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      msg.innerHTML = `<div class="alert alert-danger">Introduce email y contraseña.</div>`;
      return;
    }

    const usuario = almacenaje.loguearUsuario(email, password);

    if (!usuario) {
      msg.innerHTML = `<div class="alert alert-danger">Credenciales no válidas.</div>`;
      return;
    }

    alert(`Inicio de sesión exitoso. Bienvenido/a ${usuario.nombre}`);
    setNavbarUser(usuario.nombre);
    form.reset();
  });
});
