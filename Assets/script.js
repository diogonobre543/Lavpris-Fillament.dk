/**
 * BILLIGT FILAMENT - JAVASCRIPT ENGINE 2026
 * Engine Unificada: Menu, API, Filtros e Sorteio Aleatório com Preços em Vírgula.
 */

const API_URL = 'https://www.datamarked.dk/?id=8016&apikey=AA99444E55D533FA3C0FB91A991CCA2C465F7C2BE0C89C4826A1852957DE2959';
let allProducts = [];
let activeCategory = 'all';

const materialKeywords = ['PLA', 'PETG', 'SILK', 'ABS', 'TPU', 'ASA', 'NYLON', 'WOOD', 'CARBON'];
const printerKeywords = ['PRINTER', 'CREALITY', 'BAMBU', 'ANYCUBIC', 'ENDER', 'VORON', 'ELEGOO', 'MACHINE', 'RESIN'];

/**
 * 1. NAVEGAÇÃO & MENU MOBILE
 */
function initNavigation() {
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('main-nav');
    const body = document.body;
    if (!hamburger || !mainNav) return;

    hamburger.addEventListener('click', () => {
        const isOpen = hamburger.classList.toggle('open');
        mainNav.classList.toggle('active');
        if (isOpen) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = 'auto';
        }
    });

    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('open');
            mainNav.classList.remove('active');
            body.style.overflow = 'auto';
        });
    });
}

/**
 * 2. SORTEIO DOS CARDS DO TOPO (HERO)
 */
function renderHeroCards() {
    const printerContainer = document.getElementById('hero-random-printer');
    const materialContainer = document.getElementById('hero-random-material');
    if (!printerContainer || !materialContainer) return;

    const printers = allProducts.filter(p => p.category === 'PRINTER');
    const materials = allProducts.filter(p => p.category !== 'PRINTER' && p.category !== 'ANDRE');

    const randomP = printers[Math.floor(Math.random() * printers.length)];
    const randomM = materials[Math.floor(Math.random() * materials.length)];

    const createHeroCardHTML = (p) => `
        <div class="product-card" style="width: 220px; box-shadow: var(--shadow); pointer-events: auto;">
            <div class="img-wrapper" style="height: 160px; padding: 10px;">
                <img src="${p.img}" alt="${p.title}" style="max-height: 100%;">
            </div>
            <div class="product-info" style="padding: 10px;">
                <h3 style="font-size: 0.8rem; min-height: 2.2rem; margin-bottom: 5px;">${p.title}</h3>
                <div class="price" style="font-size: 1rem;">
                    ${p.price.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.
                </div>
                <a href="${p.link}" target="_blank" class="btn-buy" style="padding: 8px; font-size: 0.7rem; margin-top: 10px;">KØB NU</a>
            </div>
        </div>
    `;

    if (randomP) printerContainer.innerHTML = createHeroCardHTML(randomP);
    if (randomM) materialContainer.innerHTML = createHeroCardHTML(randomM);
}

/**
 * 3. ENGINE DE PRODUTOS
 */
async function initProducts() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Netværksfejl");
        const data = await res.json();
        
        allProducts = data.map(i => {
            const title = i.title.toUpperCase();
            let category = 'ANDRE';
            
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
        
        renderHeroCards();
        createMaterialButtons();
        render();
    } catch (e) {
        console.error("Fejl:", e);
        const grid = document.getElementById('productGrid');
        if (grid) grid.innerHTML = '<p>Kunne ikke hente produkter.</p>';
    }
}

function createMaterialButtons() {
    const container = document.getElementById('materialBoxes');
    if (!container) return;
    const existingCats = [...new Set(allProducts.map(p => p.category))];
    let html = `<button class="material-btn active" data-cat="all">Alle</button>
                <button class="material-btn" data-cat="PRINTER">3D Printere</button>`;
    existingCats.filter(c => c !== 'PRINTER' && c !== 'ANDRE').sort().forEach(cat => {
        html += `<button class="material-btn" data-cat="${cat}">${cat}</button>`;
    });
    html += `<button class="material-btn" data-cat="ANDRE">Andre</button>`;
    container.innerHTML = html;
}

function render() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

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

    grid.innerHTML = list.map(p => `
        <article class="product-card">
            <div class="img-wrapper">
                <img src="${p.img}" alt="${p.title}" loading="lazy" onerror="this.src='https://placehold.co/400x400?text=Billede+mangler'">
            </div>
            <div class="product-info">
                <span class="stock-tag" style="color:${p.stock > 0 ? '#10b981' : '#f43f5e'}">
                    ${p.stock > 0 ? '● PÅ LAGER' : '○ UDSOLGT'}
                </span>
                <h3>${p.title}</h3>
                <div class="price">
                    ${p.price.toLocaleString('da-DK', { minimumFractionDigits: 2 })} kr.
                </div>
                <a href="${p.link}" target="_blank" class="btn-buy">KØB NU</a>
            </div>
        </article>
    `).join('');
}

// 4. LISTENERS
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('material-btn')) {
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.cat;
        render();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initProducts();
    document.getElementById('searchField')?.addEventListener('input', render);
    document.getElementById('sortOrder')?.addEventListener('change', render);
});