import { datos } from './datos.js';

const DB_NAME = 'VolunetDB_P2';
const DB_VERSION = 1;
const STORE_VOLUNTARIOS = 'voluntariados';

const LS_USUARIOS_KEY = 'volunet_usuarios_p2';
const LS_USUARIO_ACTIVO_KEY = 'volunet_usuario_activo_p2';

function openDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_VOLUNTARIOS)) {
                const store = db.createObjectStore(STORE_VOLUNTARIOS, { keyPath: 'id', autoIncrement: true });
                store.createIndex('tipo_idx', 'tipo', { unique: false });
                
                datos.voluntariados.forEach(v => {
                    store.add(v);
                });
            }
        };
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Error al abrir IndexedDB: ' + event.target.errorCode);
    });
}

async function getDB() {
    try {
        const db = await openDB();
        return db;
    } catch (error) {
        console.error(error);
        return null;
    }
}

function initDB_Usuarios() {
    if (!localStorage.getItem(LS_USUARIOS_KEY)) {
        localStorage.setItem(LS_USUARIOS_KEY, JSON.stringify(datos.usuarios));
    }
}

export function getUsuarios() {
    const usuarios = localStorage.getItem(LS_USUARIOS_KEY);
    return usuarios ? JSON.parse(usuarios) : [];
}

function _saveUsuarios(usuarios) {
    localStorage.setItem(LS_USUARIOS_KEY, JSON.stringify(usuarios));
}

export function addUsuario(nuevoUsuario) {
    const usuarios = getUsuarios();
    
    const existe = usuarios.some(u => u.email === nuevoUsuario.email);
    if (existe) {
        console.warn('Ya existe un usuario con ese email');
        return;
    }

    nuevoUsuario.id = Date.now();
    usuarios.push(nuevoUsuario);
    _saveUsuarios(usuarios);
    return nuevoUsuario;
}

export function deleteUsuario(id) {
    let usuarios = getUsuarios();
    usuarios = usuarios.filter(u => u.id !== id);
    _saveUsuarios(usuarios);
}

export function loguearUsuario(email, password) {
    const usuarios = getUsuarios();
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    if (usuario) {
        localStorage.setItem(LS_USUARIO_ACTIVO_KEY, JSON.stringify(usuario));
        return usuario;
    }
    return null;
}

export function obtenerUsuarioActivo() {
    const usuario = localStorage.getItem(LS_USUARIO_ACTIVO_KEY);
    return usuario ? JSON.parse(usuario) : null;
}

export function handleLogout() {
    localStorage.removeItem(LS_USUARIO_ACTIVO_KEY);
}

export async function getVoluntariados() {
    const db = await getDB();
    if (!db) return [];

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_VOLUNTARIOS, 'readonly');
        const store = transaction.objectStore(STORE_VOLUNTARIOS);
        const request = store.getAll();

        request.onsuccess = () => resolve(request.result);
        request.onerror = (event) => reject('Error al leer voluntariados: ' + event.target.errorCode);
    });
}

export async function addVoluntariado(voluntariado) {
    const db = await getDB();
    if (!db) return;
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_VOLUNTARIOS, 'readwrite');
        const store = transaction.objectStore(STORE_VOLUNTARIOS);
        const request = store.add(voluntariado);

        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject('Error al añadir voluntariado: ' + event.target.errorCode);
    });
}

export async function deleteVoluntariado(id) {
    const db = await getDB();
    if (!db) return;

    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_VOLUNTARIOS, 'readwrite');
        const store = transaction.objectStore(STORE_VOLUNTARIOS);
        const request = store.delete(id);

        request.onsuccess = () => resolve(true);
        request.onerror = (event) => reject('Error al borrar voluntariado: ' + event.target.errorCode);
    });
}

export function init() {
    initDB_Usuarios();
    getDB();
}