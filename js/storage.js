// js/storage.js
// Persistencia con LocalStorage (sin backend).

const LS_USERS_KEY = 'volunet:users';
const LS_ACTIVE_KEY = 'volunet:active_email';

// Helpers
const genId = () => 'u_' + Math.random().toString(36).slice(2) + Date.now().toString(36);

const readJSON = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

// Inicializa estructura si falta
function ensureInit() {
  const users = readJSON(LS_USERS_KEY, null);
  if (!users) writeJSON(LS_USERS_KEY, []);
}
ensureInit();

// API pública
export function getUsers() {
  return readJSON(LS_USERS_KEY, []);
}

export function saveUsers(users) {
  writeJSON(LS_USERS_KEY, Array.isArray(users) ? users : []);
}

export function addUser({ nombre, email, password }) {
  const users = getUsers();
  const emailNorm = String(email || '').trim().toLowerCase();
  if (!emailNorm) throw new Error('El email es obligatorio');
  if (!password || String(password).length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres');
  }
  if (users.some(u => u.email.toLowerCase() === emailNorm)) {
    throw new Error('Ya existe un usuario con ese email');
  }
  const user = {
    id: genId(),
    nombre: (nombre || emailNorm).trim(),
    email: emailNorm,
    password: String(password),
    role: 'user',
    createdAt: Date.now()
  };
  users.push(user);
  saveUsers(users);
  return user;
}

export function removeUser(id) {
  const users = getUsers();
  const idx = users.findIndex(u => u.id === id);
  if (idx === -1) return false;
  const removed = users.splice(idx, 1)[0];
  saveUsers(users);
  // si borras al activo, cierra sesión
  const active = getActiveUser();
  if (active && active.email === removed.email) logout();
  return true;
}

export function findUserByEmail(email) {
  const emailNorm = String(email || '').trim().toLowerCase();
  return getUsers().find(u => u.email.toLowerCase() === emailNorm) || null;
}

export function login(email, password) {
  const user = findUserByEmail(email);
  if (!user || user.password !== String(password)) {
    throw new Error('Credenciales inválidas');
  }
  localStorage.setItem(LS_ACTIVE_KEY, user.email);
  return user;
}

export function getActiveUser() {
  const email = localStorage.getItem(LS_ACTIVE_KEY);
  if (!email) return null;
  return findUserByEmail(email);
}

export function logout() {
  localStorage.removeItem(LS_ACTIVE_KEY);
}
