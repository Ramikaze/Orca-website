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
    // 4. Global Search Activation
    const searchToggle = document.getElementById('search-toggle');
    const searchBar = document.getElementById('header-search-bar');
    const searchInput = document.getElementById('header-search-input');

    if (searchToggle && searchBar) {
        searchToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            searchBar.classList.toggle('active');
            if (searchBar.classList.contains('active')) {
                searchInput.focus();
            }
        });

        // Fermer la recherche si on clique ailleurs
        document.addEventListener('click', (e) => {
            if (!searchBar.contains(e.target) && !searchToggle.contains(e.target)) {
                searchBar.classList.remove('active');
            }
        });

        // Gérer la recherche
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && searchInput.value.trim() !== '') {
                const query = encodeURIComponent(searchInput.value.trim());
                window.location.href = `boutique.html?q=${query}`;
            }
        });
    }

    // 5. Initialisation du Panier sur toutes les pages
    if (window.orcaCart) {
        window.orcaCart.updateCartCount();
    }
});
