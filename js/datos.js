// js/datos.js
export const datos = {
  session: { currentUser: null },

  usuarios: [
    { id: 1, nombre: "Admin Demo", email: "admin@volunet.com", password: "123456", rol: "admin" },
    { id: 2, nombre: "Ana Pérez",  email: "ana@volunet.com",   password: "123456", rol: "user"  },
  ],

  categorias: ["Todas", "Idiomas", "Deportes", "Profesiones"],

  voluntariados: [
    // PETICIONES
    {
      id: 2001,
      type: "peticion",
      titulo: "Voluntario de Conversación en Inglés",
      autor: "María López",
      modalidad: "Online",
      categoria: "Idiomas",
      resumen: "Busco a alguien que quiera dedicar 1 hora a la semana para practicar conversación en inglés (nivel B1). Quiero mejorar la fluidez para entrevistas de trabajo.",
      fecha: "2025-11-25"
    },
    {
      id: 2002,
      type: "peticion",
      titulo: "Ayuda con Diseño Gráfico Básico",
      autor: "Sofía Martínez",
      modalidad: "Presencial",
      categoria: "Profesiones",
      resumen: "Necesito apoyo para crear un logo y una plantilla de folleto para una ONG local. Se requiere manejo básico de software de diseño.",
      fecha: "2025-12-10"
    },
    {
      id: 2003,
      type: "peticion",
      titulo: "Compañero para Entrenamientos de Baloncesto",
      autor: "Daniel Ruiz",
      modalidad: "Presencial",
      categoria: "Deportes",
      resumen: "Busco compañero/a para entrenar y jugar 2 veces por semana. Nivel intermedio. Objetivo: preparar una maratón local.",
      fecha: "2025-11-01"
    },
    {
      id: 2004,
      type: "peticion",
      titulo: "Clases de Apoyo de Matemáticas (ESO)",
      autor: "Laura Gómez",
      modalidad: "Online",
      categoria: "Profesiones",
      resumen: "Se busca apoyo voluntario de un profesor/estudiante de matemáticas para ESO, 2 tardes por semana, repaso de conceptos básicos.",
      fecha: "2025-11-15"
    },
    {
      id: 2005,
      type: "peticion",
      titulo: "Tutor de Japonés - Nivel Inicial",
      autor: "Paula Hernández",
      modalidad: "Online",
      categoria: "Idiomas",
      resumen: "Quiero aprender conceptos básicos (Hiragana, Katakana y saludos). Busco tutor voluntario 1 vez por semana.",
      fecha: "2025-12-20"
    },

    // OFERTAS
    {
      id: 2006,
      type: "oferta",
      titulo: "Tutorías de Español para Extranjeros",
      autor: "Javier Morales",
      modalidad: "Online",
      categoria: "Idiomas",
      resumen: "Ayudo a practicar y mejorar español conversacional o gramática. Experiencia previa. Disponible online o presencial.",
      fecha: "2025-11-01"
    },
    {
      id: 2007,
      type: "oferta",
      titulo: "Entrenador de Voleibol Femenino",
      autor: "Marta Sánchez",
      modalidad: "Presencial",
      categoria: "Deportes",
      resumen: "Entrenador voluntario para equipo amateur o grupo. 5 años como jugador y 2 como monitor.",
      fecha: "2025-11-10"
    },
    {
      id: 2008,
      type: "oferta",
      titulo: "Asesoría de CV y Entrevistas (IT)",
      autor: "Lucía Fernández",
      modalidad: "Online",
      categoria: "Profesiones",
      resumen: "Revisión de currículum/carta y simulación de entrevistas. Sesiones de 1 hora. Especialista en RRHH IT.",
      fecha: "2025-11-22"
    },
    {
      id: 2009,
      type: "oferta",
      titulo: "Clases de Natación para Principiantes",
      autor: "Sergio Pérez",
      modalidad: "Presencial",
      categoria: "Deportes",
      resumen: "Enseño conceptos básicos a niños o adultos. Solo fines de semana en piscina pública. Socorrista certificado.",
      fecha: "2025-12-05"
    },
    {
      id: 2010,
      type: "oferta",
      titulo: "Traducción Simple (Francés-Español)",
      autor: "Elena Navarro",
      modalidad: "Online",
      categoria: "Idiomas",
      resumen: "Traducciones voluntarias de textos cortos o corrección de documentos FR↔ES. Nivel C1 de francés.",
      fecha: "2025-11-29"
    }
  ]
};
