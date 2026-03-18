const API_URL = 'https://www.datamarked.dk/?id=8016&apikey=AA99444E55D533FA3C0FB91A991CCA2C465F7C2BE0C89C4826A1852957DE2959';
let allProducts = [];

async function loadData() {
    try {
        const res = await fetch(API_URL);
        const data = await res.json();
        allProducts = data.map(i => ({
            title: i.title,
            price: parseFloat(String(i.price).replace(',', '.')),
            image: i.image,
            link: i.link,
            stock: parseInt(i.stock) || 0,
            // Tenta extrair categoria do título (ex: PLA, PETG)
            category: i.title.toUpperCase().includes('PLA') ? 'PLA' : 
                      i.title.toUpperCase().includes('PETG') ? 'PETG' : 
                      i.title.toUpperCase().includes('SILK') ? 'SILK' : 'Andre'
        }));
        render();
    } catch (e) { console.error("Erro ao carregar dados", e); }
}

function render() {
    const grid = document.getElementById('productGrid');
    if (!grid) return;

    const isHome = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/');
    
    // Captura valores dos filtros (apenas se existirem na página)
    const searchQuery = document.getElementById('searchField')?.value.toLowerCase() || '';
    const categoryFilter = document.getElementById('categoryFilter')?.value || 'all';
    const stockFilter = document.getElementById('stockFilter')?.checked || false;
    const sortOrder = document.getElementById('sortOrder')?.value || 'default';

    // 1. Filtragem
    let list = allProducts.filter(p => {
        const matchesSearch = p.title.toLowerCase().includes(searchQuery);
        const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
        const matchesStock = !stockFilter || p.stock > 0;
        return matchesSearch && matchesCategory && matchesStock;
    });

    // 2. Ordenação
    if (sortOrder === 'low') list.sort((a, b) => a.price - b.price);
    if (sortOrder === 'high') list.sort((a, b) => b.price - a.price);

    // 3. Limite da Home
    if (isHome && searchQuery === '' && categoryFilter === 'all') {
        list = list.slice(0, 8);
    }

    // Atualiza contador de resultados
    const countEl = document.getElementById('count');
    if (countEl) countEl.innerText = `${list.length} produkter fundet`;

    grid.innerHTML = list.map(p => `
        <article class="product-card">
            <div class="img-wrapper"><img src="${p.image}" alt="${p.title}"></div>
            <div class="product-info">
                <span class="stock-tag ${p.stock > 0 ? 'in' : 'out'}">
                    ${p.stock > 0 ? '● På lager' : '○ Udsolgt'}
                </span>
                <h3>${p.title}</h3>
                <div class="price">${p.price.toFixed(2)} kr.</div>
                <a href="${p.link}" target="_blank" class="btn-buy">KØB NU</a>
            </div>
        </article>
    `).join('');
}

// Event listeners para filtros
document.addEventListener('change', (e) => {
    if (e.target.classList.contains('filter-input')) render();
});
document.addEventListener('input', (e) => {
    if (e.target.id === 'searchField') render();
});

document.addEventListener('DOMContentLoaded', loadData);