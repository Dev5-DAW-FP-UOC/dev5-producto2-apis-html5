// js/dashboard.js (Actualizado a P2)
import { init, getVoluntariados } from './almacenaje.js';
import { checkLogin, updateNavbar } from './auth.js';
import { datos } from './datos.js'; 

let allVoluntariados = []; 

document.addEventListener('DOMContentLoaded', () => {
    init(); 
    
    const usuario = checkLogin(); 
    if (!usuario) return; 

    updateNavbar(); 
    renderLayoutAndCards(); 
});

async function renderLayoutAndCards() {
    const app = document.getElementById('app');
    if (!app) return;

    const filterButtonsHTML = datos.categorias.map(cat => 
        `<button class="btn btn-sm ${cat === 'Todas' ? 'btn-primary' : 'btn-outline-secondary'}" data-categoria="${cat}">${cat}</button>`
    ).join('');

    app.innerHTML = `
        <h1 class="h3 mb-4">Dashboard de Voluntariado</h1>
        
        <div class="mb-3">
            <input type="search" id="searchBar" class="form-control" placeholder="Buscar por título, descripción...">
        </div>
        
        <div class="d-flex flex-wrap gap-2 mb-4" id="filterContainer">
            ${filterButtonsHTML}
        </div>
        
        <div class="row" id="card-container">
            <p>Cargando voluntariados...</p>
        </div>

        <div id="drop-zone-container" class="mt-5">
            <h2 class="h4">Mi Selección (Drag & Drop)</h2>
            <div id="drop-zone" class="p-4 bg-white border-dashed rounded mt-3" style="--bs-border-style: dashed; min-height: 150px;">
                 <p class="text-center text-muted" id="drop-zone-placeholder">Arrastra aquí tus voluntariados seleccionados</p>
            </div>
        </div>
    `;

    allVoluntariados = await getVoluntariados();
    
    renderCards(allVoluntariados);

    document.getElementById('searchBar').addEventListener('input', handleFilter);
    document.getElementById('filterContainer').addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            document.querySelectorAll('#filterContainer button').forEach(btn => btn.classList.remove('btn-primary', 'btn-outline-secondary'));
            document.querySelectorAll('#filterContainer button').forEach(btn => {
                if (btn === e.target) {
                    btn.classList.add('btn-primary');
                } else {
                    btn.classList.add('btn-outline-secondary');
                }
            });
            handleFilter();
        }
    });
}

function renderCards(voluntariados) {
    const container = document.getElementById('card-container');
    if (!container) return;

    if (voluntariados.length === 0) {
        container.innerHTML = '<p class="text-muted">No se han encontrado voluntariados.</p>';
        return;
    }

    container.innerHTML = voluntariados.map(item => {
        const badgeClass = item.tipo === 'oferta' ? 'text-bg-success' : 'text-bg-primary';
        
        return `
            <div class="col-md-6 col-lg-4 mb-4">
                <div class="card shadow-sm h-100" draggable="true" data-id="${item.id}">
                    <div class="card-header d-flex justify-content-between">
                        <h5 class="card-title mb-0" style="font-size: 1.1rem;">${item.titulo}</h5>
                        <span class="badge ${badgeClass} rounded-pill">${item.tipo}</span>
                    </div>
                    <div class="card-body">
                        <p class="card-text">${item.descripcion}</p>
                    </div>
                    <div class="card-footer text-muted small">
                        Publicado por: ${item.email}<br>
                        Categoría: ${item.categoria} · Fecha: ${item.fecha}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function handleFilter() {
    const searchTerm = document.getElementById('searchBar').value.toLowerCase();
    const activeCategory = document.querySelector('#filterContainer button.btn-primary')?.dataset.categoria || 'Todas';

    const filtered = allVoluntariados.filter(item => {
        const matchesSearch = item.titulo.toLowerCase().includes(searchTerm) || 
                              item.descripcion.toLowerCase().includes(searchTerm);
        
        const matchesCategory = (activeCategory === 'Todas') || (item.categoria === activeCategory);

        return matchesSearch && matchesCategory;
    });

    renderCards(filtered);
}