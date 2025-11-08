import { obtenerUsuarioActivo, handleLogout as logoutDesdeAlmacenaje } from './almacenaje.js';

export function checkLogin() {
    const user = obtenerUsuarioActivo();
    if (!user) {
        window.location.href = 'login.html';
    }
    return user;
}

export function updateNavbar() {
    const user = obtenerUsuarioActivo();
    const badge = document.getElementById('userBadge');
    if (!badge) return;

    const loginLink = document.querySelector('a[href="./login.html"]');
    
    if (user) {
        badge.textContent = user.nombre || user.email;
        
        if (loginLink) {
            loginLink.textContent = 'Cerrar Sesión';
            loginLink.href = '#';
            loginLink.addEventListener('click', (e) => {
                e.preventDefault();
                logoutDesdeAlmacenaje();
                window.location.href = 'login.html';
            });
        }
    } else {
        badge.textContent = '-no login-';
        if (loginLink) {
            loginLink.textContent = 'Login';
            loginLink.href = './login.html';
        }
    }
}