// orca-cart.js
class OrcaCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('orca_cart')) || [];
        this.init();
    }

    init() {
        this.updateCartCount();
        this.renderCart();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Gestion globale de l'UI (Ouvrir/Fermer)
        document.addEventListener('click', (e) => {
            // Ouvrir le panier au clic sur l'icône du header
            if (e.target.closest('#cart-toggle')) {
                this.openCart();
            }
            
            // Fermer le panier
            if (e.target.closest('#close-cart') || e.target.closest('#cart-overlay')) {
                this.closeCart();
            }
            
            // Retirer un article
            if (e.target.classList.contains('remove-item')) {
                const cb = e.target.dataset.cb;
                this.removeItem(cb);
            }
        });
    }

    addItem(cb) {
        // Trouver le produit dans les données globales
        const product = window.ORCA_PRODUCTS.find(p => p.cb === cb);
        if (!product) return;

        // Vérifier si déjà présent
        const existing = this.items.find(item => item.cb === cb);
        if (existing) {
            existing.quantity += 1;
        } else {
            this.items.push({
                cb: product.cb,
                nom: product.nom,
                prix: product.prix_promo > 0 ? product.prix_promo : product.prix,
                quantity: 1
            });
        }

        this.save();
        this.openCart();
        this.showFeedback("Article ajouté !");
    }

    removeItem(cb) {
        this.items = this.items.filter(item => item.cb !== cb);
        this.save();
    }

    save() {
        localStorage.setItem('orca_cart', JSON.stringify(this.items));
        this.updateCartCount();
        this.renderCart();
    }

    updateCartCount() {
        const counts = document.querySelectorAll('.cart-count');
        const totalQty = this.items.reduce((sum, item) => sum + item.quantity, 0);
        counts.forEach(el => {
            el.textContent = totalQty;
            el.style.display = totalQty > 0 ? 'flex' : 'none';
        });
    }

    openCart() {
        document.getElementById('cart-drawer').classList.add('active');
        document.getElementById('cart-overlay').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeCart() {
        document.getElementById('cart-drawer').classList.remove('active');
        document.getElementById('cart-overlay').classList.remove('active');
        document.body.style.overflow = '';
    }

    renderCart() {
        const container = document.getElementById('cart-items-list');
        if (!container) return;

        if (this.items.length === 0) {
            container.innerHTML = '<div class="empty-cart-msg">Votre panier est vide</div>';
            document.getElementById('cart-total').textContent = '0 FCFA';
            return;
        }

        let total = 0;
        container.innerHTML = this.items.map(item => {
            total += item.prix * item.quantity;
            return `
                <div class="cart-item">
                    <img src="assets/produits/${item.cb}.jpg" alt="${item.nom}" class="cart-item-img" onerror="this.src='assets/images/placeholder.png'">
                    <div class="cart-item-info">
                        <h4>${item.nom}</h4>
                        <div class="cart-item-price">${item.prix.toLocaleString()} FCFA ${item.quantity > 1 ? ' x ' + item.quantity : ''}</div>
                        <button class="remove-item" data-cb="${item.cb}">Supprimer</button>
                    </div>
                </div>
            `;
        }).join('');

        document.getElementById('cart-total').textContent = total.toLocaleString() + ' FCFA';
    }

    showFeedback(msg) {
        // Optionnel : un petit toast ou alerte
        console.log(msg);
    }
}

// Initialisation globale
window.orcaCart = new OrcaCart();
