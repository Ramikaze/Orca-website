// ============================================================
// Variables Globales
// ============================================================
let allProducts = [];
let filteredProducts = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 50;

// Filtres actifs
let filters = {
    search: '',
    secteur: null,
    famille: null,
    sousFamille: null,
    stockOnly: false,
    promoOnly: false,
    sort: 'nom'
};

// ============================================================
// Initialisation
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
    // Détection recherche URL
    const urlParams = new URLSearchParams(window.location.search);
    const query = urlParams.get('q');
    if (query) {
        filters.search = query;
        document.getElementById('search-input').value = query;
    }

    loadProducts();
    setupEventListeners();
});

// ============================================================
// Chargement des données
// ============================================================
async function loadProducts() {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '<div class="loader">Chargement du catalogue...</div>';

    try {
        if (window.ORCA_PRODUCTS) {
            allProducts = window.ORCA_PRODUCTS;
            applyFiltersAndRender();
            buildSecteurPills();

            // OUVIR LA MODALE SI ON VIENT D'UNE RECHERCHE (paramètre cb)
            const urlParams = new URLSearchParams(window.location.search);
            const cbParam = urlParams.get('cb');
            if (cbParam) {
                // Léger délai pour s'assurer que le DOM est prêt
                setTimeout(() => window.openModalById(cbParam), 100);
            }
        } else {
            throw new Error("Données introuvables.");
        }
    } catch (e) {
        grid.innerHTML = '<div class="no-results"><h3>Erreur de chargement du catalogue.</h3></div>';
        console.error(e);
    }
}

// ============================================================
// Construction des Pilules (Secteurs, Familles)
// ============================================================
function buildSecteurPills() {
    const container = document.getElementById('secteur-pills');
    
    // Compter les secteurs
    const counts = {};
    allProducts.forEach(p => {
        if(p.secteur) {
            counts[p.secteur] = (counts[p.secteur] || 0) + 1;
        }
    });

    // Trier les secteurs par nom
    const secteurs = Object.keys(counts).sort();

    // Bouton "Tous les secteurs"
    let html = `<button class="pill-btn ${!filters.secteur ? 'active' : ''}" data-secteur="">
        Tous les secteurs
        <span class="pill-count">${allProducts.length}</span>
    </button>`;

    secteurs.forEach(s => {
        const isActive = filters.secteur === s;
        html += `<button class="pill-btn ${isActive ? 'active' : ''}" data-secteur="${s}">
            ${s}
            <span class="pill-count">${counts[s]}</span>
        </button>`;
    });

    container.innerHTML = html;

    // Events
    container.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filters.secteur = e.currentTarget.dataset.secteur || null;
            filters.famille = null;
            filters.sousFamille = null;
            applyFiltersAndRender();
            buildSecteurPills(); // Re-render to update active state
            updateSubPills();
        });
    });
}

