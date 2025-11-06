// js/almacenaje.js
import { datos } from "./datos.js"; // Importamos usuarios por defecto

// --- Utilidades genéricas ---
export function guardarEnLocalStorage(clave, valor) {
  localStorage.setItem(clave, JSON.stringify(valor));
}

export function obtenerDeLocalStorage(clave) {
  const valor = localStorage.getItem(clave);
  return valor ? JSON.parse(valor) : null;
}

export function eliminarDeLocalStorage(clave) {
  localStorage.removeItem(clave);
}

// --- Gestión de usuario activo ---
export function loguearUsuario(email, password) {
  const usuarios = obtenerDeLocalStorage("usuarios") || [];
  const usuario = usuarios.find(u => u.email === email && u.password === password);
  if (!usuario) return null;

  guardarEnLocalStorage("usuarioActivo", usuario);
  return usuario;
}

export function obtenerUsuarioActivo() {
  return obtenerDeLocalStorage("usuarioActivo");
}

export function cerrarSesion() {
  eliminarDeLocalStorage("usuarioActivo");
}

// --- Inicialización de datos por defecto ---
// Usuarios: solo la primera vez
if (!localStorage.getItem("usuariosPrecargados")) {
  guardarEnLocalStorage("usuarios", datos.usuarios);
  localStorage.setItem("usuariosPrecargados", "true");
}