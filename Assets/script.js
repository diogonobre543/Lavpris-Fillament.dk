/**
 * BILLIGT FILAMENT - JAVASCRIPT ENGINE 2026
 * Funções: Filtros de API, Busca em tempo real e Controle de Menu Mobile.
 */

const API_URL = 'https://www.datamarked.dk/?id=8016&apikey=AA99444E55D533FA3C0FB91A991CCA2C465F7C2BE0C89C4826A1852957DE2959';
let allProducts = [];
let activeCategory = 'all';

// Configurações de Identificação
const materialKeywords = ['PLA', 'PETG', 'SILK', 'ABS', 'TPU', 'ASA', 'NYLON', 'WOOD', 'CARBON'];
const printerKeywords = ['PRINTER', 'CREALITY', 'BAMBU', 'ANYCUBIC', 'ENDER', 'VORON', 'ELEGOO', 'MACHINE', 'RESIN'];

/**
 * 1. NAVEGAÇÃO & MENU MOBILE
 * Resolve o erro de deslize lateral e organiza a abertura do menu.
 */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;

    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mainNav.classList.toggle('active');

        // CORREÇÃO CRÍTICA: Trava o scroll e evita que a página deslize para os lados
        if (isOpen) {
            body.style.overflow = 'hidden';
            body.style.height = '100vh';
        } else {
            body.style.overflow = 'auto';
            body.style.height = 'auto';
        }
    });

    // Fecha o menu ao clicar em qualquer link (importante para SPAs ou âncoras)
    const navLinks = document.querySelectorAll('.main-nav a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mainNav.classList.remove('active');
            body.style.overflow = 'auto';
        });
    });
}

/**
 * 2. ENGINE DE PRODUTOS
 */
async function initProducts() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Netværksfejl");
        const data = await res.json();
        
        allProducts = data.map(i => {
            const title = i.title.toUpperCase();
            let category = 'ANDRE';
            
            // Identifica se é impressora ou material
            const isPrinter = printerKeywords.some(k => title.includes(k));
            if (isPrinter) {
                category = 'PRINTER';
            } else {
                const foundMat = materialKeywords.find(m => title.includes(m));
                category = foundMat || 'ANDRE';
            }
            
            return {
                title: i.title,
                price: parseFloat(String(i.price).replace(',', '.')),
                img: i.image,
                link: i.link,
                stock: parseInt(i.stock) || 0,
                category: category
            };
        });
        
        createMaterialButtons();
        render();
    } catch (e) {
        console.error("Fejl:", e);
        const grid = document.getElementById('productGrid');
        if (grid) grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:40px;">Kunne ikke hente produkter. Prøv igen senere.</p>';
    }
}

function createMaterialButtons() {
    const container = document.getElementById('materialBoxes');
    if (!container) return;

    const existingCats = [...new Set(allProducts.map(p => p.category))];
    
    let html = `
        <button class="material-btn active" data-cat="all">Alle</button>
        <button class="material-btn" data-cat="PRINTER">3D Printere</button>
    `;
    
    const sortedMaterials = existingCats.filter(c => c !== 'PRINTER' && c !== 'ANDRE').sort();
    sortedMaterials.forEach(cat => {
        html += `<button class="material-btn" data-cat="${cat}">${cat}</button>`;
    });
    
    html += `<button class="material-btn" data-cat="ANDRE">Andre</button>`;
    container.innerHTML = html;
}

function render() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    // Detecta se estamos na Home para limitar os itens
    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname === '';
    const search = document.getElementById('searchField')?.value.toLowerCase() || '';
    const sort = document.getElementById('sortOrder')?.value || 'default';

    let list = allProducts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search);
        const matchesCat = activeCategory === 'all' || p.category === activeCategory;
        return matchesSearch && matchesCat;
    });

    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    
    if (isHome && search === '' && activeCategory === 'all') {
        list = list.slice(0, 8);
    }

    if (list.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:50px;">Ingen produkter fundet.</p>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <article class="product-card">
            <div class="img-wrapper">
                <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.src='https://placehold.co/400x400?text=Billede+mangler'">
            </div>
            <div class="product-info">
                <span style="font-size:0.7rem; font-weight:800; color:${p.stock > 0 ? '#10b981' : '#f43f5e'}">
                    ${p.stock > 0 ? '● PÅ LAGER' : '○ UDSOLGT'}
                </span>
                <h3>${p.title}</h3>
                <div class="price">${p.price.toFixed(2)} kr.</div>
                <a href="${p.link}" target="_blank" class="btn-buy">KØB NU</a>
            </div>
        </article>
    `).join('');
}

/**
 * 3. EVENT LISTENERS
 */
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('material-btn')) {
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.cat;
        render();
    }
});

// Inicialização Global
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initProducts();
    
    document.getElementById('searchField')?.addEventListener('input', render);
    document.getElementById('sortOrder')?.addEventListener('change', render);
});