function updateSubPills() {
    const familleWrapper = document.getElementById('famille-track-wrapper');
    const sousFamilleWrapper = document.getElementById('sous-famille-track-wrapper');
    const familleContainer = document.getElementById('famille-pills');
    const sousFamilleContainer = document.getElementById('sous-famille-pills');

    if (!filters.secteur) {
        familleWrapper.style.display = 'none';
        sousFamilleWrapper.style.display = 'none';
        return;
    }

    familleWrapper.style.display = 'block';

    // Filtrer les produits pour le secteur sélectionné
    const sectorProducts = allProducts.filter(p => p.secteur === filters.secteur);
    
    const counts = {};
    sectorProducts.forEach(p => {
        if(p.famille) {
            counts[p.famille] = (counts[p.famille] || 0) + 1;
        }
    });

    const familles = Object.keys(counts).sort();

    let html = `<button class="pill-btn ${!filters.famille ? 'active' : ''}" data-famille="">Toutes les familles</button>`;
    
    familles.forEach(f => {
        const isActive = filters.famille === f;
        html += `<button class="pill-btn ${isActive ? 'active' : ''}" data-famille="${f}">${f}</button>`;
    });

    familleContainer.innerHTML = html;

    // Events Familles
    familleContainer.querySelectorAll('.pill-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            filters.famille = e.currentTarget.dataset.famille || null;
            filters.sousFamille = null;
            applyFiltersAndRender();
            updateSubPills(); // Re-render to update active state
        });
    });

    // SOUS-FAMILLES
    if (!filters.famille) {
        sousFamilleWrapper.style.display = 'none';
        return;
    }

    const familleProducts = sectorProducts.filter(p => p.famille === filters.famille);
    const sfCounts = {};
    familleProducts.forEach(p => {
        if(p.sous_famille) {
            sfCounts[p.sous_famille] = (sfCounts[p.sous_famille] || 0) + 1;
        }
    });

    const sousFamilles = Object.keys(sfCounts).sort();
    if (sousFamilles.length > 0) {
        sousFamilleWrapper.style.display = 'block';
        let sfHtml = `<button class="pill-btn ${!filters.sousFamille ? 'active' : ''}" data-sf="">Toutes sous-catégories</button>`;
        sousFamilles.forEach(sf => {
            const isActive = filters.sousFamille === sf;
            sfHtml += `<button class="pill-btn ${isActive ? 'active' : ''}" data-sf="${sf}">${sf}</button>`;
        });
        sousFamilleContainer.innerHTML = sfHtml;

        sousFamilleContainer.querySelectorAll('.pill-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                filters.sousFamille = e.currentTarget.dataset.sf || null;
                applyFiltersAndRender();
                updateSubPills();
            });
        });
    } else {
        sousFamilleWrapper.style.display = 'none';
    }
}

// ============================================================
// Écouteurs d'événements
// ============================================================
function setupEventListeners() {
    const searchInput = document.getElementById('search-input');
    const filterStock = document.getElementById('filter-stock');
    const filterPromo = document.getElementById('filter-promo');
    const sortSelect = document.getElementById('sort-select');

    searchInput.addEventListener('input', (e) => {
        filters.search = e.target.value;
        applyFiltersAndRender();
    });

    filterStock.addEventListener('change', (e) => {
        filters.stockOnly = e.target.checked;
        applyFiltersAndRender();
    });

    filterPromo.addEventListener('change', (e) => {
        filters.promoOnly = e.target.checked;
        applyFiltersAndRender();
    });

    sortSelect.addEventListener('change', (e) => {
        filters.sort = e.target.value;
        applyFiltersAndRender();
    });

    // Reset Filters
    const resetBtn = document.getElementById('reset-filters');
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            filters.search = '';
            filters.secteur = null;
            filters.famille = null;
            filters.sousFamille = null;
            filters.stockOnly = false;
            filters.promoOnly = false;
            filters.sort = 'nom';

            // Reset UI
            searchInput.value = '';
            filterStock.checked = false;
            filterPromo.checked = false;
            sortSelect.value = 'nom';

            // Re-render
            renderSecteurs(); // Pour remettre "Tous les secteurs" en actif
            applyFiltersAndRender();
        });
    }
}

// ============================================================
// Filtrage et Tri
// ============================================================
function applyFiltersAndRender() {
    let result = [...allProducts];

    // Recherche Ultra-Intelligente (Multi-mots, Pluriels, Accents)
    if (filters.search) {
        const normalize = (str) => {
            if (!str) return "";
            return str.normalize('NFD')
                      .replace(/[\u0300-\u036f]/g, "") // Supprime accents
                      .toLowerCase()
                      .replace(/s\b/g, ""); // Supprime les 's' en fin de mot (pluriels simples)
        };

        const queryTokens = normalize(filters.search).split(/\s+/).filter(t => t.length > 0);
        
        result = result.filter(p => {
            const searchPool = normalize(`${p.nom} ${p.cb} ${p.ref || ''} ${p.secteur || ''} ${p.famille || ''} ${p.sous_famille || ''}`);
            return queryTokens.every(token => searchPool.includes(token));
        });
    }

    // Secteur / Famille
    if (filters.secteur) result = result.filter(p => p.secteur === filters.secteur);
    if (filters.famille) result = result.filter(p => p.famille === filters.famille);
    if (filters.sousFamille) result = result.filter(p => p.sous_famille === filters.sousFamille);

    // Dispo / Promo
    if (filters.stockOnly) result = result.filter(p => p.stock_total > 0);
    if (filters.promoOnly) result = result.filter(p => p.prix_promo > 0);

    // Tri
    result.sort((a, b) => {
        if (filters.sort === 'nom') return a.nom.localeCompare(b.nom);
        if (filters.sort === 'prix-asc') {
            const pA = a.prix_promo > 0 ? a.prix_promo : a.prix;
            const pB = b.prix_promo > 0 ? b.prix_promo : b.prix;
            return pA - pB;
        }
        if (filters.sort === 'prix-desc') {
            const pA = a.prix_promo > 0 ? a.prix_promo : a.prix;
            const pB = b.prix_promo > 0 ? b.prix_promo : b.prix;
            return pB - pA;
        }
        if (filters.sort === 'stock') return b.stock_total - a.stock_total;
        return 0;
    });

    filteredProducts = result;
    currentPage = 1;
    
    updateActiveTags();
    updateResultCount();
    renderPage();
}

