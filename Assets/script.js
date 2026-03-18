/**
 * BILLIGT FILAMENT - JAVASCRIPT ENGINE 2026
 * Fornece: Filtros de categorias, deteção de impressoras e busca em tempo real.
 */

const API_URL = 'https://www.datamarked.dk/?id=8016&apikey=AA99444E55D533FA3C0FB91A991CCA2C465F7C2BE0C89C4826A1852957DE2959';
let allProducts = [];
let activeCategory = 'all';

// Keywords para identificar materiais e máquinas
const materialKeywords = ['PLA', 'PETG', 'SILK', 'ABS', 'TPU', 'ASA', 'NYLON', 'WOOD', 'CARBON'];
const printerKeywords = ['PRINTER', 'CREALITY', 'BAMBU', 'ANYCUBIC', 'ENDER', 'VORON', 'ELEGOO', 'MACHINE', 'RESIN'];

async function init() {
    try {
        const res = await fetch(API_URL);
        if (!res.ok) throw new Error("Netværksfejl");
        const data = await res.json();
        
        allProducts = data.map(i => {
            const title = i.title.toUpperCase();
            let category = 'ANDRE';
            
            // 1. Verificar se é uma Impressora (Prioridade)
            const isPrinter = printerKeywords.some(k => title.includes(k));
            
            if (isPrinter) {
                category = 'PRINTER';
            } else {
                // 2. Procurar material específico
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
        if (grid) grid.innerHTML = '<p style="grid-column:1/-1; text-align:center;">Kunne ikke hente produkter. Prøv igen senere.</p>';
    }
}

/**
 * Cria os botões de filtro. 
 * O botão "Alle" e "3D Printere" são forçados a aparecer primeiro.
 */
function createMaterialButtons() {
    const container = document.getElementById('materialBoxes');
    if (!container) return;

    // Obtém categorias únicas da API (exceto as que vamos forçar)
    const existingCats = [...new Set(allProducts.map(p => p.category))];
    
    // Início dos botões (Forçados)
    let html = `
        <button class="material-btn active" data-cat="all">Alle</button>
        <button class="material-btn" data-cat="PRINTER">3D Printere</button>
    `;
    
    // Adicionar materiais dinamicamente (PLA, PETG, etc.)
    const sortedMaterials = existingCats.filter(c => c !== 'PRINTER' && c !== 'ANDRE').sort();
    sortedMaterials.forEach(cat => {
        html += `<button class="material-btn" data-cat="${cat}">${cat}</button>`;
    });
    
    // Botão final
    html += `<button class="material-btn" data-cat="ANDRE">Andre</button>`;
    
    container.innerHTML = html;
}

/**
 * Renderiza os cards de produto no grid
 */
function render() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    const search = document.getElementById('searchField')?.value.toLowerCase() || '';
    const sort = document.getElementById('sortOrder')?.value || 'default';

    // 1. Filtro por Categoria e Busca
    let list = allProducts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(search);
        const matchesCat = activeCategory === 'all' || p.category === activeCategory;
        return matchesSearch && matchesCat;
    });

    // 2. Ordenação por Preço
    if (sort === 'low') list.sort((a, b) => a.price - b.price);
    if (sort === 'high') list.sort((a, b) => b.price - a.price);
    
    // 3. Limite para a Home
    if (isHome && search === '' && activeCategory === 'all') {
        list = list.slice(0, 8);
    }

    // 4. Injeção do HTML
    if (list.length === 0) {
        grid.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:50px;">Ingen produkter fundet i denne kategori.</p>';
        return;
    }

    grid.innerHTML = list.map(p => `
        <article class="product-card">
            <div class="img-wrapper">
                <img src="${p.img}" alt="${p.title}" onerror="this.src='https://placehold.co/400x400?text=Billede+mangler'">
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

// Interações de Clique
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('material-btn')) {
        document.querySelectorAll('.material-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        activeCategory = e.target.dataset.cat;
        render();
    }
});

// Inicialização total
document.addEventListener('DOMContentLoaded', () => {
    init();
    // Ativa os filtros se os elementos existirem
    document.getElementById('searchField')?.addEventListener('input', render);
    document.getElementById('sortOrder')?.addEventListener('change', render);
});