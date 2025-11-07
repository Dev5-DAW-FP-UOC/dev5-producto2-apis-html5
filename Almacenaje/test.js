import { inicializarUsuarios, saludar, altaUsuario, listarUsuarios, altaVoluntariado, listarVoluntariados, borrarVoluntariado, voluntariadosPorUsuario } from "./almacenaje.js";

inicializarUsuarios();

document.getElementById("btnSaludar").addEventListener("click", () => {
  saludar("Xavi");
});

document.getElementById("btnAdd").addEventListener("click", () => {
  const resultado = altaUsuario({
    nombre: "Ana",
    email: "ana@example.com",
    contraseña: "1234",
    rol: "usuario",
  });
  console.log(resultado ? "Usuario creado" : "Email ya existe");
});

document.getElementById("btnList").addEventListener("click", () => {
  const todos = listarUsuarios();
  console.log(todos);
});

// Añadir voluntariado de ejemplo
document.getElementById("btnAddVol").addEventListener("click", async () => {
  const v = {
    titulo: "Prueba de test",
    email: "test@correo.com",
    fecha: "2025-12-01",
    descripcion: "Voluntariado de prueba desde botón",
    tipo: "oferta",
  };
  const id = await altaVoluntariado(v);
  alert("Voluntariado añadido con id: " + id);
});

// Listar todos los voluntariados en consola
document.getElementById("btnListVol").addEventListener("click", async () => {
  const voluntariados = await listarVoluntariados();
  console.log("Todos los voluntariados:", voluntariados);
  alert(`Hay ${voluntariados.length} voluntariados. Revisa la consola.`);
});

// Borrar voluntariado por id (ejemplo: id = 1)
document.getElementById("btnDelVol").addEventListener("click", async () => {
  const ok = await borrarVoluntariado(1);
  alert(ok ? "Voluntariado id 1 borrado" : "No existía el voluntariado id 1");
});

// Listar voluntariados de un usuario (por email)
document.getElementById("btnListVolUsuario").addEventListener("click", async () => {
  const email = prompt("Introduce el email del usuario a filtrar:");
  if (!email) return;
  const lista = await voluntariadosPorUsuario(email);
  console.log(`Voluntariados para ${email}:`, lista);
  alert(`Hay ${lista.length} voluntariados para ${email}. Revisa la consola.`);
});
