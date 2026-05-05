document.addEventListener('DOMContentLoaded', () => {
    // 1. Header Sticky Logic
    const header = document.getElementById('main-header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 2. Scroll Reveal Animations
    function reveal() {
        var reveals = document.querySelectorAll('.reveal');
        
        for (var i = 0; i < reveals.length; i++) {
            var windowHeight = window.innerHeight;
            var elementTop = reveals[i].getBoundingClientRect().top;
            var elementVisible = 100;
            
            if (elementTop < windowHeight - elementVisible) {
                reveals[i].classList.add('active');
            }
        }
    }
    
    // Check elements on load
    // Wait for the intro animation to finish before revealing the hero section
    setTimeout(() => {
        reveal();
    }, 3200); // L'intro prend désormais environ 3.2s
    
    // Check elements on scroll
    window.addEventListener('scroll', reveal);
    
    // 3. Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if(targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Offset for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    // 4. Global Search Activation (Overlay)
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.getElementById('search-overlay');
    const closeSearch = document.getElementById('close-search');
    const globalSearchInput = document.getElementById('global-search-input');

    if (searchToggle && searchOverlay) {
        searchToggle.addEventListener('click', () => {
            searchOverlay.classList.add('active');
            setTimeout(() => globalSearchInput.focus(), 100);
            document.body.style.overflow = 'hidden'; // Bloquer le scroll
        });

        const hideSearch = () => {
            searchOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        closeSearch.addEventListener('click', hideSearch);

        // Fermer avec Echap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && searchOverlay.classList.contains('active')) {
                hideSearch();
            }
        });

        // Gérer la recherche (Live Suggestions)
        globalSearchInput.addEventListener('input', (e) => {
            const query = globalSearchInput.value.trim();
            const preview = document.getElementById('search-results-preview');
            
            if (query.length < 2) {
                preview.classList.remove('active');
                return;
            }

            if (!window.ORCA_PRODUCTS) return;

            const normalize = (str) => {
                if (!str) return "";
                return str.normalize('NFD')
                          .replace(/[\u0300-\u036f]/g, "")
                          .toLowerCase()
                          .replace(/s\b/g, "");
            };

            const queryTokens = normalize(query).split(/\s+/).filter(t => t.length > 0);
            const matches = window.ORCA_PRODUCTS.filter(p => {
                const searchPool = normalize(`${p.nom} ${p.cb} ${p.ref || ''} ${p.secteur || ''}`);
                return queryTokens.every(token => searchPool.includes(token));
            }).slice(0, 5); // Max 5 suggestions

            if (matches.length > 0) {
                preview.innerHTML = matches.map(p => `
                    <a href="boutique.html?cb=${p.cb}" class="preview-item">
                        <img src="assets/produits/${p.cb}.jpg" class="preview-img" onerror="this.src='assets/images/placeholder.png'">
                        <div class="preview-info">
                            <h4>${p.nom}</h4>
                            <p>${p.secteur}</p>
                        </div>
                    </a>
                `).join('');
                preview.classList.add('active');
            } else {
                preview.innerHTML = '<div class="preview-no-results">Aucun article trouvé...</div>';
                preview.classList.add('active');
            }
        });

        globalSearchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && globalSearchInput.value.trim() !== '') {
                const query = encodeURIComponent(globalSearchInput.value.trim());
                window.location.href = `boutique.html?q=${query}`;
            }
        });
    }

    // 5. Initialisation du Panier sur toutes les pages
    if (window.orcaCart) {
        window.orcaCart.updateCartCount();
    }
});
