// js/login.js
import { datos } from "./datos.js";

const $ = (s, ctx = document) => ctx.querySelector(s);

function setNavbarUser(name){
  // Usa el badge si existe; si no, lo crea al vuelo
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

document.addEventListener("DOMContentLoaded", () => {
  const form = $("#loginForm");
  const msg  = $("#msg");
  $("#email")?.focus();

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = form.email.value.trim();
    const password = form.password.value.trim();

    if (!email || !password) {
      msg.innerHTML = `<div class="alert alert-danger">Introduce email y contraseña.</div>`;
      return;
    }

    const user = (datos.usuarios || []).find(u =>
      u.email === email && u.password === password
    );

    if (!user) {
      msg.innerHTML = `<div class="alert alert-danger">Credenciales no válidas.</div>`;
      return;
    }

    // Sesión SOLO en memoria (P1)
    datos.session = datos.session || {};
    datos.session.currentUser = {
      id: user.id,
      email: user.email,
      nombre: user.nombre || user.email,
      rol: user.rol || "usuario",
    };

    // ✅ Ventanilla nativa 
    alert("Inicio de sesión exitoso");

    // Pinta el nombre en la navbar de ESTA página
    setNavbarUser(datos.session.currentUser.nombre);
    
    form.reset();
  });
});