function updateResultCount() {
    document.getElementById('result-count').textContent = `${filteredProducts.length} article${filteredProducts.length > 1 ? 's' : ''}`;
}

function updateActiveTags() {
    const container = document.getElementById('active-filters');
    let tags = '';

    if (filters.search) {
        tags += `<span class="active-filter-tag">Recherche: "${filters.search}" <button onclick="clearFilter('search')">&times;</button></span>`;
    }
    if (filters.stockOnly) {
        tags += `<span class="active-filter-tag">En stock <button onclick="clearFilter('stock')">&times;</button></span>`;
    }
    if (filters.promoOnly) {
        tags += `<span class="active-filter-tag">En promotion <button onclick="clearFilter('promo')">&times;</button></span>`;
    }

    container.innerHTML = tags;
}

window.clearFilter = function(type) {
    if (type === 'search') {
        filters.search = '';
        document.getElementById('search-input').value = '';
    } else if (type === 'stock') {
        filters.stockOnly = false;
        document.getElementById('filter-stock').checked = false;
    } else if (type === 'promo') {
        filters.promoOnly = false;
        document.getElementById('filter-promo').checked = false;
    }
    applyFiltersAndRender();
};

// ============================================================
// Rendu Grille
// ============================================================
function renderPage() {
    const grid = document.getElementById('products-grid');
    const pagination = document.getElementById('pagination');

    if (filteredProducts.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
                <h3>Aucun article trouvé</h3>
                <p>Modifiez vos filtres ou votre recherche.</p>
            </div>
        `;
        grid.className = 'products-grid'; // Reset class
        pagination.innerHTML = '';
        return;
    }

    // Calcul de la pagination
    const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    const slice = filteredProducts.slice(start, start + ITEMS_PER_PAGE);

    // Rendu des cartes sans délai
    grid.innerHTML = slice.map((p, index) => createCardHTML(p, index)).join('');

    // Rendu pagination
    renderPagination(totalPages);
}

function initRevealAnimation() {
    const cards = document.querySelectorAll('.product-card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal-active');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => observer.observe(card));
}

function createCardHTML(p, index) {
    const stockBadge = p.stock_total > 0 
        ? '<span class="card-stock-badge stock-dispo">En stock</span>'
        : '<span class="card-stock-badge stock-rupture">Rupture</span>';

    const formatPrice = (val) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
    let priceHTML = `<span class="prix-actuel">${formatPrice(p.prix)}</span>`;
    
    if (p.prix_promo > 0) {
        priceHTML = `
            <span class="prix-actuel" style="color: #DC241F;">${formatPrice(p.prix_promo)}</span>
            <span class="prix-barre">${formatPrice(p.prix)}</span>
            <span class="badge-promo">PROMO</span>
        `;
    }

    return `
        <div class="product-card" data-cb="${p.cb}" onclick="openModalById('${p.cb}')">
            ${stockBadge}
            <div class="card-img">
                <img src="assets/produits/${p.cb}.jpg" alt="${p.nom}" loading="lazy" onerror="this.onerror=null; this.src='assets/images/placeholder.png';">
                <button class="add-to-cart-btn-small add-to-cart-btn" data-cb="${p.cb}" onclick="event.stopPropagation(); window.orcaCart.addItem('${p.cb}');" title="Ajouter au panier">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M5 12h14M12 5v14"/>
                    </svg>
                </button>
            </div>
            <div class="card-body">
                <div class="card-secteur">${p.secteur || 'Divers'}</div>
                <h3 class="card-nom" title="${p.nom}">${p.nom}</h3>
                <div class="card-prix">${priceHTML}</div>
            </div>
        </div>
    `;
}

window.openModalById = function(cb) {
    const p = allProducts.find(x => x.cb === cb);
    if (p) openModal(p);
};

// ============================================================
// Pagination Visuelle
// ============================================================
function renderPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }

    let html = `<button class="page-btn" ${currentPage === 1 ? 'disabled' : ''} onclick="goToPage(${currentPage - 1})">Précédent</button>`;

    // Afficher un maximum de 5 boutons de page
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    if (startPage > 1) {
        html += `<button class="page-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) html += `<span>...</span>`;
    }

    for (let i = startPage; i <= endPage; i++) {
        html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goToPage(${i})">${i}</button>`;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) html += `<span>...</span>`;
        html += `<button class="page-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    html += `<button class="page-btn" ${currentPage === totalPages ? 'disabled' : ''} onclick="goToPage(${currentPage + 1})">Suivant</button>`;

    pagination.innerHTML = html;
}

window.goToPage = function(page) {
    currentPage = page;
    renderPage();
    window.scrollTo({ top: document.querySelector('.pills-navigation-section').offsetTop, behavior: 'smooth' });
};

// ============================================================
// Modal Fiche Produit
// ============================================================
function openModal(p) {
    const modal = document.getElementById('product-modal');
    
    // Image
    const imgEl = document.getElementById('modal-img');
    const placeholderEl = document.getElementById('modal-img-placeholder');
    
    imgEl.src = p.image;
    imgEl.style.display = 'block';
    placeholderEl.style.display = 'none';

    imgEl.onerror = () => {
        imgEl.style.display = 'none';
        placeholderEl.style.display = 'flex';
    };

    // Textes
    document.getElementById('modal-secteur').textContent = p.secteur;
    document.getElementById('modal-nom').textContent = p.nom;
    document.getElementById('modal-cb').textContent = p.cb;
    
    document.getElementById('modal-famille').textContent = p.famille || '';
    document.getElementById('modal-sous-famille').textContent = p.sous_famille || '';

    // Stocks
    document.getElementById('modal-stock-mag').textContent = p.stock_mag;
    document.getElementById('modal-stock-depot').textContent = p.stock_depot;

    // Prix
    const formatPrice = (val) => new Intl.NumberFormat('fr-FR').format(val) + ' FCFA';
    const prixNormal = document.getElementById('modal-prix');
    const prixPromo = document.getElementById('modal-prix-promo');

    if (p.prix_promo > 0) {
        prixNormal.textContent = formatPrice(p.prix);
        prixNormal.className = 'prix-normal barred';
        prixPromo.textContent = formatPrice(p.prix_promo);
        prixPromo.style.display = 'inline-block';
    } else {
        prixNormal.textContent = formatPrice(p.prix);
        prixNormal.className = 'prix-normal';
        prixPromo.style.display = 'none';
    }

    // Bouton Ajout Panier Modal
    const modalFooter = document.querySelector('.modal-info-side');
    let cartBtn = document.getElementById('modal-add-to-cart');
    if (!cartBtn) {
        cartBtn = document.createElement('button');
        cartBtn.id = 'modal-add-to-cart';
        cartBtn.className = 'add-to-cart-large'; // Changement vers -large pour éviter le conflit avec le petit bouton
        cartBtn.style.marginTop = '2rem';
        modalFooter.appendChild(cartBtn);
    }
    cartBtn.textContent = 'Ajouter à ma sélection';
    cartBtn.dataset.cb = p.cb;
    cartBtn.onclick = () => window.orcaCart.addItem(p.cb);

    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('product-modal').style.display = 'none';
    document.body.style.overflow = '';
});

document.getElementById('product-modal').addEventListener('click', (e) => {
    if (e.target.id === 'product-modal') {
        document.getElementById('product-modal').style.display = 'none';
        document.body.style.overflow = '';
    }
});

// Bouton Retour en Haut
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('visible');
        } else {
            backToTopBtn.classList.remove('visible');
        }
    });
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}
