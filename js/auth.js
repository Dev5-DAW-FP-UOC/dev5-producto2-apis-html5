// js/auth.js
import { obtenerUsuarioActivo, handleLogout } from './almacenaje.js';

export function checkLogin() {
    const usuario = obtenerUsuarioActivo();
    if (!usuario) {
        window.location.href = 'login.html';
        return null;
    }
    return usuario;
}

export function updateNavbar() {
    const usuario = obtenerUsuarioActivo();
    const userBadge = document.getElementById('userBadge');
    
    if (userBadge) {
        if (usuario) {
            userBadge.textContent = usuario.nombre;
        } else {
            userBadge.textContent = '-no login-';
        }
    }

    const navLinks = document.querySelectorAll('#nav .nav-link');
    const loginLink = Array.from(navLinks).find(link => link.href.includes('login.html'));

    if (usuario && loginLink) {
        loginLink.textContent = 'Cerrar Sesión';
        loginLink.href = '#';
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleLogout();
            window.location.href = 'login.html';
        });
    }
}