import { loguearUsuario, init } from './almacenaje.js';

document.addEventListener('DOMContentLoaded', () => {
    init();

    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const msgDiv = document.getElementById('msg');

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault(); 
        msgDiv.innerHTML = ''; 

        const email = emailInput.value;
        const password = passwordInput.value;
        
        const usuario = loguearUsuario(email, password);

        if (usuario) {
            window.location.href = 'dashboard.html';
        } else {
            msgDiv.innerHTML = '<div class="alert alert-danger">Credenciales no válidas.</div>';
        }
    });
});