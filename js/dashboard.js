import { obtenerUsuarioActivo, handleLogout, getVoluntariados } from './almacenaje.js';

function setNavbarUser(user) {
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
                handleLogout();
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

async function renderDashboard() {
    const appContainer = document.getElementById('app');
    if (!appContainer) return;

    const voluntariados = await getVoluntariados();
    
    let cardsHTML = '';
    if (voluntariados && voluntariados.length > 0) {
        cardsHTML = voluntariados.map(item => {
            const badgeClass = item.tipo === 'oferta' ? 'text-bg-success' : 'text-bg-primary';
            
            return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card h-100 shadow-sm rounded-4">
                    <div class="card-body">
                        <span class="badge ${badgeClass} mb-2">${item.tipo}</span>
                        <h5 class="card-title">${item.titulo}</h5>
                        <p class="card-text text-muted small">${item.categoria}</p>
                        <p class="card-text">${item.descripcion}</p>
                    </div>
                    <div class="card-footer bg-white border-top-0 text-muted small">
                        Contacto: ${item.email}
                        <br>
                        Fecha: ${item.fecha}
                    </div>
                </div>
            </div>`;
        }).join('');
    } else {
        cardsHTML = '<p class="text-muted">No hay voluntariados disponibles.</p>';
    }

    appContainer.innerHTML = `
        <div class="d-flex justify-content-between align-items-center mb-3">
             <h1 class="h3 mb-0">Dashboard</h1>
        </div>
        <div class="row">
            ${cardsHTML}
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', async () => {
    const user = obtenerUsuarioActivo();
    if (!user) {
        window.location.href = 'login.html';
        return;
    }

    setNavbarUser(user);

    await renderDashboard();
});