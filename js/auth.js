// js/auth.js
import * as almacenaje from "./almacenaje.js";

/**
 * Comprueba si hay un usuario activo.
 * Si no lo hay, redirige al login.
 * Devuelve el usuario si está logueado.
 */
export function verificarSesion() {
  const usuario = almacenaje.obtenerUsuarioActivo();
  if (!usuario) {
    // Evita mostrar alerta si ya estamos en login
    if (!window.location.pathname.includes("login.html")) {
      alert("Debes iniciar sesión primero.");
      window.location.href = "login.html";
    }
    return null;
  }
  return usuario;
}

/**
 * Muestra el nombre o correo del usuario activo en la navbar.
 */
export function mostrarUsuarioActivo() {
  const usuario = almacenaje.obtenerUsuarioActivo();
  let badge = document.querySelector("#userBadge");

  if (!badge) {
    const container = document.querySelector(".navbar .container, .navbar") || document.body;
    badge = document.createElement("span");
    badge.id = "userBadge";
    badge.className = "navbar-text small text-muted ms-2";
    container.appendChild(badge);
  }

  badge.textContent = usuario ? usuario.nombre || usuario.email : "-no login-";
}

/**
 * Cierre de sesión
 */
export function configurarCierreSesion() {
  const btn = document.querySelector("#logoutBtn");
  if (btn) {
    btn.addEventListener("click", () => {
      almacenaje.cerrarSesion();
      alert("Sesión cerrada correctamente.");
      window.location.href = "login.html";
    });
  }
}

/**
 * 🔹 Inicializa autenticación automáticamente al cargar cualquier página.
 * Comprueba si hay usuario y muestra su nombre.
 */
document.addEventListener("DOMContentLoaded", () => {
  const usuario = almacenaje.obtenerUsuarioActivo();
  const esLogin = window.location.pathname.includes("login.html");

  if (usuario) {
    mostrarUsuarioActivo();
    configurarCierreSesion();
  } else if (!esLogin) {
    // Si no hay usuario y no estamos en login → redirige
    alert("Debes iniciar sesión primero.");
    window.location.href = "login.html";
  }
});

