export const datos = {
 session: { currentUser: null },

 usuarios: [
  { id: 1, nombre: "Admin Demo", email: "admin@volunet.com", password: "123456", rol: "admin" },
  { id: 2, nombre: "Ana Pérez", email: "ana@volunet.com",  password: "123456", rol: "user" },
 ],

 categorias: ["Todas", "Idiomas", "Deportes", "Profesiones"],

 voluntariados: [
  // PETICIONES
  {
   id: 2001,
   tipo: "peticion", 
   titulo: "Voluntario de Conversación en Inglés",
   email: "maria.lopez@volunet.com", 
   categoria: "Idiomas",
   descripcion: "Busco a alguien que quiera dedicar 1 hora a la semana para practicar conversación en inglés (nivel B1). Quiero mejorar la fluidez para entrevistas de trabajo.", // CAMBIADO de 'resumen'
   fecha: "2025-11-25"
  },
  {
   id: 2002,
   tipo: "peticion",
   titulo: "Ayuda con Diseño Gráfico Básico",
   email: "sofia.martinez@volunet.com",
   categoria: "Profesiones",
   descripcion: "Necesito apoyo para crear un logo y una plantilla de folleto para una ONG local. Se requiere manejo básico de software de diseño.",
   fecha: "2025-12-10"
  },
  {
   id: 2003,
   tipo: "peticion",
   titulo: "Compañero para Entrenamientos de Baloncesto",
   email: "daniel.ruiz@volunet.com",
   categoria: "Deportes",
   descripcion: "Busco compañero/a para entrenar y jugar 2 veces por semana. Nivel intermedio. Objetivo: preparar una maratón local.",
   fecha: "2025-11-01"
  },
  {
   id: 2004,
   tipo: "peticion",
   titulo: "Clases de Apoyo de Matemáticas (ESO)",
   email: "laura.gomez@volunet.com",
   categoria: "Profesiones",
   descripcion: "Se busca apoyo voluntario de un profesor/estudiante de matemáticas para ESO, 2 tardes por semana, repaso de conceptos básicos.",
   fecha: "2025-11-15"
  },
  {
   id: 2005,
   tipo: "peticion",
   titulo: "Tutor de Japonés - Nivel Inicial",
   email: "paula.hernandez@volunet.com",
   categoria: "Idiomas",
   descripcion: "Quiero aprender conceptos básicos (Hiragana, Katakana y saludos). Busco tutor voluntario 1 vez por semana.",
   fecha: "2025-12-20"
  },
  // OFERTAS
  {
   id: 2006,
   tipo: "oferta",
   titulo: "Tutorías de Español para Extranjeros",
   email: "javier.morales@volunet.com",
   categoria: "Idiomas",
   descripcion: "Ayudo a practicar y mejorar español conversacional o gramática. Experiencia previa. Disponible online o presencial.",
   fecha: "2025-11-01"
  },
  {
   id: 2007,
   tipo: "oferta",
   titulo: "Entrenador de Voleibol Femenino",
   email: "marta.sanchez@volunet.com",
   categoria: "Deportes",
   descripcion: "Entrenador voluntario para equipo amateur o grupo. 5 años como jugador y 2 como monitor.",
   fecha: "2025-11-10"
  },
  {
   id: 2008,
   tipo: "oferta",
   titulo: "Asesoría de CV y Entrevistas (IT)",
   email: "lucia.fernandez@volunet.com",
   categoria: "Profesiones",
   descripcion: "Revisión de currículum/carta y simulación de entrevistas. Sesiones de 1 hora. Especialista en RRHH IT.",
   fecha: "2025-11-22"
  },
  {
   id: 2009,
   tipo: "oferta",
   titulo: "Clases de Natación para Principiantes",
   email: "sergio.perez@volunet.com",
   categoria: "Deportes",
   descripcion: "Enseño conceptos básicos a niños o adultos. Solo fines de semana en piscina pública. Socorrista certificado.",
   fecha: "2025-12-05"
  },
  {
   id: 2010,
   tipo: "oferta",
   titulo: "Traducción Simple (Francés-Español)",
   email: "elena.navarro@volunet.com",
   categoria: "Idiomas",
   descripcion: "Traducciones voluntarias de textos cortos o corrección de documentos FR↔ES. Nivel C1 de francés.",
   fecha: "2025-11-29"
  }
 ]
};