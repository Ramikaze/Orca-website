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
            // Retirer un article
            if (e.target.classList.contains('remove-item')) {
                const cb = e.target.dataset.cb;
                this.removeItem(cb);
            }
            
            // Finaliser la liste (Devis)
            const checkoutBtn = e.target.closest('.checkout-btn');
            if (checkoutBtn) {
                this.generateQuotation();
                
                // Lancer l'effet "WAW" confettis
                if (window.confetti) {
                    confetti({
                        particleCount: 200,
                        spread: 120,
                        origin: { y: 0.5 },
                        colors: ['#00A650', '#FBDE02', '#ED1C24'],
                        zIndex: 10000,
                        startVelocity: 45,
                        gravity: 2.5,
                        ticks: 120,
                        disableForReducedMotion: true
                    });
                }
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

    generateQuotation() {
        if (this.items.length === 0) {
            alert("Votre panier est vide.");
            return;
        }

        const overlay = document.getElementById('quotation-overlay');
        const content = document.getElementById('quotation-content');
        
        if (!overlay || !content) {
            console.error("Éléments de devis manquants dans le HTML.");
            // Fallback : au cas où l'overlay est absent, on peut tenter l'ancienne méthode ?
            // Mais ici on va juste avertir.
            return;
        }

        const total = this.items.reduce((sum, item) => sum + item.prix * item.quantity, 0);
        const date = new Date().toLocaleDateString('fr-FR');

        let html = `
            <div class="print-container">
                <div class="quote-header">
                    <img src="assets/images/logo.png" class="quote-logo">
                    <div class="quote-meta">
                        <h1>MA SÉLECTION</h1>
                        <p>Date : ${date}</p>
                    </div>
                </div>
                
                <table class="quote-table">
                    <thead>
                        <tr>
                            <th>Photo</th>
                            <th>Désignation</th>
                            <th>Code-Barre</th>
                            <th>Prix Unitaire</th>
                            <th>Qté</th>
                            <th style="text-align:right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${this.items.map(item => `
                            <tr>
                                <td><img src="assets/produits/${item.cb}.jpg" class="quote-item-img" onerror="this.onerror=null; this.src='assets/images/placeholder.png'"></td>
                                <td><strong>${item.nom}</strong></td>
                                <td><span class="quote-cb">${item.cb}</span></td>
                                <td>${item.prix.toLocaleString()} FCFA</td>
                                <td>${item.quantity}</td>
                                <td style="text-align:right; font-weight:bold;">${(item.prix * item.quantity).toLocaleString()} FCFA</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>

                <div class="quote-total-section">
                    <div class="quote-total-box">
                        <span>Total Estimé</span>
                        <span class="total-val">${total.toLocaleString()} FCFA</span>
                    </div>
                </div>

                <div class="quote-disclaimer">
                    <strong>Note importante :</strong> Ce document facilite l'établissement d'un devis officiel en magasin. 
                    Prix et stocks indicatifs à confirmer par un conseiller ORCA. 
                    <br><br>
                    <em>Présentez ce document à un vendeur pour trouver rapidement vos articles.</em>
                </div>

                <div class="quote-actions no-print">
                    <button class="print-main-btn" onclick="window.print()">Imprimer ou Enregistrer en PDF</button>
                    <p>Présentez ce document en magasin pour un service rapide.</p>
                </div>
            </div>
        `;

        content.innerHTML = html;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';

        // Event listener pour fermer
        const closeBtn = document.getElementById('close-quotation');
        if (closeBtn) {
            closeBtn.onclick = () => {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            };
        }
        
        // Fermer au clic sur l'overlay
        overlay.onclick = (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                document.body.style.overflow = '';
            }
        };
    }
}

// Initialisation globale
window.orcaCart = new OrcaCart();
